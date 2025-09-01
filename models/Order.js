const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    orderItems: [
        {
            name: {
                type: String,
                required: true
            },
            quantity: {
                type: Number,
                required: true
            },
            image: {
                type: String,
                required: false,
                default: ''
            },
            price: {
                type: Number,
                required: true
            },
            category: {
                type: String,
                required: true,
                enum: ['base', 'sauce', 'cheese', 'veggie', 'meat']
            },
            itemId: {
                type: mongoose.Schema.ObjectId,
                required: true
            }
        }
    ],
    shippingInfo: {
        address: {
            type: String,
            required: true
        },
        city: {
            type: String,
            required: true
        },
        state: {
            type: String,
            required: true
        },
        country: {
            type: String,
            required: true
        },
        pinCode: {
            type: String,
            required: true
        },
        phoneNo: {
            type: String,
            required: true
        }
    },
    paymentInfo: {
        id: {
            type: String,
            required: false
        },
        status: {
            type: String,
            required: false
        }
    },
    paidAt: {
        type: Date,
        required: false
    },
    itemsPrice: {
        type: Number,
        required: true,
        default: 0.0
    },
    taxPrice: {
        type: Number,
        required: true,
        default: 0.0
    },
    shippingPrice: {
        type: Number,
        required: true,
        default: 0.0
    },
    totalPrice: {
        type: Number,
        required: true,
        default: 0.0
    },
    orderStatus: {
        type: String,
        required: true,
        default: 'Processing',
        enum: ['Processing', 'Order Received', 'In the Kitchen', 'Sent to Delivery', 'Delivered', 'Cancelled']
    },
    deliveredAt: Date,
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Calculate total price before saving
orderSchema.pre('save', function(next) {
    this.itemsPrice = this.orderItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    this.taxPrice = this.itemsPrice * 0.18; // 18% tax
    this.shippingPrice = this.itemsPrice > 350 ? 0 : 50; // Free shipping above 350
    this.totalPrice = this.itemsPrice + this.taxPrice + this.shippingPrice;
    next();
});

// Update inventory after order is placed
const { sendLowStockNotification } = require('../utils/sendEmail');

orderSchema.methods.updateInventory = async function() {
    try {
        const PizzaBase = require('./PizzaBase');
        const Sauce = require('./Sauce');
        const Cheese = require('./Cheese');
        const Veggie = require('./Veggie');
        const Meat = require('./Meat');

        for (const item of this.orderItems) {
            let model;
            switch (item.category) {
                case 'base':
                    model = PizzaBase;
                    break;
                case 'sauce':
                    model = Sauce;
                    break;
                case 'cheese':
                    model = Cheese;
                    break;
                case 'veggie':
                    model = Veggie;
                    break;
                case 'meat':
                    model = Meat;
                    break;
                default:
                    continue;
            }

            const updatedItem = await model.findByIdAndUpdate(
                item.itemId,
                { $inc: { stock: -item.quantity } },
                { new: true }
            );

            if (updatedItem && updatedItem.isStockLow && updatedItem.isStockLow()) {
                try {
                    await sendLowStockNotification(updatedItem.name, updatedItem.stock, updatedItem.threshold);
                } catch (emailError) {
                    console.error('Error sending low stock notification:', emailError);
                }
            }
        }
    } catch (error) {
        console.error('Error updating inventory:', error);
    }
};

module.exports = mongoose.model('Order', orderSchema);
