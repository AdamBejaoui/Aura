const express = require('express');
const Order = require('../models/Order');
const Product = require('../models/Product');
const Coupon = require('../models/Coupon');
const { authenticateToken } = require('../middleware/auth');
const { sendOrderNotification } = require('../utils/emailService');

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

// Get user's orders
router.get('/my-orders', authenticateToken, async (req, res) => {
  try {
    // Find orders by userId (if registered) or match email if we want to be fancy later
    // Currently relying on userId being saved with order
    const orders = await Order.find({
      $or: [
        { userId: req.user.userId },
        { email: req.user.email?.toLowerCase() }
      ]
    }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all orders (admin only)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
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
    const order = await Order.findById(req.params.id).populate('items.productId', 'name');
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;