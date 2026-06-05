import prisma from '../config/prisma.js';

const MAX_INT = 2147483647;

export const removeItemFromCart = async (req, res) => {
    try {
        const { cartId } = req.body;
        const { productId } = req.params;

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

        // Validate productId (from URL params)
        if (!productId) {
            return res.status(400).json({
                success: false,
                message: "Product ID is required"
            });
        }

        const productIdStr = String(productId);
        if (!/^\d+$/.test(productIdStr)) {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID format"
            });
        }

        if (productIdStr.length > 10) {
            return res.status(400).json({
                success: false,
                message: "Product ID exceeds maximum allowed value"
            });
        }

        const parsedProductId = parseInt(productIdStr, 10);
        if (parsedProductId <= 0 || parsedProductId > MAX_INT) {
            return res.status(400).json({
                success: false,
                message: "Product ID exceeds maximum allowed value"
            });
        }

        // Use Prisma transaction for consistency
        const result = await prisma.$transaction(async (tx) => {
            // Get cart
            const cart = await tx.cart.findUnique({
                where: { id: parsedCartId }
            });

            if (!cart) {
                throw { statusCode: 404, message: "Cart not found" };
            }

            // Get cart item
            const item = await tx.cartItem.findUnique({
                where: {
                    cart_id_product_id: {
                        cart_id: parsedCartId,
                        product_id: parsedProductId
                    }
                }
            });

            if (!item) {
                throw {
                    statusCode: 404,
                    message: "Item not found in cart"
                };
            }

            // Restore product quantity
            await tx.product.update({
                where: { id: parsedProductId },
                data: {
                    stock_quantity: {
                        increment: item.quantity
                    }
                }
            });

            // Remove item from cart
            await tx.cartItem.delete({
                where: {
                    cart_id_product_id: {
                        cart_id: parsedCartId,
                        product_id: parsedProductId
                    }
                }
            });

            // Recalculate cart totals
            const cartItems = await tx.cartItem.findMany({
                where: { cart_id: parsedCartId }
            });

            const subtotal = cartItems.reduce((sum, item) => {
                return sum + parseFloat(item.total);
            }, 0);

            // Update cart totals
            const updatedCart = await tx.cart.update({
                where: { id: parsedCartId },
                data: {
                    subtotal: subtotal,
                    total_amount: subtotal
                },
                include: {
                    cart_items: {
                        include: {
                            product: true
                        }
                    }
                }
            });

            return updatedCart;
        });

        res.status(200).json({
            success: true,
            message: "Item removed from cart successfully",
            data: result
        });

    } catch (error) {
        console.error('Remove item from cart error:', error);

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
            message: "Failed to remove item from cart. Please try again later"
        });
    }
};