import User from "../models/User.js";
import Product from "../models/Product.js";
import Cart from "../models/Cart.js";

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