# Pizza Ordering Backend API

A comprehensive backend API for a pizza ordering system built with Node.js, Express, and MongoDB.

## Features

- **User Authentication & Authorization**
  - User registration with email verification
  - Admin and user login
  - JWT-based authentication
  - Forgot password functionality
  - Role-based access control

- **Pizza Customization**
  - 5 pizza base options
  - 5 sauce varieties
  - Multiple cheese types
  - Various vegetable toppings
  - Meat options

- **Order Management**
  - Custom pizza creation
  - Order placement and tracking
  - Real-time order status updates
  - Order history

- **Payment Integration**
  - Razorpay payment gateway (test mode)
  - Payment verification
  - Order confirmation

- **Inventory Management**
  - Stock tracking for all ingredients
  - Low stock notifications
  - Admin dashboard for inventory control
  - Automatic stock updates after orders

- **Admin Features**
  - Order status management
  - User management
  - Inventory CRUD operations
  - Low stock email notifications
  - Dashboard analytics

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT, bcryptjs
- **Email**: Nodemailer
- **Payment**: Razorpay
- **Validation**: Built-in Mongoose validation

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   - Copy `config.env.example` to `config.env`
   - Update the configuration values:
     - MongoDB connection string
     - JWT secret
     - Email credentials (Gmail)
     - Razorpay test keys
     - Stock thresholds

4. **Database Setup**
   - Ensure MongoDB is running
   - Update `MONGODB_URI` in `config.env`

5. **Seed Database** (Optional)
   ```bash
   node seedData.js
   ```
   This will create sample pizza ingredients and an admin user.

## Environment Variables

Create a `config.env` file with the following variables:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/pizza_ordering_app

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here_make_it_long_and_secure
JWT_EXPIRE=7d

# Email Configuration (Gmail)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password_here

# Razorpay Configuration (Test Mode)
RAZORPAY_KEY_ID=rzp_test_your_test_key_id
RAZORPAY_KEY_SECRET=your_test_secret_key

# Stock Threshold Configuration
BASE_THRESHOLD=20
SAUCE_THRESHOLD=15
CHEESE_THRESHOLD=10
VEGGIE_THRESHOLD=25
MEAT_THRESHOLD=15

# Admin Email for Notifications
ADMIN_EMAIL=admin@pizzashop.com
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/verify-email/:token` - Email verification
- `POST /api/auth/forgot-password` - Forgot password
- `PUT /api/auth/reset-password/:token` - Reset password
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout

### Pizza Options
- `GET /api/pizza/all-options` - Get all pizza ingredients
- `GET /api/pizza/bases` - Get pizza bases
- `GET /api/pizza/sauces` - Get sauces
- `GET /api/pizza/cheeses` - Get cheeses
- `GET /api/pizza/veggies` - Get vegetables
- `GET /api/pizza/meats` - Get meat options

### Orders
- `POST /api/order/create` - Create new order
- `POST /api/order/payment/verify` - Verify payment
- `GET /api/order/my-orders` - Get user orders
- `GET /api/order/:id` - Get specific order
- `PUT /api/order/:id/status` - Update order status (Admin)
- `PUT /api/order/:id/cancel` - Cancel order

### Admin
- `GET /api/admin/dashboard` - Admin dashboard stats
- `GET /api/admin/orders` - Get all orders
- `GET /api/admin/users` - Get all users
- `POST /api/admin/create-admin` - Create admin user
- `GET /api/admin/inventory` - Get inventory overview
- `POST /api/admin/check-low-stock` - Check low stock

### Inventory Management
- `GET /api/inventory/:category` - Get items by category
- `POST /api/inventory/:category` - Create new item
- `PUT /api/inventory/:category/:id` - Update item
- `DELETE /api/inventory/:category/:id` - Delete item
- `PATCH /api/inventory/:category/:id/stock` - Update stock
- `PATCH /api/inventory/bulk-stock-update` - Bulk stock update

### User Management
- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update profile
- `PUT /api/user/change-password` - Change password
- `DELETE /api/user/profile` - Delete account

## Database Models

- **User**: Authentication and user management
- **PizzaBase**: Pizza crust options
- **Sauce**: Pizza sauce varieties
- **Cheese**: Cheese types
- **Veggie**: Vegetable toppings
- **Meat**: Meat toppings
- **Order**: Order management and tracking

## Running the Application

1. **Development Mode**
   ```bash
   npm run dev
   ```

2. **Production Mode**
   ```bash
   npm start
   ```

3. **Seed Database**
   ```bash
   node seedData.js
   ```

## Default Admin Account

After running the seed script, you'll have access to:
- **Email**: admin@pizzashop.com
- **Password**: admin123

## API Testing

You can test the API endpoints using:
- Postman
- Insomnia
- Thunder Client (VS Code extension)

## Security Features

- Password hashing with bcrypt
- JWT token authentication
- Role-based access control
- Input validation and sanitization
- CORS configuration
- Rate limiting (can be added)

## Error Handling

- Centralized error handling middleware
- Consistent error response format
- Detailed logging for debugging
- User-friendly error messages

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the ISC License.

## Support

For support and questions, please contact the development team or create an issue in the repository.
