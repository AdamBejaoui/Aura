// routes/auth.js
const express = require('express');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const { authenticateToken } = require('../middleware/auth');
const { sendVerificationEmail } = require('../utils/emailService');
require('dotenv').config();

const router = express.Router();

// Register a new user
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const verificationCodeExpires = new Date(Date.now() + 3600000); // 1 hour

    user = new User({
      name,
      email,
      password,
      isVerified: false,
      verificationCode,
      verificationCodeExpires
    });

    await user.save();

    const emailSent = await sendVerificationEmail(email, verificationCode);

    if (!emailSent) {
      // Optionally handle email failure (e.g. delete user or warn)
      console.error("Failed to send verification email");
    }

    res.status(201).json({
      message: 'Registration successful! Please check your email for the verification code.',
      requiresVerification: true,
      email: email // Return email to help frontend state
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Verify Email
router.post('/verify-email', async (req, res) => {
  try {
    const { email, code } = req.body;

    // Find user by email and basic check
    const user = await User.findOne({
      email,
      verificationCode: code,
      verificationCodeExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired verification code' });
    }

    user.isVerified = true;
    user.verificationCode = undefined;
    user.verificationCodeExpires = undefined;
    await user.save();

    const jwtToken = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({ token: jwtToken, user: { id: user._id, name: user.name, email: user.email, role: user.role } });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Resend Verification Code
router.post('/resend-verification', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: 'User is already verified' });
    }

    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const verificationCodeExpires = new Date(Date.now() + 3600000); // 1 hour

    user.verificationCode = verificationCode;
    user.verificationCodeExpires = verificationCodeExpires;
    await user.save();

    await sendVerificationEmail(email, verificationCode);

    res.json({ message: 'Verification code resent successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Check for Hardcoded Admin (Legacy/Dev Support)
    if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
      const token = jwt.sign(
        { email, role: 'admin' }, // No userId for hardcoded admin
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );
      return res.json({ token, user: { name: 'Admin', email, role: 'admin' } });
    }

    // 2. Check Database User
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    if (!user.isVerified) {
      return res.status(403).json({ message: 'Please verify your email address before logging in.' });
    }

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get current user profile
router.get('/me', authenticateToken, async (req, res) => {
  try {
    // If it's the hardcoded admin, req.user won't have userId
    if (!req.user.userId && req.user.role === 'admin') {
      return res.json({ name: 'Admin', email: req.user.email, role: 'admin' });
    }

    const user = await User.findById(req.user.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update profile
router.put('/me', authenticateToken, async (req, res) => {
  try {
    const { name, phone, address } = req.body;

    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (address) user.address = address;

    await user.save();

    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      address: user.address
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update password
router.put('/me/password', authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid current password' });
    }

    user.password = newPassword;
    await user.save(); // Pre-save hook will hash it

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// --- ADMIN ROUTES ---

// Get all users (admin and co-admin can view)
router.get('/users', authenticateToken, async (req, res) => {
  try {
    if (!['admin', 'co-admin'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied' });
    }
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update user role (admin only)
router.patch('/users/:id/role', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only admins can change user roles' });
    }

    const { role } = req.body;
    if (!['customer', 'admin', 'co-admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete user (admin only)
router.delete('/users/:id', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;