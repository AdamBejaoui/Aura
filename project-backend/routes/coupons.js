const express = require('express');
const router = express.Router();
const Coupon = require('../models/Coupon');
const { authenticateToken } = require('../middleware/auth');

// Helper to check for admin/co-admin
const checkAdmin = (req, res, next) => {
    if (!['admin', 'co-admin'].includes(req.user.role)) {
        return res.status(403).json({ message: 'Access denied: Administrative privileges required' });
    }
    next();
};

// @route   GET api/coupons
// @desc    Get all coupons
// @access  Admin
router.get('/', authenticateToken, checkAdmin, async (req, res) => {
    try {
        const coupons = await Coupon.find().sort({ createdAt: -1 });
        res.json(coupons);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error: Data retrieval failure' });
    }
});

// @route   POST api/coupons/validate
// @desc    Validate a coupon code
// @access  Public
router.post('/validate', async (req, res) => {
    const { code } = req.body;

    if (!code) {
        return res.status(400).json({ message: 'Coupon code is required' });
    }

    try {
        const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });

        if (!coupon) {
            return res.status(404).json({ message: 'Invalid coupon code' });
        }

        if (coupon.expiryDate < new Date()) {
            return res.status(400).json({ message: 'Coupon has expired' });
        }

        res.json({
            code: coupon.code,
            discountPercent: coupon.discountPercent
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   POST api/coupons
// @desc    Create a coupon
// @access  Admin
router.post('/', authenticateToken, checkAdmin, async (req, res) => {
    const { code, discountPercent, expiryDate } = req.body;

    if (!code || !discountPercent || !expiryDate) {
        return res.status(400).json({ message: 'All parameters required for authorization' });
    }

    try {
        const newCoupon = new Coupon({
            code,
            discountPercent,
            expiryDate: new Date(expiryDate),
        });

        const coupon = await newCoupon.save();
        res.json(coupon);
    } catch (err) {
        if (err.code === 11000) {
            return res.status(400).json({ message: 'Code index collision: Pattern already exists' });
        }
        console.error(err);
        res.status(500).json({ message: 'Server error: Authorization failure' });
    }
});

// @route   DELETE api/coupons/:id
// @desc    Delete a coupon
// @access  Admin
router.delete('/:id', authenticateToken, checkAdmin, async (req, res) => {
    try {
        const coupon = await Coupon.findById(req.params.id);
        if (!coupon) {
            return res.status(404).json({ message: 'Privilege not found' });
        }
        await coupon.deleteOne();
        res.json({ message: 'Privilege deactivated successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error: Termination failure' });
    }
});

module.exports = router;
