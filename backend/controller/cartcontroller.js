import cartService from '../services/cartService.js';
import userService from '../services/userService.js';

const MAX_INT = 2147483647;

export const createCart = async (req, res) => {
    try {
        const { userId } = req.body;

        // Validation - Check if userId exists
        if (!userId) {
            return res.status(400).json({
                success: false,
                message: "User ID is required"
            });
        }

        // Validate userId type - must be string or number
        if (typeof userId !== 'string' && typeof userId !== 'number') {
            return res.status(400).json({
                success: false,
                message: "Invalid user ID"
            });
        }

        // Convert to string to check length and format
        const userIdStr = String(userId);

        // Check if it's a valid numeric string (no scientific notation, no decimals)
        if (!/^\d+$/.test(userIdStr)) {
            return res.status(400).json({
                success: false,
                message: "Invalid user ID format"
            });
        }

        // Check length - INT max is 2147483647 (10 digits)
        if (userIdStr.length > 10) {
            return res.status(400).json({
                success: false,
                message: "User ID exceeds maximum allowed value"
            });
        }

        // Parse to integer
        const userIdNum = parseInt(userIdStr, 10);

        // Validate range
        if (userIdNum <= 0 || userIdNum > MAX_INT) {
            return res.status(400).json({
                success: false,
                message: "User ID exceeds maximum allowed value"
            });
        }

        // Verify user exists
        const user = await userService.getUserById(userIdNum);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        const cart = await cartService.createCart(userIdNum);

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
