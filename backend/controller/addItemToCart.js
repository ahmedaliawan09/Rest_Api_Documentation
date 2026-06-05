import productService from '../services/productService.js';
import cartService from '../services/cartService.js';
import prisma from '../config/prisma.js';

const MAX_INT = 2147483647;

export const addItemToCart = async (req, res) => {
    try {
        const { cartId, productId, quantity } = req.body;

        // Validation - Check required fields
        if (!cartId || !productId || !quantity) {
            return res.status(400).json({
                success: false,
                message: "Missing required fields: cartId, productId, and quantity are required"
            });
        }

        // Validate cartId type and format
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

        // Validate productId type and format
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

        // Validate quantity type and format
        const quantityStr = String(quantity);
        if (!/^\d+$/.test(quantityStr)) {
            return res.status(400).json({
                success: false,
                message: "Invalid quantity format"
            });
        }

        if (quantityStr.length > 10) {
            return res.status(400).json({
                success: false,
                message: "Quantity exceeds maximum allowed value"
            });
        }

        const parsedQuantity = parseInt(quantityStr, 10);
        if (parsedQuantity <= 0 || parsedQuantity > MAX_INT) {
            return res.status(400).json({
                success: false,
                message: "Quantity must be a positive number"
            });
        }

        // Use Prisma transaction for consistency
        const result = await prisma.$transaction(async (tx) => {
            // Get cart
            const cart = await tx.cart.findUnique({
                where: { id: parsedCartId },
                include: { cart_items: true }
            });

            if (!cart) {
                throw { statusCode: 404, message: "Cart not found" };
            }

            // Check if cart is already checked out
            if (cart.status === "CHECKED_OUT") {
                throw {
                    statusCode: 400,
                    message: "Cannot add items to checked-out cart"
                };
            }

            // Get product
            const product = await tx.product.findUnique({
                where: { id: parsedProductId }
            });

            if (!product) {
                throw { statusCode: 404, message: "Product not found" };
            }

            // Check if product is active
            if (product.status !== 'ACTIVE') {
                throw {
                    statusCode: 400,
                    message: "Product is not available"
                };
            }

            // Check if product has sufficient quantity
            if (parsedQuantity > product.stock_quantity) {
                throw {
                    statusCode: 400,
                    message: `Insufficient stock. Only ${product.stock_quantity} available`
                };
            }

            // Check if item already exists in cart
            const existingItem = await tx.cartItem.findUnique({
                where: {
                    cart_id_product_id: {
                        cart_id: parsedCartId,
                        product_id: parsedProductId
                    }
                }
            });

            if (existingItem) {
                // Update existing item
                const totalQuantity = existingItem.quantity + parsedQuantity;
                
                if (totalQuantity > product.stock_quantity) {
                    throw {
                        statusCode: 400,
                        message: `Cannot add ${parsedQuantity} more. You already have ${existingItem.quantity} in cart and only ${product.stock_quantity} available in stock`
                    };
                }

                await tx.cartItem.update({
                    where: { id: existingItem.id },
                    data: {
                        quantity: totalQuantity,
                        total: parseFloat(product.price) * totalQuantity
                    }
                });
            } else {
                // Add new item
                await tx.cartItem.create({
                    data: {
                        cart_id: parsedCartId,
                        product_id: parsedProductId,
                        quantity: parsedQuantity,
                        unit_price: parseFloat(product.price),
                        total: parseFloat(product.price) * parsedQuantity
                    }
                });
            }

            // Update product stock
            await tx.product.update({
                where: { id: parsedProductId },
                data: {
                    stock_quantity: {
                        decrement: parsedQuantity
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
            message: "Item added to cart successfully",
            data: result
        });

    } catch (error) {
        console.error('Add item to cart error:', error);

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
            message: "Failed to add item to cart. Please try again later"
        });
    }
};