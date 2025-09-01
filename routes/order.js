 const express = require('express');
const router = express.Router();
const Razorpay = require('razorpay');
const crypto = require('crypto');
const Order = require('../models/Order');
const { protect, isVerified } = require('../middleware/auth');
const { sendOrderStatusUpdate } = require('../utils/sendEmail');

// Initialize Razorpay
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

// Create order
router.post('/create', protect, isVerified, async (req, res) => {
    try {
        const { orderItems, shippingInfo } = req.body;

        if (!orderItems || orderItems.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No order items'
            });
        }

        // Calculate total amount
        const itemsPrice = orderItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
        const taxPrice = itemsPrice * 0.18; // 18% tax
        const shippingPrice = itemsPrice > 350 ? 0 : 50; // Free shipping above 350
        const totalPrice = itemsPrice + taxPrice + shippingPrice;

        // Create order in database
        const order = new Order({
            user: req.user.id,
            orderItems,
            shippingInfo,
            itemsPrice,
            taxPrice,
            shippingPrice,
            totalPrice,
            orderStatus: 'Order Received' // Set initial status for development
        });

        await order.save();

        // Create Razorpay order
        let razorpayOrder;
        try {
            razorpayOrder = await razorpay.orders.create({
                amount: Math.round(totalPrice * 100), // Convert to paise
                currency: 'INR',
                receipt: `order_${order._id}`,
                notes: {
                    order_id: order._id.toString(),
                    user_id: req.user.id
                }
            });
        } catch (razorpayError) {
            console.error('Razorpay order creation error:', razorpayError);
            // Delete the order from database since payment failed
            await Order.findByIdAndDelete(order._id);
            
            return res.status(500).json({
                success: false,
                message: 'Payment gateway error. Please try again later.',
                error: razorpayError.message
            });
        }

        // Update order with Razorpay order ID
        order.paymentInfo = {
            id: razorpayOrder.id,
            status: 'created'
        };
        await order.save();

        res.status(201).json({
            success: true,
            message: 'Order created successfully',
            order,
            razorpayOrderId: razorpayOrder.id,
            key: process.env.RAZORPAY_KEY_ID
        });
    } catch (error) {
        console.error('Error creating order:', error.stack);
        res.status(500).json({
            success: false,
            message: 'Error creating order',
            error: error.message,
            stack: error.stack
        });
    }
});

// Verify payment and confirm order
router.post('/payment/verify', protect, isVerified, async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

        // Verify signature
        const body = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(body.toString())
            .digest("hex");

        if (expectedSignature !== razorpay_signature) {
            return res.status(400).json({
                success: false,
                message: 'Invalid payment signature'
            });
        }

        // Find order by Razorpay order ID
        const order = await Order.findOne({
            'paymentInfo.id': razorpay_order_id
        });

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        // Update payment info
        order.paymentInfo = {
            id: razorpay_payment_id,
            status: 'completed'
        };
        order.paidAt = Date.now();
        order.orderStatus = 'Order Received';

        await order.save();

        // Update inventory
        await order.updateInventory();

        res.status(200).json({
            success: true,
            message: 'Payment verified and order confirmed',
            order
        });
    } catch (error) {
        console.error('Error verifying payment:', error);
        res.status(500).json({
            success: false,
            message: 'Error verifying payment',
            error: error.message
        });
    }
});

// Get user orders
router.get('/my-orders', protect, isVerified, async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user.id })
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: orders.length,
            data: orders
        });
    } catch (error) {
        console.error('Error fetching user orders:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching orders',
            error: error.message
        });
    }
});

// Get single order
router.get('/:id', protect, isVerified, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id).populate('user', 'name email');

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        // Check if user owns this order or is admin
        if (order.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
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

// Update order status (Admin only)
router.put('/:id/status', protect, isVerified, async (req, res) => {
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

        // Send email notification to user
        try {
            await sendOrderStatusUpdate(order.user.email, order._id, orderStatus);
        } catch (emailError) {
            console.error('Error sending status update email:', emailError);
        }

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

// Cancel order
router.put('/:id/cancel', protect, isVerified, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        // Check if user owns this order
        if (order.user.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        // Check if order can be cancelled
        if (['Delivered', 'Cancelled'].includes(order.orderStatus)) {
            return res.status(400).json({
                success: false,
                message: 'Order cannot be cancelled'
            });
        }

        order.orderStatus = 'Cancelled';
        await order.save();

        res.status(200).json({
            success: true,
            message: 'Order cancelled successfully',
            order
        });
    } catch (error) {
        console.error('Error cancelling order:', error);
        res.status(500).json({
            success: false,
            message: 'Error cancelling order',
            error: error.message
        });
    }
});

module.exports = router;
