const mongoose = require('mongoose');

const meatSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please enter meat name'],
        unique: true,
        trim: true
    },
    description: {
        type: String,
        required: [true, 'Please enter meat description']
    },
    price: {
        type: Number,
        required: [true, 'Please enter meat price'],
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
        default: 15,
        min: [0, 'Threshold cannot be negative']
    },
    isAvailable: {
        type: Boolean,
        default: true
    },
    category: {
        type: String,
        default: 'meat',
        enum: ['meat']
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Check if stock is low
meatSchema.methods.isStockLow = function() {
    return this.stock <= this.threshold;
};

// Update stock after order
meatSchema.methods.updateStock = function(quantity) {
    this.stock = Math.max(0, this.stock - quantity);
    this.isAvailable = this.stock > 0;
    return this.save();
};

module.exports = mongoose.model('Meat', meatSchema);
