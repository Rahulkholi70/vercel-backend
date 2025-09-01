const express = require('express');
const router = express.Router();
const PizzaBase = require('../models/PizzaBase');
const Sauce = require('../models/Sauce');
const Cheese = require('../models/Cheese');
const Veggie = require('../models/Veggie');
const Meat = require('../models/Meat');
const { protect, isAdmin } = require('../middleware/auth');
const { sendLowStockNotification } = require('../utils/sendEmail');

// Generic function to get model by category
const getModelByCategory = (category) => {
    switch (category) {
        case 'base':
            return PizzaBase;
        case 'sauce':
            return Sauce;
        case 'cheese':
            return Cheese;
        case 'veggie':
            return Veggie;
        case 'meat':
            return Meat;
        default:
            return null;
    }
};

// Get all items by category
router.get('/:category', protect, isAdmin, async (req, res) => {
    try {
        const { category } = req.params;
        const model = getModelByCategory(category);

        if (!model) {
            return res.status(400).json({
                success: false,
                message: 'Invalid category'
            });
        }

        const items = await model.find().sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: items.length,
            data: items
        });
    } catch (error) {
        console.error(`Error fetching ${req.params.category} items:`, error);
        res.status(500).json({
            success: false,
            message: `Error fetching ${req.params.category} items`,
            error: error.message
        });
    }
});

// Get single item by ID
router.get('/:category/:id', protect, isAdmin, async (req, res) => {
    try {
        const { category, id } = req.params;
        const model = getModelByCategory(category);

        if (!model) {
            return res.status(400).json({
                success: false,
                message: 'Invalid category'
            });
        }

        const item = await model.findById(id);
        if (!item) {
            return res.status(404).json({
                success: false,
                message: 'Item not found'
            });
        }

        res.status(200).json({
            success: true,
            data: item
        });
    } catch (error) {
        console.error('Error fetching item:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching item',
            error: error.message
        });
    }
});

// Create new item
router.post('/:category', protect, isAdmin, async (req, res) => {
    try {
        const { category } = req.params;
        const model = getModelByCategory(category);

        if (!model) {
            return res.status(400).json({
                success: false,
                message: 'Invalid category'
            });
        }

        const item = new model(req.body);
        await item.save();

        res.status(201).json({
            success: true,
            message: `${category} item created successfully`,
            data: item
        });
    } catch (error) {
        console.error(`Error creating ${req.params.category} item:`, error);
        res.status(500).json({
            success: false,
            message: `Error creating ${req.params.category} item`,
            error: error.message
        });
    }
});

// Update item
router.put('/:category/:id', protect, isAdmin, async (req, res) => {
    try {
        const { category, id } = req.params;
        const model = getModelByCategory(category);

        if (!model) {
            return res.status(400).json({
                success: false,
                message: 'Invalid category'
            });
        }

        const item = await model.findByIdAndUpdate(id, req.body, {
            new: true,
            runValidators: true
        });

        if (!item) {
            return res.status(404).json({
                success: false,
                message: 'Item not found'
            });
        }

        // Check if stock is low after update
        if (item.isStockLow()) {
            try {
                await sendLowStockNotification(item.name, item.stock, item.threshold);
            } catch (emailError) {
                console.error('Error sending low stock notification:', emailError);
            }
        }

        res.status(200).json({
            success: true,
            message: `${category} item updated successfully`,
            data: item
        });
    } catch (error) {
        console.error(`Error updating ${req.params.category} item:`, error);
        res.status(500).json({
            success: false,
            message: `Error updating ${req.params.category} item`,
            error: error.message
        });
    }
});

// Delete item
router.delete('/:category/:id', protect, isAdmin, async (req, res) => {
    try {
        const { category, id } = req.params;
        const model = getModelByCategory(category);

        if (!model) {
            return res.status(400).json({
                success: false,
                message: 'Invalid category'
            });
        }

        const item = await model.findByIdAndDelete(id);

        if (!item) {
            return res.status(404).json({
                success: false,
                message: 'Item not found'
            });
        }

        res.status(200).json({
            success: true,
            message: `${category} item deleted successfully`
        });
    } catch (error) {
        console.error(`Error deleting ${req.params.category} item:`, error);
        res.status(500).json({
            success: false,
            message: `Error deleting ${req.params.category} item`,
            error: error.message
        });
    }
});

// Update stock for an item
router.patch('/:category/:id/stock', protect, isAdmin, async (req, res) => {
    try {
        const { category, id } = req.params;
        const { stock, operation } = req.body; // operation: 'add' or 'subtract'
        const model = getModelByCategory(category);

        if (!model) {
            return res.status(400).json({
                success: false,
                message: 'Invalid category'
            });
        }

        const item = await model.findById(id);
        if (!item) {
            return res.status(404).json({
                success: false,
                message: 'Item not found'
            });
        }

        // Update stock based on operation
        if (operation === 'add') {
            item.stock += stock;
        } else if (operation === 'subtract') {
            item.stock = Math.max(0, item.stock - stock);
        } else {
            item.stock = stock;
        }

        item.isAvailable = item.stock > 0;
        await item.save();

        // Check if stock is low after update
        if (item.isStockLow()) {
            try {
                await sendLowStockNotification(item.name, item.stock, item.threshold);
            } catch (emailError) {
                console.error('Error sending low stock notification:', emailError);
            }
        }

        res.status(200).json({
            success: true,
            message: 'Stock updated successfully',
            data: item
        });
    } catch (error) {
        console.error('Error updating stock:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating stock',
            error: error.message
        });
    }
});

// Toggle item availability
router.patch('/:category/:id/toggle', protect, isAdmin, async (req, res) => {
    try {
        const { category, id } = req.params;
        const model = getModelByCategory(category);

        if (!model) {
            return res.status(400).json({
                success: false,
                message: 'Invalid category'
            });
        }

        const item = await model.findById(id);
        if (!item) {
            return res.status(404).json({
                success: false,
                message: 'Item not found'
            });
        }

        // Toggle availability
        item.isAvailable = !item.isAvailable;
        await item.save();

        res.status(200).json({
            success: true,
            message: `Item ${item.isAvailable ? 'enabled' : 'disabled'} successfully`,
            data: item
        });
    } catch (error) {
        console.error('Error toggling item availability:', error);
        res.status(500).json({
            success: false,
            message: 'Error toggling item availability',
            error: error.message
        });
    }
});

// Bulk update stock
router.patch('/bulk-stock-update', protect, isAdmin, async (req, res) => {
    try {
        const { updates } = req.body; // Array of { category, id, stock, operation }

        const results = [];
        for (const update of updates) {
            const { category, id, stock, operation } = update;
            const model = getModelByCategory(category);

            if (!model) {
                results.push({ category, id, success: false, message: 'Invalid category' });
                continue;
            }

            try {
                const item = await model.findById(id);
                if (!item) {
                    results.push({ category, id, success: false, message: 'Item not found' });
                    continue;
                }

                // Update stock
                if (operation === 'add') {
                    item.stock += stock;
                } else if (operation === 'subtract') {
                    item.stock = Math.max(0, item.stock - stock);
                } else {
                    item.stock = stock;
                }

                item.isAvailable = item.stock > 0;
                await item.save();

                // Check for low stock
                if (item.isStockLow()) {
                    try {
                        await sendLowStockNotification(item.name, item.stock, item.threshold);
                    } catch (emailError) {
                        console.error('Error sending low stock notification:', emailError);
                    }
                }

                results.push({ category, id, success: true, data: item });
            } catch (error) {
                results.push({ category, id, success: false, message: error.message });
            }
        }

        res.status(200).json({
            success: true,
            message: 'Bulk stock update completed',
            results
        });
    } catch (error) {
        console.error('Error in bulk stock update:', error);
        res.status(500).json({
            success: false,
            message: 'Error in bulk stock update',
            error: error.message
        });
    }
});

// Get low stock items
router.get('/low-stock/:category', protect, isAdmin, async (req, res) => {
    try {
        const { category } = req.params;
        const model = getModelByCategory(category);

        if (!model) {
            return res.status(400).json({
                success: false,
                message: 'Invalid category'
            });
        }

        let threshold;
        switch (category) {
            case 'base':
                threshold = 20;
                break;
            case 'sauce':
                threshold = 15;
                break;
            case 'cheese':
                threshold = 10;
                break;
            case 'veggie':
                threshold = 25;
                break;
            case 'meat':
                threshold = 15;
                break;
            default:
                threshold = 20;
        }

        const lowStockItems = await model.find({ stock: { $lte: threshold } });

        res.status(200).json({
            success: true,
            count: lowStockItems.length,
            threshold,
            data: lowStockItems
        });
    } catch (error) {
        console.error(`Error fetching low stock ${req.params.category} items:`, error);
        res.status(500).json({
            success: false,
            message: `Error fetching low stock ${req.params.category} items`,
            error: error.message
        });
    }
});

module.exports = router;
