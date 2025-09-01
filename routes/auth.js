const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const { 
    sendVerificationEmail, 
    sendPasswordResetEmail 
} = require('../utils/sendEmail');

// Register user
router.post('/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Check if user already exists
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({
                message: 'User already exists with this email'
            });
        }

        // Create user
        user = new User({
            name,
            email,
            password
        });

        // Generate email verification token
        const verificationToken = user.getEmailVerificationToken();
        await user.save();

        // Send verification email
        try {
            await sendVerificationEmail(user.email, verificationToken);
            res.status(201).json({
                message: 'Registration successful. Please check your email to verify your account.'
            });
        } catch (error) {
            // If email fails, still create user but inform about email issue
            res.status(201).json({
                message: 'Registration successful but verification email could not be sent. Please contact support.'
            });
        }
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            message: 'Error in registration',
            error: error.message
        });
    }
});

// Login user
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if user exists
        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            return res.status(401).json({
                message: 'Invalid email or password'
            });
        }

        // Check if password is correct
        const isPasswordCorrect = await user.comparePassword(password);
        if (!isPasswordCorrect) {
            return res.status(401).json({
                message: 'Invalid email or password'
            });
        }

        // Check if email is verified
        if (!user.isEmailVerified) {
            return res.status(401).json({
                message: 'Please verify your email before logging in'
            });
        }

        // Generate JWT token
        const token = user.getJwtToken();

        res.status(200).json({
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                avatar: user.avatar
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            message: 'Error in login',
            error: error.message
        });
    }
});

// Verify email
router.get('/verify-email/:token', async (req, res) => {
    try {
        const { token } = req.params;

        // Hash the token
        const hashedToken = crypto
            .createHash('sha256')
            .update(token)
            .digest('hex');

        // Find user with this token
        const user = await User.findOne({
            emailVerificationToken: hashedToken,
            emailVerificationExpire: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({
                message: 'Invalid or expired verification token'
            });
        }

        // Update user
        user.isEmailVerified = true;
        user.emailVerificationToken = undefined;
        user.emailVerificationExpire = undefined;
        await user.save();

        res.status(200).json({
            message: 'Email verified successfully. You can now log in.'
        });
    } catch (error) {
        console.error('Email verification error:', error);
        res.status(500).json({
            message: 'Error in email verification',
            error: error.message
        });
    }
});

// Forgot password
router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({
                message: 'User not found with this email'
            });
        }

        // Generate reset token
        const resetToken = user.getResetPasswordToken();
        await user.save();

        // Send reset email
        try {
            await sendPasswordResetEmail(user.email, resetToken);
            res.status(200).json({
                message: 'Password reset email sent successfully'
            });
        } catch (error) {
            user.resetPasswordToken = undefined;
            user.resetPasswordExpire = undefined;
            await user.save();

            return res.status(500).json({
                message: 'Email could not be sent'
            });
        }
    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({
            message: 'Error in forgot password',
            error: error.message
        });
    }
});

// Reset password
router.put('/reset-password/:token', async (req, res) => {
    try {
        const { token } = req.params;
        const { password } = req.body;

        // Hash the token
        const hashedToken = crypto
            .createHash('sha256')
            .update(token)
            .digest('hex');

        // Find user with this token
        const user = await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpire: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({
                message: 'Invalid or expired reset token'
            });
        }

        // Update password
        user.password = password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save();

        res.status(200).json({
            message: 'Password reset successful'
        });
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({
            message: 'Error in reset password',
            error: error.message
        });
    }
});

// Get current user
router.get('/me', protect, async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                message: 'User not found'
            });
        }
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({
                message: 'User not found'
            });
        }
        res.status(200).json({
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                avatar: user.avatar,
                isEmailVerified: user.isEmailVerified
            }
        });
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({
            message: 'Error getting user',
            error: error.message
        });
    }
});

// Logout user
router.post('/logout', (req, res) => {
    res.status(200).json({
        message: 'Logged out successfully'
    });
});

module.exports = router;
