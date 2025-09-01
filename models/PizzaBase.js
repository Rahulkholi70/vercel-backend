const mongoose = require('mongoose');

const pizzaBaseSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please enter pizza base name'],
        unique: true,
        trim: true
    },
    description: {
        type: String,
        required: [true, 'Please enter pizza base description']
    },
    price: {
        type: Number,
        required: [true, 'Please enter pizza base price'],
        min: [0, 'Price cannot be negative']
    },
    image: {
        public_id: {
            type: String,
            default: ''
        },
        url: {
            type: String,
            default: ''
        }
    },
    stock: {
        type: Number,
        required: [true, 'Please enter stock quantity'],
        min: [0, 'Stock cannot be negative'],
        default: 0
    },
    threshold: {
        type: Number,
        default: 20,
        min: [0, 'Threshold cannot be negative']
    },
    isAvailable: {
        type: Boolean,
        default: true
    },
    category: {
        type: String,
        default: 'base',
        enum: ['base']
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Check if stock is low
pizzaBaseSchema.methods.isStockLow = function() {
    return this.stock <= this.threshold;
};

// Update stock after order
pizzaBaseSchema.methods.updateStock = function(quantity) {
    this.stock = Math.max(0, this.stock - quantity);
    this.isAvailable = this.stock > 0;
    return this.save();
};

module.exports = mongoose.model('PizzaBase', pizzaBaseSchema);
