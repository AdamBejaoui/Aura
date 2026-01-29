const express = require('express');
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const Waitlist = require('../models/Waitlist');
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
            allReviewsData,
            waitlistCount
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
            ]),
            Waitlist.countDocuments({ notified: false })
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
            monthOverMonthChange,
            waitlistCount
        });
    } catch (error) {
        console.error('Stats fetch error:', error);
        res.status(500).json({ message: error.message });
    }
});

// Get detailed analytics with time-range filtering
router.get('/analytics', authenticateToken, async (req, res) => {
    try {
        if (!['admin', 'co-admin'].includes(req.user.role)) {
            return res.status(403).json({ message: 'Access denied' });
        }

        const { range = '30d' } = req.query;
        let startDate = new Date();
        let groupBy = '$dayOfMonth'; // Default grouping

        if (range === '7d') startDate.setDate(startDate.getDate() - 7);
        else if (range === '30d') startDate.setDate(startDate.getDate() - 30);
        else if (range === '90d') startDate.setDate(startDate.getDate() - 90);
        else if (range === '1y') {
            startDate.setFullYear(startDate.getFullYear() - 1);
            groupBy = '$month';
        } else if (range === 'all') {
            startDate = new Date(0); // Beginning of time
            groupBy = '$month';
        }

        // 1. Revenue Trends
        const revenueTrends = await Order.aggregate([
            { $match: { createdAt: { $gte: startDate } } },
            {
                $group: {
                    _id: {
                        year: { $year: "$createdAt" },
                        month: { $month: "$createdAt" },
                        day: range === '1y' || range === 'all' ? null : { $dayOfMonth: "$createdAt" }
                    },
                    revenue: { $sum: "$total" },
                    orders: { $sum: 1 }
                }
            },
            { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } }
        ]);

        // Transform for frontend (e.g., "Jan 22")
        const formattedTrends = revenueTrends.map(item => {
            const date = new Date(item._id.year, item._id.month - 1, item._id.day || 1);
            const label = range === '1y' || range === 'all'
                ? date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
                : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            return { label, revenue: item.revenue, orders: item.orders };
        });

        // 2. Category Distribution (Alpha)
        const categoryData = await Product.aggregate([
            { $group: { _id: "$category", value: { $sum: 1 } } },
            { $project: { name: "$_id", value: 1, _id: 0 } }
        ]);

        // 3. Top Selling Products (High Velocity)
        const topProducts = await Order.aggregate([
            { $match: { createdAt: { $gte: startDate } } },
            { $unwind: "$items" },
            {
                $group: {
                    _id: "$items.productId",
                    quantity: { $sum: "$items.quantity" },
                    revenue: { $sum: { $multiply: ["$items.quantity", "$items.price"] } }
                }
            },
            { $sort: { revenue: -1 } },
            { $limit: 10 },
            {
                $lookup: {
                    from: "products",
                    localField: "_id",
                    foreignField: "_id",
                    as: "productInfo"
                }
            },
            { $unwind: "$productInfo" },
            {
                $project: {
                    name: "$productInfo.name",
                    category: "$productInfo.category",
                    quantity: 1,
                    revenue: 1
                }
            }
        ]);

        res.json({
            revenueTrends: formattedTrends,
            categoryDistribution: categoryData,
            topProducts
        });
    } catch (error) {
        console.error('Analytics fetch error:', error);
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
