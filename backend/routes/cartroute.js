import express from "express";

import {
    createCart,
    addItemToCart,
    removeItemFromCart,
    checkoutCart,
    deleteCart
} from "../controller/cartcontroller.js";

const router = express.Router();

router.post("/create", createCart);

router.post("/add-item", addItemToCart);

router.delete("/remove-item/:productId", removeItemFromCart);

router.post("/checkout", checkoutCart);

router.delete("/:cartId", deleteCart);

export default router;