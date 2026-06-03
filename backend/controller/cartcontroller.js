import User from "../models/User.js";
import Product from "../models/Product.js";
import Cart from "../models/Cart.js";

export const createCart = async (req, res) => {
    try {
        const { userId } = req.body;

        const cart = await Cart.create({
            userId,
            items: []
        });

        res.status(201).json({
            success: true,
            message: "Cart created successfully",
            data: cart
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to create cart",
            error: {
                reason: error.message,
                possibleCauses: [
                    "Database connection issue",
                    "Invalid user ID",
                    "Server error"
                ]
            }
        });
    }
};

export const addItemToCart = async (req, res) => {
    try {
        const { cartId, productId, quantity } = req.body;

        const cart = await Cart.findById(cartId);

        if (!cart) {
            res.status(404).json({
                success: false,
                message: "Cart not found",
                error: {
                    reason: "No cart exists with the provided ID",
                    possibleCauses: [
                        "Invalid cart ID",
                        "Cart was deleted",
                        "Cart does not exist"
                    ]
                }
            });
        }

        const product = await Product.findById(productId);

        if (!product) {
            res.status(404).json({
                success: false,
                message: "Product not found",
                error: {
                    reason: "No product exists with the provided ID",
                    possibleCauses: [
                        "Invalid product ID",
                        "Product was removed",
                        "Product does not exist"
                    ]
                }
            });
        }

        const total = product.price * quantity;

        cart.items.push({
            productId,
            quantity,
            unitPrice: product.price,
            total
        });

        cart.subtotal += total;
        cart.totalAmount += total;

        await cart.save();

        res.status(200).json({
            success: true,
            message: "Item added to cart successfully",
            data: cart
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to add item to cart",
            error: {
                reason: error.message,
                possibleCauses: [
                    "Database error",
                    "Invalid request data",
                    "Server error"
                ]
            }
        });
    }
};

export const removeItemFromCart = async (req, res) => {
    try {

        const { cartId } = req.body;
        const { productId } = req.params;

        const cart = await Cart.findById(cartId);

        if (!cart) {
            res.status(404).json({
                success: false,
                message: "Cart not found",
                error: {
                    reason: "No cart exists with the provided ID",
                    possibleCauses: [
                        "Invalid cart ID",
                        "Cart was deleted",
                        "Cart does not exist"
                    ]
                }
            });
        }

        const item = cart.items.find(
            item => item.productId.toString() === productId
        );

        if (!item) {
            res.status(404).json({
                success: false,
                message: "Item not found in cart",
                error: {
                    reason: "The specified product is not present in the cart",
                    possibleCauses: [
                        "Wrong product ID",
                        "Item already removed",
                        "Item never existed in cart"
                    ]
                }
            });
        }

        cart.subtotal -= item.total;
        cart.totalAmount -= item.total;

        cart.items = cart.items.filter(
            item => item.productId.toString() !== productId
        );

        await cart.save();

        res.status(200).json({
            success: true,
            message: "Item removed from cart successfully",
            data: cart
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to remove item from cart",
            error: {
                reason: error.message,
                possibleCauses: [
                    "Database error",
                    "Server error"
                ]
            }
        });
    }
};

export const checkoutCart = async (req, res) => {
    try {

        const { cartId } = req.body;

        const cart = await Cart.findById(cartId);

        if (!cart) {
            res.status(404).json({
                success: false,
                message: "Cart not found",
                error: {
                    reason: "No cart exists with the provided ID",
                    possibleCauses: [
                        "Invalid cart ID",
                        "Cart was deleted"
                    ]
                }
            });
        }

        cart.status = "CHECKED_OUT";

        await cart.save();

        res.status(200).json({
            success: true,
            message: "Checkout completed successfully",
            data: cart
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Checkout failed",
            error: {
                reason: error.message,
                possibleCauses: [
                    "Database issue",
                    "Cart update failed",
                    "Server error"
                ]
            }
        });
    }
};

export const deleteCart = async (req, res) => {
    try {

        const { cartId } = req.params;

        const cart = await Cart.findByIdAndDelete(cartId);

        if (!cart) {
            res.status(404).json({
                success: false,
                message: "Cart not found",
                error: {
                    reason: "No cart exists with the provided ID",
                    possibleCauses: [
                        "Invalid cart ID",
                        "Cart already deleted"
                    ]
                }
            });
        }

        res.status(200).json({
            success: true,
            message: "Cart deleted successfully"
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to delete cart",
            error: {
                reason: error.message,
                possibleCauses: [
                    "Database error",
                    "Server error"
                ]
            }
        });
    }
};