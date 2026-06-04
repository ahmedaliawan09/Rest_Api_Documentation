import Product from "../models/Product.js";
import Cart from "../models/Cart.js";


export const removeItemFromCart = async (req, res) => {
    try {

        const { cartId } = req.body;
        const { productId } = req.params;

        const cart = await Cart.findById(cartId);

        if (!cart) {
            return res.status(404).json({
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
            return res.status(404).json({
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

        // Restore product quantity before removing from cart
        const product = await Product.findById(productId);
        if (product) {
            product.quantity += item.quantity;
            await product.save();
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