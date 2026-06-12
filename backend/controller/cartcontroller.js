import cartService from '../services/cartService.js';
import userService from '../services/userService.js';

const MAX_INT = 2147483647;

export const createCart = async (req, res) => {
    try {
        // Get userId from JWT token (set by authenticateToken middleware)
        const userId = req.user.userId;

        // Verify user exists
        const user = await userService.getUserById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        const cart = await cartService.createCart(userId);

        res.status(201).json({
            success: true,
            message: "Cart created successfully",
            data: cart
        });
    } catch (error) {
        // Log error for debugging (server-side only)
        console.error('Create cart error:', error);

        // Generic error response (don't expose internal details)
        res.status(500).json({
            success: false,
            message: "Failed to create cart. Please try again later"
        });
    }
};
