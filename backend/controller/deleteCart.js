import prisma from '../config/prisma.js';

const MAX_INT = 2147483647;

export const deleteCart = async (req, res) => {
    try {
        const { cartId } = req.params;

        // Validate cartId
        if (!cartId) {
            return res.status(400).json({
                success: false,
                message: "Cart ID is required"
            });
        }

        const cartIdStr = String(cartId);
        if (!/^\d+$/.test(cartIdStr)) {
            return res.status(400).json({
                success: false,
                message: "Invalid cart ID format"
            });
        }

        if (cartIdStr.length > 10) {
            return res.status(400).json({
                success: false,
                message: "Cart ID exceeds maximum allowed value"
            });
        }

        const parsedCartId = parseInt(cartIdStr, 10);
        if (parsedCartId <= 0 || parsedCartId > MAX_INT) {
            return res.status(400).json({
                success: false,
                message: "Cart ID exceeds maximum allowed value"
            });
        }

        // Check if cart exists
        const cart = await prisma.cart.findUnique({
            where: { id: parsedCartId }
        });

        if (!cart) {
            return res.status(404).json({
                success: false,
                message: "Cart not found"
            });
        }

        // Delete cart (cascades to cart_items automatically due to schema)
        await prisma.cart.delete({
            where: { id: parsedCartId }
        });

        res.status(200).json({
            success: true,
            message: "Cart deleted successfully"
        });

    } catch (error) {
        console.error('Delete cart error:', error);

        // Generic server error - hide internal details
        res.status(500).json({
            success: false,
            message: "Failed to delete cart. Please try again later"
        });
    }
};