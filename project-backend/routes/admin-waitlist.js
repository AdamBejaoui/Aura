const express = require('express');
const Waitlist = require('../models/Waitlist');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get all waitlist entries with product info (admin only)
router.get('/', authenticateToken, async (req, res) => {
    try {
        if (!['admin', 'co-admin'].includes(req.user.role)) {
            return res.status(403).json({ message: 'Access denied' });
        }

        const waitlist = await Waitlist.find({ notified: false })
            .populate('productId', 'name images inStock')
            .sort({ createdAt: -1 });

        res.json(waitlist);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
