import jwt from 'jsonwebtoken';
import logger from '../config/logger.js';

/**
 * JWT Authentication Middleware
 * Protects routes by verifying JWT tokens
 */
export const authenticateToken = (req, res, next) => {
    try {
        // Get token from Authorization header
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1]; // Format: "Bearer TOKEN"

        if (!token) {
            logger.warn('Authentication failed: No token provided', {
                ip: req.ip,
                path: req.path
            });
            return res.status(401).json({
                success: false,
                error: 'Access denied. No token provided.'
            });
        }

        // Verify token
        jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
            if (err) {
                logger.warn('Authentication failed: Invalid token', {
                    ip: req.ip,
                    path: req.path,
                    error: err.message
                });
                return res.status(403).json({
                    success: false,
                    error: 'Invalid or expired token.'
                });
            }

            // Attach user info to request object
            req.user = user;
            logger.info('Authentication successful', {
                userId: user.userId,
                email: user.email,
                path: req.path
            });
            next();
        });
    } catch (error) {
        logger.error('Authentication error', {
            error: error.message,
            stack: error.stack
        });
        res.status(500).json({
            success: false,
            error: 'Internal server error during authentication.'
        });
    }
};

/**
 * Optional Authentication Middleware
 * Attaches user info if token exists, but doesn't require it
 */
export const optionalAuth = (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            req.user = null;
            return next();
        }

        jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
            if (err) {
                req.user = null;
            } else {
                req.user = user;
            }
            next();
        });
    } catch (error) {
        req.user = null;
        next();
    }
};
