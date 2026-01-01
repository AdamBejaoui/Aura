const express = require('express');
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get dashboard statistics (admin and co-admin)
router.get('/stats', authenticateToken, async (req, res) => {
    try {
        // Permission check
        if (!['admin', 'co-admin'].includes(req.user.role)) {
            return res.status(403).json({ message: 'Access denied' });
        }

        // Parallel execution for better performance
        const [
            orders,
            totalUsers,
            totalProducts,
            allReviewsData
        ] = await Promise.all([
            Order.find(),
            User.countDocuments(),
            Product.countDocuments(),
            Product.aggregate([
                { $unwind: "$reviews" },
                {
                    $group: {
                        _id: null,
                        count: { $sum: 1 }
                    }
                }
            ])
        ]);

        const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
        const totalOrders = orders.length;
        const pendingOrdersCount = orders.filter(o => o.status === 'pending').length;
        const deliveredOrdersCount = orders.filter(o => o.status === 'delivered').length;
        const totalReviews = allReviewsData.length > 0 ? allReviewsData[0].count : 0;
        const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

        // Last 30 days calculation
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const lastMonthOrders = orders.filter(o => new Date(o.createdAt) >= thirtyDaysAgo);
        const lastMonthRevenue = lastMonthOrders.reduce((sum, order) => sum + order.total, 0);

        // Previous 30 days (60 to 30 days ago) for comparison
        const sixtyDaysAgo = new Date();
        sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
        const prevMonthOrders = orders.filter(o => {
            const date = new Date(o.createdAt);
            return date >= sixtyDaysAgo && date < thirtyDaysAgo;
        });
        const prevMonthRevenue = prevMonthOrders.reduce((sum, order) => sum + order.total, 0);

        const monthOverMonthChange = prevMonthRevenue > 0
            ? ((lastMonthRevenue - prevMonthRevenue) / prevMonthRevenue * 100).toFixed(1)
            : (lastMonthRevenue > 0 ? 100 : 0);

        res.json({
            totalRevenue,
            totalOrders,
            totalUsers,
            totalProducts,
            totalReviews,
            pendingOrdersCount,
            deliveredOrdersCount,
            avgOrderValue,
            monthOverMonthChange
        });
    } catch (error) {
        console.error('Stats fetch error:', error);
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
