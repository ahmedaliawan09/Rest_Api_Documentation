import mongoose from "mongoose";

const cartSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    items: [
        {
            productId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Product",
                required: true
            },

            quantity: {
                type: Number,
                required: true,
                min: 1
            },

            unitPrice: {
                type: Number,
                required: true
            },

            total: {
                type: Number,
                required: true
            }
        }
    ],

    subtotal: {
        type: Number,
        default: 0
    },

    totalAmount: {
        type: Number,
        default: 0
    },

    status: {
        type: String,
        enum: ["ACTIVE", "CHECKED_OUT"],
        default: "ACTIVE"
    }

}, {
    timestamps: true
});

const Cart = mongoose.model("Cart", cartSchema);
export default Cart;