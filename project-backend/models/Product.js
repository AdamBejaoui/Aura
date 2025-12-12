// backend/models/Product.js
const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  name: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true },
}, { timestamps: true });

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  category: {
    type: String,
    required: true,
    enum: ['New Arrivals', 'Wardrobe Staples', 'Statement Pieces', 'Streetwear', 'Evening Luxe']
  },
  price: { type: Number, required: true, min: 0 },
  description: { type: String, required: true, trim: true },
  rating: { type: Number, default: 0, min: 0, max: 5 },
  numReviews: { type: Number, default: 0 },
  reviews: [reviewSchema], // Array of review objects
  inStock: { type: Boolean, default: true },
  currency: {
    type: String,
    enum: ['USD', 'EUR', 'GBP', 'JPY', 'TND'],
    default: 'TND'
  },
  // ✅ Allow multiple images
  images: [{ type: String, required: true }]
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);