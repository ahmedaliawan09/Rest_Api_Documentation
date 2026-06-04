import Product from "../models/Product.js";
import Cart from "../models/Cart.js";

export const addItemToCart = async (req, res) => {
    try {
        const { cartId, productId, quantity } = req.body;

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

        // Check if cart is already checked out
        if (cart.status === "CHECKED_OUT") {
            return res.status(400).json({
                success: false,
                message: "Cannot add items to checked-out cart",
                error: {
                    reason: "This cart has already been checked out",
                    possibleCauses: [
                        "Cart was already processed",
                        "Need to create a new cart for additional items"
                    ],
                    solution: "Please create a new cart to add more items"
                }
            });
        }

        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).json({
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

        // Check if product has sufficient quantity available
        if (quantity > product.quantity) {
            return res.status(400).json({
                success: false,
                message: "Insufficient product quantity",
                error: {
                    reason: `Requested quantity (${quantity}) exceeds available stock (${product.quantity})`,
                    availableQuantity: product.quantity,
                    requestedQuantity: quantity,
                    possibleCauses: [
                        "Requested quantity is greater than available stock",
                        "Product inventory is low"
                    ]
                }
            });
        }

        // Check if item already exists in cart
        const existingItem = cart.items.find(item => item.productId.toString() === productId);
        
        if (existingItem) {
            // Check if updating quantity would exceed available stock
            const totalQuantity = existingItem.quantity + quantity;
            if (totalQuantity > product.quantity) {
                return res.status(400).json({
                    success: false,
                    message: "Insufficient product quantity",
                    error: {
                        reason: `Adding ${quantity} more would exceed available stock (${product.quantity}). You already have ${existingItem.quantity} in cart.`,
                        availableQuantity: product.quantity,
                        currentCartQuantity: existingItem.quantity,
                        requestedAdditionalQuantity: quantity,
                        maxCanAdd: product.quantity - existingItem.quantity,
                        possibleCauses: [
                            "Total quantity would exceed available stock",
                            "Product inventory is low"
                        ]
                    }
                });
            }
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

        // Decrease product quantity
        product.quantity -= quantity;
        await product.save();

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