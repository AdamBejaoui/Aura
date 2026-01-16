const express = require('express');
const router = express.Router();
const Waitlist = require('../models/Waitlist');

// @route   POST api/waitlist
// @desc    Join waitlist for a product
// @access  Public
router.post('/', async (req, res) => {
    const { email, productId } = req.body;

    if (!email || !productId) {
        return res.status(400).json({ message: 'Email and Product ID are required' });
    }

    try {
        // Check if already on waitlist
        const existing = await Waitlist.findOne({ email, productId });
        if (existing) {
            return res.status(200).json({ message: 'You are already on the waitlist for this item' });
        }

        const waitlistEntry = new Waitlist({
            email,
            productId
        });

        await waitlistEntry.save();
        res.status(201).json({ message: 'Joined waitlist successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
