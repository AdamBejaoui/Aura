const mongoose = require('mongoose');

const waitlistSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true
    },
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    notified: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Index to prevent duplicate entries for same user/product
waitlistSchema.index({ email: 1, productId: 1 }, { unique: true });
waitlistSchema.index({ productId: 1 });
waitlistSchema.index({ notified: 1 });

module.exports = mongoose.model('Waitlist', waitlistSchema);
