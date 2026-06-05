import prisma from '../config/prisma.js';

/**
 * Cart Service - Handles all cart-related database operations
 */

class CartService {
    /**
     * Create a new cart for a user
     * @param {number} userId - User ID
     * @returns {Promise<Object>} Created cart
     */
    async createCart(userId) {
        return await prisma.cart.create({
            data: {
                user_id: userId,
                subtotal: 0,
                total_amount: 0,
                status: 'ACTIVE'
            },
            include: {
                cart_items: true
            }
        });
    }

    /**
     * Get cart by ID
     * @param {number} id - Cart ID
     * @returns {Promise<Object|null>} Cart with items and products
     */
    async getCartById(id) {
        return await prisma.cart.findUnique({
            where: { id },
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
    }

    /**
     * Get all carts for a user
     * @param {number} userId - User ID
     * @param {string} status - Optional status filter ('ACTIVE' or 'CHECKED_OUT')
     * @returns {Promise<Array>} List of carts
     */
    async getUserCarts(userId, status = null) {
        const where = { user_id: userId };
        if (status) {
            where.status = status;
        }

        return await prisma.cart.findMany({
            where,
            include: {
                cart_items: {
                    include: {
                        product: true
                    }
                }
            },
            orderBy: { created_at: 'desc' }
        });
    }

    /**
     * Get user's active cart
     * @param {number} userId - User ID
     * @returns {Promise<Object|null>} Active cart or null
     */
    async getActiveCart(userId) {
        return await prisma.cart.findFirst({
            where: {
                user_id: userId,
                status: 'ACTIVE'
            },
            include: {
                cart_items: {
                    include: {
                        product: true
                    }
                }
            }
        });
    }

    /**
     * Update cart totals
     * @param {number} cartId - Cart ID
     * @param {number} subtotal - New subtotal
     * @param {number} totalAmount - New total amount
     * @returns {Promise<Object>} Updated cart
     */
    async updateCartTotals(cartId, subtotal, totalAmount) {
        return await prisma.cart.update({
            where: { id: cartId },
            data: {
                subtotal,
                total_amount: totalAmount
            }
        });
    }

    /**
     * Update cart status
     * @param {number} cartId - Cart ID
     * @param {string} status - New status ('ACTIVE' or 'CHECKED_OUT')
     * @returns {Promise<Object>} Updated cart
     */
    async updateCartStatus(cartId, status) {
        return await prisma.cart.update({
            where: { id: cartId },
            data: { status }
        });
    }

    /**
     * Delete cart
     * @param {number} cartId - Cart ID
     * @returns {Promise<Object>} Deleted cart
     */
    async deleteCart(cartId) {
        return await prisma.cart.delete({
            where: { id: cartId }
        });
    }

    /**
     * Add item to cart
     * @param {number} cartId - Cart ID
     * @param {number} productId - Product ID
     * @param {number} quantity - Quantity
     * @param {number} unitPrice - Unit price
     * @returns {Promise<Object>} Created cart item
     */
    async addItemToCart(cartId, productId, quantity, unitPrice) {
        const total = unitPrice * quantity;

        return await prisma.cartItem.create({
            data: {
                cart_id: cartId,
                product_id: productId,
                quantity,
                unit_price: unitPrice,
                total
            },
            include: {
                product: true
            }
        });
    }

    /**
     * Get cart item
     * @param {number} cartId - Cart ID
     * @param {number} productId - Product ID
     * @returns {Promise<Object|null>} Cart item or null
     */
    async getCartItem(cartId, productId) {
        return await prisma.cartItem.findUnique({
            where: {
                cart_id_product_id: {
                    cart_id: cartId,
                    product_id: productId
                }
            },
            include: {
                product: true
            }
        });
    }

    /**
     * Update cart item quantity
     * @param {number} cartItemId - Cart item ID
     * @param {number} quantity - New quantity
     * @param {number} unitPrice - Unit price
     * @returns {Promise<Object>} Updated cart item
     */
    async updateCartItem(cartItemId, quantity, unitPrice) {
        const total = unitPrice * quantity;

        return await prisma.cartItem.update({
            where: { id: cartItemId },
            data: {
                quantity,
                total
            }
        });
    }

    /**
     * Remove item from cart
     * @param {number} cartId - Cart ID
     * @param {number} productId - Product ID
     * @returns {Promise<Object>} Deleted cart item
     */
    async removeItemFromCart(cartId, productId) {
        return await prisma.cartItem.delete({
            where: {
                cart_id_product_id: {
                    cart_id: cartId,
                    product_id: productId
                }
            }
        });
    }

    /**
     * Get all items in cart
     * @param {number} cartId - Cart ID
     * @returns {Promise<Array>} List of cart items
     */
    async getCartItems(cartId) {
        return await prisma.cartItem.findMany({
            where: { cart_id: cartId },
            include: {
                product: true
            }
        });
    }

    /**
     * Clear all items from cart
     * @param {number} cartId - Cart ID
     * @returns {Promise<Object>} Delete count
     */
    async clearCart(cartId) {
        return await prisma.cartItem.deleteMany({
            where: { cart_id: cartId }
        });
    }

    /**
     * Calculate cart totals
     * @param {number} cartId - Cart ID
     * @returns {Promise<Object>} Cart totals { subtotal, totalAmount }
     */
    async calculateCartTotals(cartId) {
        const items = await prisma.cartItem.findMany({
            where: { cart_id: cartId }
        });

        const subtotal = items.reduce((sum, item) => {
            return sum + parseFloat(item.total);
        }, 0);

        return {
            subtotal,
            totalAmount: subtotal // Can add tax, shipping, etc. later
        };
    }
}

export default new CartService();
