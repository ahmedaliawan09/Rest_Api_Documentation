import express from "express";
import { createCart } from "../controller/cartcontroller.js";
import { addItemToCart } from "../controller/addItemToCart.js";
import { removeItemFromCart } from "../controller/removeItemFromCart.js";
import { checkoutCart } from "../controller/checkoutCart.js";
import { deleteCart } from "../controller/deleteCart.js";
import { validateObjectId } from "../middleware/validateObjectId.js";

const router = express.Router();

router.post("/create", validateObjectId('userId'), createCart);
router.post("/add-item", validateObjectId('cartId', 'productId'), addItemToCart);
router.delete("/remove-item/:productId", validateObjectId('cartId', 'productId'), removeItemFromCart);
router.post("/checkout", validateObjectId('cartId'), checkoutCart);
router.delete("/:cartId", validateObjectId('cartId'), deleteCart);

export default router;