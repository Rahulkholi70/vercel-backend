const express = require('express');
const router = express.Router();
const PizzaBase = require('../models/PizzaBase');
const Sauce = require('../models/Sauce');
const Cheese = require('../models/Cheese');
const Veggie = require('../models/Veggie');
const Meat = require('../models/Meat');

// Get all pizza bases
router.get('/bases', async (req, res) => {
    try {
        const bases = await PizzaBase.find({ isAvailable: true }).select('-__v');
        res.status(200).json({
            success: true,
            count: bases.length,
            data: bases
        });
    } catch (error) {
        console.error('Error fetching pizza bases:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching pizza bases',
            error: error.message
        });
    }
});

// Get all sauces
router.get('/sauces', async (req, res) => {
    try {
        const sauces = await Sauce.find({ isAvailable: true }).select('-__v');
        res.status(200).json({
            success: true,
            count: sauces.length,
            data: sauces
        });
    } catch (error) {
        console.error('Error fetching sauces:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching sauces',
            error: error.message
        });
    }
});

// Get all cheeses
router.get('/cheeses', async (req, res) => {
    try {
        const cheeses = await Cheese.find({ isAvailable: true }).select('-__v');
        res.status(200).json({
            success: true,
            count: cheeses.length,
            data: cheeses
        });
    } catch (error) {
        console.error('Error fetching cheeses:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching cheeses',
            error: error.message
        });
    }
});

// Get all veggies
router.get('/veggies', async (req, res) => {
    try {
        const veggies = await Veggie.find({ isAvailable: true }).select('-__v');
        res.status(200).json({
            success: true,
            count: veggies.length,
            data: veggies
        });
    } catch (error) {
        console.error('Error fetching veggies:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching veggies',
            error: error.message
        });
    }
});

// Get all meat options
router.get('/meats', async (req, res) => {
    try {
        const meats = await Meat.find({ isAvailable: true }).select('-__v');
        res.status(200).json({
            success: true,
            count: meats.length,
            data: meats
        });
    } catch (error) {
        console.error('Error fetching meats:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching meats',
            error: error.message
        });
    }
});

// Get all pizza options (for dashboard) - alias for backward compatibility
router.get('/all', async (req, res) => {
    try {
        const [bases, sauces, cheeses, veggies, meats] = await Promise.all([
            PizzaBase.find({ isAvailable: true }).select('-__v'),
            Sauce.find({ isAvailable: true }).select('-__v'),
            Cheese.find({ isAvailable: true }).select('-__v'),
            Veggie.find({ isAvailable: true }).select('-__v'),
            Meat.find({ isAvailable: true }).select('-__v')
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
        console.error('Error fetching all pizza options:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching pizza options',
            error: error.message
        });
    }
});

// Get all pizza options (for dashboard)
router.get('/all-options', async (req, res) => {
    try {
        const [bases, sauces, cheeses, veggies, meats] = await Promise.all([
            PizzaBase.find({ isAvailable: true }).select('-__v'),
            Sauce.find({ isAvailable: true }).select('-__v'),
            Cheese.find({ isAvailable: true }).select('-__v'),
            Veggie.find({ isAvailable: true }).select('-__v'),
            Meat.find({ isAvailable: true }).select('-__v')
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
        console.error('Error fetching all pizza options:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching pizza options',
            error: error.message
        });
    }
});

// Get specific item by ID
router.get('/item/:category/:id', async (req, res) => {
    try {
        const { category, id } = req.params;
        let model;

        switch (category) {
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
                return res.status(400).json({
                    success: false,
                    message: 'Invalid category'
                });
        }

        const item = await model.findById(id).select('-__v');
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

// Get all inventory items (including unavailable ones - for admin)
router.get('/inventory/all', async (req, res) => {
    try {
        const [bases, sauces, cheeses, veggies, meats] = await Promise.all([
            PizzaBase.find().select('-__v'),
            Sauce.find().select('-__v'),
            Cheese.find().select('-__v'),
            Veggie.find().select('-__v'),
            Meat.find().select('-__v')
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
        console.error('Error fetching all inventory:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching inventory',
            error: error.message
        });
    }
});

// Update inventory item stock and threshold
router.put('/inventory/:category/:id', async (req, res) => {
    try {
        const { category, id } = req.params;
        const { stock, threshold } = req.body;
        let model;

        switch (category) {
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

        if (stock !== undefined) {
            item.stock = Math.max(0, stock);
            item.isAvailable = item.stock > 0;
        }

        if (threshold !== undefined) {
            item.threshold = Math.max(0, threshold);
        }

        await item.save();

        res.status(200).json({
            success: true,
            message: 'Inventory updated successfully',
            data: item
        });
    } catch (error) {
        console.error('Error updating inventory:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating inventory',
            error: error.message
        });
    }
});

// Toggle item availability
router.put('/inventory/:category/:id/toggle', async (req, res) => {
    try {
        const { category, id } = req.params;
        let model;

        switch (category) {
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

// Add new inventory item
router.post('/inventory/:category', async (req, res) => {
    try {
        const { category } = req.params;
        const { name, description, price, stock, threshold } = req.body;
        let model;

        switch (category) {
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
                return res.status(400).json({
                    success: false,
                    message: 'Invalid category'
                });
        }

        const newItem = await model.create({
            name,
            description,
            price,
            stock: stock || 0,
            threshold: threshold || (category === 'base' ? 20 : category === 'sauce' ? 15 : category === 'cheese' ? 10 : category === 'veggie' ? 25 : 15),
            isAvailable: (stock || 0) > 0
        });

        res.status(201).json({
            success: true,
            message: 'Item added successfully',
            data: newItem
        });
    } catch (error) {
        console.error('Error adding inventory item:', error);
        res.status(500).json({
            success: false,
            message: 'Error adding inventory item',
            error: error.message
        });
    }
});

module.exports = router;
