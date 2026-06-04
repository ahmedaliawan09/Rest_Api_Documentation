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
