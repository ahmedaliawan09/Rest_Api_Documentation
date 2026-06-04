import User from "../models/User.js";
import Product from "../models/Product.js";
import Cart from "../models/Cart.js";

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
