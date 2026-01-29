// backend/routes/products.js
const express = require('express');
const Product = require('../models/Product');
const User = require('../models/User');
const Waitlist = require('../models/Waitlist');
const { authenticateToken } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

const router = express.Router();

// --- ADMIN ROUTES ---

// Get all reviews (admin and co-admin)
router.get('/reviews/all', authenticateToken, async (req, res) => {
  try {
    // Check for admin or co-admin role
    const user = await User.findById(req.user.userId);
    if (!user || !['admin', 'co-admin'].includes(user.role)) {
      // Allow hardcoded admin too
      if (!['admin', 'co-admin'].includes(req.user.role)) {
        return res.status(403).json({ message: 'Access denied' });
      }
    }

    // Aggregate all reviews across all products
    const reviews = await Product.aggregate([
      { $unwind: "$reviews" },
      {
        $project: {
          _id: 0,
          productId: "$_id",
          productName: "$name",
          productImage: { $arrayElemAt: ["$images", 0] },
          review: "$reviews"
        }
      },
      { $sort: { "review.createdAt": -1 } }
    ]);

    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete a specific review (admin and co-admin)
router.delete('/:id/reviews/:reviewId', authenticateToken, async (req, res) => {
  try {
    if (!['admin', 'co-admin'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { id, reviewId } = req.params;
    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Filter out the review
    const initialLength = product.reviews.length;
    product.reviews = product.reviews.filter(review => review._id.toString() !== reviewId);

    if (product.reviews.length === initialLength) {
      return res.status(404).json({ message: 'Review not found' });
    }

    product.numReviews = product.reviews.length;

    // Recalculate rating
    const totalRating = product.reviews.reduce((acc, item) => item.rating + acc, 0);
    product.rating = product.reviews.length > 0 ? totalRating / product.reviews.length : 0;

    await product.save();
    res.json({ message: 'Review deleted successfully', product });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// MIGRATION ENDPOINT: Fix all legacy reviews
router.get('/migrate-reviews', async (req, res) => {
  try {
    const result = await Product.collection.updateMany(
      {
        $or: [
          { reviews: { $exists: false } },
          { reviews: { $not: { $type: "array" } } }
        ]
      },
      {
        $set: {
          reviews: [],
          numReviews: 0,
          rating: 0
        }
      }
    );
    res.json({ message: 'Migration complete', modifiedCount: result.modifiedCount });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all products (public) with filtering and sorting
router.get('/', async (req, res) => {
  try {
    const { category, minPrice, maxPrice, inStock, sort, search, page: pageQuery, limit: limitQuery } = req.query;
    const page = parseInt(pageQuery) || 1;
    const limit = parseInt(limitQuery) || 12;
    const skip = (page - 1) * limit;

    // Build query
    const query = {};

    if (category && category !== 'All') {
      query.category = category;
    }

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }

    if (inStock === 'true') {
      query.inStock = true;
    }

    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    const [products, total] = await Promise.all([
      Product.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Product.countDocuments(query)
    ]);

    res.json({
      products,
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

// Get product by ID (public)
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new product (admin only) — supports multiple images
router.post('/', authenticateToken, upload.array('images', 10), async (req, res) => {
  try {
    let imageUrls = [];

    // Handle uploaded files
    if (req.files && Array.isArray(req.files)) {
      imageUrls = req.files.map(file => `/uploads/${file.filename}`);
    }
    // Handle image URLs (if sent as string or array in body)
    else if (req.body.images) {
      if (Array.isArray(req.body.images)) {
        imageUrls = req.body.images;
      } else {
        imageUrls = [req.body.images];
      }
    } else {
      return res.status(400).json({ message: 'At least one image is required' });
    }

    const productData = {
      name: req.body.name,
      category: req.body.category,
      price: parseFloat(req.body.price),
      description: req.body.description,
      inStock: req.body.inStock === 'true' || req.body.inStock === true,
      currency: req.body.currency || 'TND',
      images: imageUrls
    };

    const product = new Product(productData);
    const newProduct = await product.save();
    res.status(201).json(newProduct);
  } catch (error) {
    // Clean up uploaded files if product creation fails
    if (req.files) {
      req.files.forEach(file => {
        const filePath = path.join(uploadDir, file.filename);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      });
    }
    console.error('Add product error:', error);
    res.status(400).json({ message: error.message || 'Failed to create product' });
  }
});

// Update product (admin only)
router.patch('/:id', authenticateToken, upload.array('images', 10), async (req, res) => {
  try {
    const updateData = {};

    // Only include fields that are provided
    if (req.body.name !== undefined) updateData.name = req.body.name;
    if (req.body.category !== undefined) updateData.category = req.body.category;
    if (req.body.price !== undefined) updateData.price = parseFloat(req.body.price);
    if (req.body.description !== undefined) updateData.description = req.body.description;
    if (req.body.inStock !== undefined) updateData.inStock = req.body.inStock === 'true' || req.body.inStock === true;
    if (req.body.currency !== undefined) updateData.currency = req.body.currency;

    // Handle image update - merge existing with new uploads
    const oldProduct = await Product.findById(req.params.id);
    let finalImages = [];

    // Preserve existing images if provided
    if (req.body.existingImages) {
      try {
        const existingImages = JSON.parse(req.body.existingImages);
        if (Array.isArray(existingImages)) {
          finalImages = [...existingImages];
        }
      } catch (e) {
        console.error('Error parsing existingImages:', e);
      }
    } else if (oldProduct && oldProduct.images) {
      // If no existingImages provided, keep all old images
      finalImages = [...oldProduct.images];
    }

    // Add new uploaded files
    if (req.files && Array.isArray(req.files) && req.files.length > 0) {
      const newImageUrls = req.files.map(file => `/uploads/${file.filename}`);
      finalImages = [...finalImages, ...newImageUrls];
    }

    // Only update images if we have at least one
    if (finalImages.length > 0) {
      updateData.images = finalImages;

      // Delete old image files that are no longer in the list (if they were local uploads)
      if (oldProduct && oldProduct.images) {
        oldProduct.images.forEach(imgPath => {
          if (!finalImages.includes(imgPath) && imgPath.startsWith('/uploads/')) {
            const oldImagePath = path.join(__dirname, '..', imgPath);
            if (fs.existsSync(oldImagePath)) {
              fs.unlinkSync(oldImagePath);
            }
          }
        });
      }
    } else if (req.body.images !== undefined) {
      // Fallback: Use provided image URLs (could be external or existing)
      updateData.images = Array.isArray(req.body.images) ? req.body.images : [req.body.images];
    }
    // If no images provided at all, don't update the images field

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // --- Waitlist Automation Trigger ---
    if (!oldProduct.inStock && product.inStock) {
      console.log(`[WAITLIST] Signal detected: Product ${product.name} is now back in stock.`);
      try {
        const waitingUsers = await Waitlist.find({ productId: product._id, notified: false });
        if (waitingUsers.length > 0) {
          console.log(`[WAITLIST] Dispatching restock signals to ${waitingUsers.length} users.`);

          // In a real app, you would send emails here.
          // For now, we simulate and update the records.
          for (const entry of waitingUsers) {
            console.log(`[SIGNAL] Notification sent to: ${entry.email} regarding ${product.name}`);
            entry.notified = true;
            await entry.save();
          }
          console.log(`[WAITLIST] All signals dispatched successfully.`);
        }
      } catch (waitlistError) {
        console.error('[WAITLIST] Signal failure:', waitlistError);
      }
    }

    res.json(product);
  } catch (error) {
    // Clean up uploaded files if update fails
    if (req.files) {
      req.files.forEach(file => {
        const filePath = path.join(uploadDir, file.filename);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      });
    }
    console.error('Update product error:', error);
    res.status(400).json({ message: error.message || 'Failed to update product' });
  }
});

// Delete product (admin only)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Delete associated image files if they are local uploads
    if (product.images) {
      product.images.forEach(imgPath => {
        if (imgPath.startsWith('/uploads/')) {
          const imagePath = path.join(__dirname, '..', imgPath);
          if (fs.existsSync(imagePath)) {
            fs.unlinkSync(imagePath);
          }
        }
      });
    }

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

const mongoose = require('mongoose');

// Add review (public)
router.post('/:id/reviews', async (req, res) => {
  try {
    console.log('📝 Received review for product:', req.params.id);
    console.log('Review data:', req.body);
    const { name, rating, comment } = req.body;

    // AUTO-MIGRATION: Fix legacy "reviews: 0" or non-array data
    // Use raw collection access to bypass Mongoose schema validation which fails on "0"
    await Product.collection.updateOne(
      {
        _id: new mongoose.Types.ObjectId(req.params.id),
        $or: [
          { reviews: { $exists: false } },
          { reviews: { $not: { $type: "array" } } }
        ]
      },
      {
        $set: {
          reviews: [],
          numReviews: 0,
          rating: 0
        }
      }
    );

    const product = await Product.findById(req.params.id);

    if (!product) {
      console.log('❌ Product not found');
      return res.status(404).json({ message: 'Product not found' });
    }

    // Double check if reviews is array (in case it wasn't 0 but still not array)
    if (!Array.isArray(product.reviews)) {
      product.reviews = [];
    }

    const review = {
      name,
      rating: Number(rating),
      comment,
    };

    product.reviews.push(review);
    product.numReviews = product.reviews.length;

    // Calculate average rating safely
    const totalRating = product.reviews.reduce((acc, item) => item.rating + acc, 0);
    product.rating = product.reviews.length > 0 ? totalRating / product.reviews.length : 0;

    await product.save();
    res.status(201).json(product);
  } catch (error) {
    console.error('Review submission error:', error);
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;