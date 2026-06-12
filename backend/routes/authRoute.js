import express from 'express';
import { register, login, getProfile } from '../controller/authController.js';
import { authenticateToken } from '../middleware/auth.js';
import jwt from 'jsonwebtoken';

const router = express.Router();

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post('/register', register);

/**
 * @route   POST /api/auth/login
 * @desc    Login user and get token
 * @access  Public
 */
router.post('/login', login);

/**
 * @route   GET /api/auth/me
 * @desc    Get current user profile
 * @access  Private (requires token)
 */
router.get('/me', authenticateToken, getProfile);

/**
 * @route   POST /api/auth/verify-token
 * @desc    Debug endpoint to verify token
 * @access  Public (for testing only)
 */
router.post('/verify-token', (req, res) => {
    try {
        const { token } = req.body;
        
        if (!token) {
            return res.status(400).json({
                success: false,
                error: 'Token is required'
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        res.status(200).json({
            success: true,
            message: 'Token is valid',
            decoded
        });
    } catch (error) {
        res.status(403).json({
            success: false,
            error: 'Invalid token',
            details: error.message
        });
    }
});

export default router;
