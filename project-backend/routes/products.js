// backend/routes/products.js
const express = require('express');
const Product = require('../models/Product');
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
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

const router = express.Router();

// Get all products (public)
router.get('/', async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
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

    // Handle image update
    if (req.files && Array.isArray(req.files)) {
      // Delete old image files if they are local uploads
      const oldProduct = await Product.findById(req.params.id);
      if (oldProduct && oldProduct.images) {
        oldProduct.images.forEach(imgPath => {
          if (imgPath.startsWith('/uploads/')) {
            const oldImagePath = path.join(__dirname, '..', imgPath);
            if (fs.existsSync(oldImagePath)) {
              fs.unlinkSync(oldImagePath);
            }
          }
        });
      }
      // Add new image URLs
      updateData.images = req.files.map(file => `/uploads/${file.filename}`);
    } else if (req.body.images !== undefined) {
      // Use provided image URLs (could be external or existing)
      updateData.images = Array.isArray(req.body.images) ? req.body.images : [req.body.images];
    }
    // If no images provided, don't update the images field

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
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

module.exports = router;