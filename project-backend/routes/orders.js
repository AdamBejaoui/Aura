const express = require('express');
const Order = require('../models/Order');
const Product = require('../models/Product');
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
        price: product.price
      });
      productDetails.push({
        name: product.name,
        quantity: item.quantity,
        price: product.price
      });
      total += product.price * item.quantity;
    }

    const order = new Order({
      ...req.body,
      items,
      total
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

module.exports = router;