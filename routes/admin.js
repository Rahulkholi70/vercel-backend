const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Order = require('../models/Order');
const PizzaBase = require('../models/PizzaBase');
const Sauce = require('../models/Sauce');
const Cheese = require('../models/Cheese');
const Veggie = require('../models/Veggie');
const Meat = require('../models/Meat');
const { protect, isAdmin } = require('../middleware/auth');
const { sendLowStockNotification } = require('../utils/sendEmail');

// Get admin dashboard stats
router.get('/dashboard', protect, isAdmin, async (req, res) => {
    try {
        const [
            totalOrders,
            pendingOrders,
            totalUsers,
            lowStockItems
        ] = await Promise.all([
            Order.countDocuments(),
            Order.countDocuments({ orderStatus: { $in: ['Processing', 'Order Received', 'In the Kitchen'] } }),
            User.countDocuments({ role: 'user' }),
            Promise.all([
                PizzaBase.find({ stock: { $lte: 20 } }),
                Sauce.find({ stock: { $lte: 15 } }),
                Cheese.find({ stock: { $lte: 10 } }),
                Veggie.find({ stock: { $lte: 25 } }),
                Meat.find({ stock: { $lte: 15 } })
            ])
        ]);

        const allLowStockItems = [
            ...lowStockItems[0].map(item => ({ ...item.toObject(), category: 'base' })),
            ...lowStockItems[1].map(item => ({ ...item.toObject(), category: 'sauce' })),
            ...lowStockItems[2].map(item => ({ ...item.toObject(), category: 'cheese' })),
            ...lowStockItems[3].map(item => ({ ...item.toObject(), category: 'veggie' })),
            ...lowStockItems[4].map(item => ({ ...item.toObject(), category: 'meat' }))
        ];

        res.status(200).json({
            success: true,
            data: {
                totalOrders,
                pendingOrders,
                totalUsers,
                lowStockItems: allLowStockItems
            }
        });
    } catch (error) {
        console.error('Error fetching admin dashboard:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching dashboard data',
            error: error.message
        });
    }
});

// Get all orders (Admin)
router.get('/orders', protect, isAdmin, async (req, res) => {
    try {
        const { page = 1, limit = 10, status } = req.query;
        
        let query = {};
        if (status && status !== 'all') {
            query.orderStatus = status;
        }

        const orders = await Order.find(query)
            .populate('user', 'name email')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await Order.countDocuments(query);

        res.status(200).json({
            success: true,
            data: orders,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            total
        });
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching orders',
            error: error.message
        });
    }
});

// Get single order (Admin)
router.get('/orders/:id', protect, isAdmin, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate('user', 'name email phone');

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        res.status(200).json({
            success: true,
            data: order
        });
    } catch (error) {
        console.error('Error fetching order:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching order',
            error: error.message
        });
    }
});

// Update order status (Admin)
router.put('/orders/:id/status', protect, isAdmin, async (req, res) => {
    try {
        const { orderStatus } = req.body;

        if (!['Order Received', 'In the Kitchen', 'Sent to Delivery', 'Delivered', 'Cancelled'].includes(orderStatus)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid order status'
            });
        }

        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        // Update order status
        order.orderStatus = orderStatus;
        if (orderStatus === 'Delivered') {
            order.deliveredAt = Date.now();
        }

        await order.save();

        res.status(200).json({
            success: true,
            message: 'Order status updated successfully',
            order
        });
    } catch (error) {
        console.error('Error updating order status:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating order status',
            error: error.message
        });
    }
});

// Get all users (Admin)
router.get('/users', protect, isAdmin, async (req, res) => {
    try {
        const users = await User.find({ role: 'user' })
            .select('-password')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: users.length,
            data: users
        });
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching users',
            error: error.message
        });
    }
});

// Create admin user
router.post('/create-admin', protect, isAdmin, async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Check if user already exists
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({
                success: false,
                message: 'User already exists with this email'
            });
        }

        // Create admin user
        user = new User({
            name,
            email,
            password,
            role: 'admin',
            isEmailVerified: true // Admin users are auto-verified
        });

        await user.save();

        res.status(201).json({
            success: true,
            message: 'Admin user created successfully',
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Error creating admin user:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating admin user',
            error: error.message
        });
    }
});

// Get inventory overview
router.get('/inventory', protect, isAdmin, async (req, res) => {
    try {
        const [bases, sauces, cheeses, veggies, meats] = await Promise.all([
            PizzaBase.find().sort({ stock: 1 }),
            Sauce.find().sort({ stock: 1 }),
            Cheese.find().sort({ stock: 1 }),
            Veggie.find().sort({ stock: 1 }),
            Meat.find().sort({ stock: 1 })
        ]);

        res.status(200).json({
            success: true,
            data: {
                bases,
                sauces,
                cheeses,
                veggies,
                meats
            }
        });
    } catch (error) {
        console.error('Error fetching inventory:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching inventory',
            error: error.message
        });
    }
});

// Check low stock and send notifications
router.post('/check-low-stock', protect, isAdmin, async (req, res) => {
    try {
        const [bases, sauces, cheeses, veggies, meats] = await Promise.all([
            PizzaBase.find({ stock: { $lte: 20 } }),
            Sauce.find({ stock: { $lte: 15 } }),
            Cheese.find({ stock: { $lte: 10 } }),
            Veggie.find({ stock: { $lte: 25 } }),
            Meat.find({ stock: { $lte: 15 } })
        ]);

        // Send notifications for low stock items
        const notifications = [];
        
        for (const item of [...bases, ...sauces, ...cheeses, ...veggies, ...meats]) {
            try {
                await sendLowStockNotification(item.name, item.stock, item.threshold);
                notifications.push(`Notification sent for ${item.name}`);
            } catch (error) {
                notifications.push(`Failed to send notification for ${item.name}`);
            }
        }

        res.status(200).json({
            success: true,
            message: 'Low stock check completed',
            lowStockItems: {
                bases: bases.length,
                sauces: sauces.length,
                cheeses: cheeses.length,
                veggies: veggies.length,
                meats: meats.length
            },
            notifications
        });
    } catch (error) {
        console.error('Error checking low stock:', error);
        res.status(500).json({
            success: false,
            message: 'Error checking low stock',
            error: error.message
        });
    }
});

module.exports = router;
