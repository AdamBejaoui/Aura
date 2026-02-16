const express = require('express');
const jwt = require('jsonwebtoken');
const Order = require('../models/Order');
const Product = require('../models/Product');
const Coupon = require('../models/Coupon');
const { authenticateToken } = require('../middleware/auth');
const { sendOrderNotification, sendStatusUpdateEmail } = require('../utils/emailService');

const router = express.Router();

// Create new order (public)
router.post('/', async (req, res) => {
  try {
    // Validate products exist and get current prices
    const items = [];
    const productDetails = []; // For email
    let total = 0;

    for (const item of req.body.items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(400).json({ message: `Product ${item.productId} not found` });
      }
      items.push({
        productId: product._id,
        quantity: item.quantity,
        price: product.price,
        size: item.size
      });
      productDetails.push({
        name: product.name,
        quantity: item.quantity,
        price: product.price
      });
      total += product.price * item.quantity;
    }

    // Apply coupon if provided
    let discountAmount = 0;
    let appliedCoupon = null;
    if (req.body.couponCode) {
      const coupon = await Coupon.findOne({
        code: req.body.couponCode.toUpperCase(),
        isActive: true,
        expiryDate: { $gt: new Date() }
      });

      if (coupon) {
        discountAmount = (total * coupon.discountPercent) / 100;
        total -= discountAmount;
        appliedCoupon = {
          code: coupon.code,
          discountPercent: coupon.discountPercent
        };
        // Increment usage count
        coupon.usageCount += 1;
        await coupon.save();
      }
    }

    const order = new Order({
      fullName: req.body.fullName,
      phone: req.body.phone,
      address: req.body.address,
      email: req.body.email,
      userId: (req.body.userId && req.body.userId !== "") ? req.body.userId : undefined,
      items,
      total,
      coupon: appliedCoupon,
      discountAmount,
      paymentMethod: req.body.paymentMethod || 'cod'
    });

    const newOrder = await order.save();

    // Send email notification (async, don't wait for it)
    sendOrderNotification(newOrder, productDetails).catch(err =>
      console.error('Email notification failed:', err)
    );

    res.status(201).json(newOrder);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get user's orders (paginated)
router.get('/my-orders', authenticateToken, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const query = {
      $or: [
        { userId: req.user.userId },
        { email: req.user.email?.toLowerCase() }
      ]
    };

    const [orders, total] = await Promise.all([
      Order.find(query)
        .populate('items.productId', 'name images')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Order.countDocuments(query)
    ]);

    res.json({
      orders,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all orders (admin only - paginated)
router.get('/', authenticateToken, async (req, res) => {
  try {
    // Basic role check
    if (!['admin', 'co-admin'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      Order.find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Order.countDocuments()
    ]);

    res.json({
      orders,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update order status (admin only)
router.patch('/:id/status', authenticateToken, async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Notify customer (async)
    if (['confirmed', 'shipped', 'delivered', 'cancelled'].includes(status)) {
      sendStatusUpdateEmail(order)
        .then(async () => {
          await Order.findByIdAndUpdate(order._id, {
            $push: { notificationHistory: { status, sentAt: new Date(), type: 'email' } }
          });
        })
        .catch(err =>
          console.error('Failed to send status update email:', err)
        );
    }

    res.json(order);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete order (admin only)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.json({ message: 'Order deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Cancel order (user only)
router.put('/:id/cancel', authenticateToken, async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      userId: req.user.userId
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.status !== 'pending') {
      return res.status(400).json({ message: 'Only pending orders can be cancelled' });
    }

    order.status = 'cancelled';
    await order.save();

    res.json({ message: 'Order cancelled successfully', order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single order (public for success page)
router.get('/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('items.productId', 'name images prices');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Attempt to verify token if present
    let isAdmin = false;
    let isOwner = false;
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (decoded.role === 'admin' || decoded.role === 'co-admin') {
          isAdmin = true;
        }
        if (decoded.userId === order.userId?.toString() || decoded.email === order.email) {
          isOwner = true;
        }
      } catch (err) {
        // Invalid token, ignore and treat as guest
      }
    }

    if (isAdmin || isOwner) {
      return res.json(order);
    }

    // Public sanitized version for Success page
    const sanitizedOrder = {
      _id: order._id,
      items: order.items,
      total: order.total,
      status: order.status,
      createdAt: order.createdAt,
      // PII Omitted: fullName, phone, address, email
    };

    res.json(sanitizedOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;