const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    const message = {
        from: `${process.env.EMAIL_USER}`,
        to: options.email,
        subject: options.subject,
        text: options.message,
        html: options.html
    };

    await transporter.sendMail(message);
};

// Send email verification
const sendVerificationEmail = async (email, verificationToken) => {
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`;
    
    const message = `
        <h1>Email Verification</h1>
        <p>Please click the link below to verify your email address:</p>
        <a href="${verificationUrl}">Verify Email</a>
        <p>This link will expire in 30 minutes.</p>
        <p>If you didn't create an account, please ignore this email.</p>
    `;

    await sendEmail({
        email,
        subject: 'Email Verification - Pizza Ordering App',
        message: message,
        html: message
    });
};

// Send password reset email
const sendPasswordResetEmail = async (email, resetToken) => {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
    
    const message = `
        <h1>Password Reset</h1>
        <p>You requested a password reset. Please click the link below to reset your password:</p>
        <a href="${resetUrl}">Reset Password</a>
        <p>This link will expire in 30 minutes.</p>
        <p>If you didn't request a password reset, please ignore this email.</p>
    `;

    await sendEmail({
        email,
        subject: 'Password Reset - Pizza Ordering App',
        message: message,
        html: message
    });
};

// Send low stock notification to admin
const sendLowStockNotification = async (itemName, currentStock, threshold) => {
    const message = `
        <h1>Low Stock Alert</h1>
        <p><strong>Item:</strong> ${itemName}</p>
        <p><strong>Current Stock:</strong> ${currentStock}</p>
        <p><strong>Threshold:</strong> ${threshold}</p>
        <p>Please restock this item as soon as possible.</p>
    `;

    await sendEmail({
        email: process.env.ADMIN_EMAIL,
        subject: `Low Stock Alert - ${itemName}`,
        message: message,
        html: message
    });
};

// Send order status update notification
const sendOrderStatusUpdate = async (userEmail, orderId, newStatus) => {
    const message = `
        <h1>Order Status Update</h1>
        <p>Your order #${orderId} status has been updated to: <strong>${newStatus}</strong></p>
        <p>Thank you for choosing our pizza service!</p>
    `;

    await sendEmail({
        email: userEmail,
        subject: `Order Status Update - Order #${orderId}`,
        message: message,
        html: message
    });
};

module.exports = {
    sendEmail,
    sendVerificationEmail,
    sendPasswordResetEmail,
    sendLowStockNotification,
    sendOrderStatusUpdate
};
