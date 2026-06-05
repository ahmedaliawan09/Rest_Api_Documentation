import prisma from '../config/prisma.js';

const MAX_INT = 2147483647;

export const checkoutCart = async (req, res) => {
    try {
        const { cartId } = req.body;

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

        // Use Prisma transaction for consistency
        const result = await prisma.$transaction(async (tx) => {
            // Get cart with items
            const cart = await tx.cart.findUnique({
                where: { id: parsedCartId },
                include: {
                    cart_items: true
                }
            });

            if (!cart) {
                throw { statusCode: 404, message: "Cart not found" };
            }

            // Check if cart is already checked out
            if (cart.status === 'CHECKED_OUT') {
                throw {
                    statusCode: 400,
                    message: "Cart has already been checked out"
                };
            }

            // Check if cart has items
            if (cart.cart_items.length === 0) {
                throw {
                    statusCode: 400,
                    message: "Cannot checkout an empty cart"
                };
            }

            // Update cart status to CHECKED_OUT
            const updatedCart = await tx.cart.update({
                where: { id: parsedCartId },
                data: {
                    status: 'CHECKED_OUT'
                },
                include: {
                    cart_items: {
                        include: {
                            product: true
                        }
                    },
                    user: {
                        select: {
                            id: true,
                            first_name: true,
                            last_name: true,
                            email: true
                        }
                    }
                }
            });

            return updatedCart;
        });

        res.status(200).json({
            success: true,
            message: "Checkout completed successfully",
            data: result
        });

    } catch (error) {
        console.error('Checkout cart error:', error);

        // Handle custom transaction errors
        if (error.statusCode) {
            return res.status(error.statusCode).json({
                success: false,
                message: error.message
            });
        }

        // Generic server error - hide internal details
        res.status(500).json({
            success: false,
            message: "Checkout failed. Please try again later"
        });
    }
};
