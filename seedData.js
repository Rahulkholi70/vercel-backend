const mongoose = require('mongoose');
const dotenv = require('dotenv');
const PizzaBase = require('./models/PizzaBase');
const Sauce = require('./models/Sauce');
const Cheese = require('./models/Cheese');
const Veggie = require('./models/Veggie');
const Meat = require('./models/Meat');
const User = require('./models/User');

// Load environment variables
const path = require('path');
dotenv.config({ path: path.join(__dirname, 'config.env') });

// Sample data
const pizzaBases = [
    {
        name: 'Classic Hand Tossed',
        description: 'Traditional hand-tossed crust with perfect thickness',
        price: 199,
        stock: 50,
        threshold: 20,
        image: {
            url: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400'
        }
    },
    {
        name: 'Thin & Crispy',
        description: 'Ultra-thin crust that\'s crispy and light',
        price: 179,
        stock: 45,
        threshold: 20,
        image: {
            url: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400'
        }
    },
    {
        name: 'Stuffed Crust',
        description: 'Crust filled with melted cheese',
        price: 249,
        stock: 35,
        threshold: 20,
        image: {
            url: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400'
        }
    },
    {
        name: 'Gluten-Free',
        description: 'Gluten-free crust for dietary restrictions',
        price: 299,
        stock: 25,
        threshold: 20,
        image: {
            url: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400'
        }
    },
    {
        name: 'Deep Dish',
        description: 'Thick, hearty deep dish crust',
        price: 279,
        stock: 30,
        threshold: 20,
        image: {
            url: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400'
        }
    }
];

const sauces = [
    {
        name: 'Classic Tomato',
        description: 'Traditional tomato sauce with herbs',
        price: 49,
        stock: 40,
        threshold: 15,
        image: {
            url: 'https://images.unsplash.com/photo-1542834292982-0c6d0d0c0c0c?w=400'
        }
    },
    {
        name: 'BBQ Sauce',
        description: 'Sweet and smoky BBQ sauce',
        price: 59,
        stock: 35,
        threshold: 15,
        image: {
            url: 'https://images.unsplash.com/photo-1542834292982-0c6d0d0c0c0c?w=400'
        }
    },
    {
        name: 'White Sauce',
        description: 'Creamy garlic white sauce',
        price: 69,
        stock: 30,
        threshold: 15,
        image: {
            url: 'https://images.unsplash.com/photo-1542834292982-0c6d0d0c0c0c?w=400'
        }
    },
    {
        name: 'Pesto',
        description: 'Fresh basil pesto sauce',
        price: 79,
        stock: 25,
        threshold: 15,
        image: {
            url: 'https://images.unsplash.com/photo-1542834292982-0c6d0d0c0c0c?w=400'
        }
    },
    {
        name: 'Hot Sauce',
        description: 'Spicy hot sauce for heat lovers',
        price: 54,
        stock: 30,
        threshold: 15,
        image: {
            url: 'https://images.unsplash.com/photo-1542834292982-0c6d0d0c0c0c?w=400'
        }
    }
];

const cheeses = [
    {
        name: 'Mozzarella',
        description: 'Classic mozzarella cheese',
        price: 89,
        stock: 60,
        threshold: 10,
        image: {
            url: 'https://images.unsplash.com/photo-1542834292982-0c6d0d0c0c0c?w=400'
        }
    },
    {
        name: 'Cheddar',
        description: 'Sharp cheddar cheese',
        price: 79,
        stock: 55,
        threshold: 10,
        image: {
            url: 'https://images.unsplash.com/photo-1542834292982-0c6d0d0c0c0c?w=400'
        }
    },
    {
        name: 'Parmesan',
        description: 'Aged parmesan cheese',
        price: 99,
        stock: 40,
        threshold: 10,
        image: {
            url: 'https://images.unsplash.com/photo-1542834292982-0c6d0d0c0c0c?w=400'
        }
    },
    {
        name: 'Gouda',
        description: 'Smooth gouda cheese',
        price: 89,
        stock: 35,
        threshold: 10,
        image: {
            url: 'https://images.unsplash.com/photo-1542834292982-0c6d0d0c0c0c?w=400'
        }
    },
    {
        name: 'Blue Cheese',
        description: 'Bold blue cheese',
        price: 109,
        stock: 25,
        threshold: 10,
        image: {
            url: 'https://images.unsplash.com/photo-1542834292982-0c6d0d0c0c0c?w=400'
        }
    }
];

const veggies = [
    {
        name: 'Bell Peppers',
        description: 'Fresh bell peppers',
        price: 39,
        stock: 50,
        threshold: 25,
        image: {
            url: 'https://images.unsplash.com/photo-1542834292982-0c6d0d0c0c0c?w=400'
        }
    },
    {
        name: 'Mushrooms',
        description: 'Sliced mushrooms',
        price: 44,
        stock: 45,
        threshold: 25,
        image: {
            url: 'https://images.unsplash.com/photo-1542834292982-0c6d0d0c0c0c?w=400'
        }
    },
    {
        name: 'Onions',
        description: 'Red onions',
        price: 29,
        stock: 60,
        threshold: 25,
        image: {
            url: 'https://images.unsplash.com/photo-1542834292982-0c6d0d0c0c0c?w=400'
        }
    },
    {
        name: 'Olives',
        description: 'Black olives',
        price: 49,
        stock: 40,
        threshold: 25,
        image: {
            url: 'https://images.unsplash.com/photo-1542834292982-0c6d0d0c0c0c?w=400'
        }
    },
    {
        name: 'Spinach',
        description: 'Fresh spinach leaves',
        price: 34,
        stock: 35,
        threshold: 25,
        image: {
            url: 'https://images.unsplash.com/photo-1542834292982-0c6d0d0c0c0c?w=400'
        }
    },
    {
        name: 'Tomatoes',
        description: 'Cherry tomatoes',
        price: 39,
        stock: 45,
        threshold: 25,
        image: {
            url: 'https://images.unsplash.com/photo-1542834292982-0c6d0d0c0c0c?w=400'
        }
    },
    {
        name: 'Jalapeños',
        description: 'Spicy jalapeños',
        price: 44,
        stock: 30,
        threshold: 25,
        image: {
            url: 'https://images.unsplash.com/photo-1542834292982-0c6d0d0c0c0c?w=400'
        }
    }
];

const meats = [
    {
        name: 'Pepperoni',
        description: 'Classic pepperoni slices',
        price: 89,
        stock: 50,
        threshold: 15,
        image: {
            url: 'https://images.unsplash.com/photo-1542834292982-0c6d0d0c0c0c?w=400'
        }
    },
    {
        name: 'Sausage',
        description: 'Italian sausage crumbles',
        price: 79,
        stock: 45,
        threshold: 15,
        image: {
            url: 'https://images.unsplash.com/photo-1542834292982-0c6d0d0c0c0c?w=400'
        }
    },
    {
        name: 'Bacon',
        description: 'Crispy bacon bits',
        price: 99,
        stock: 40,
        threshold: 15,
        image: {
            url: 'https://images.unsplash.com/photo-1542834292982-0c6d0d0c0c0c?w=400'
        }
    },
    {
        name: 'Ham',
        description: 'Sliced ham',
        price: 69,
        stock: 35,
        threshold: 15,
        image: {
            url: 'https://images.unsplash.com/photo-1542834292982-0c6d0d0c0c0c?w=400'
        }
    },
    {
        name: 'Chicken',
        description: 'Grilled chicken strips',
        price: 89,
        stock: 30,
        threshold: 15,
        image: {
            url: 'https://images.unsplash.com/photo-1542834292982-0c6d0d0c0c0c?w=400'
        }
    }
];

// Seed function
const seedDatabase = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Clear existing data
        await Promise.all([
            PizzaBase.deleteMany({}),
            Sauce.deleteMany({}),
            Cheese.deleteMany({}),
            Veggie.deleteMany({}),
            Meat.deleteMany({})
        ]);
        console.log('Cleared existing data');

        // Insert new data
        await Promise.all([
            PizzaBase.insertMany(pizzaBases),
            Sauce.insertMany(sauces),
            Cheese.insertMany(cheeses),
            Veggie.insertMany(veggies),
            Meat.insertMany(meats)
        ]);
        console.log('Data seeded successfully');

        // Create admin user if not exists
        const adminExists = await User.findOne({ role: 'admin' });
        if (!adminExists) {
            const adminUser = new User({
                name: 'Admin User',
                email: 'rahulkohli7078@gmail.com',
                password: 'admin123',
                role: 'admin',
                isEmailVerified: true
            });
            await adminUser.save();
            console.log('Admin user created: rahulkohli7078@gmail.com / admin123');
        }

        console.log('Database seeding completed!');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
};

// Run seed function
seedDatabase();
