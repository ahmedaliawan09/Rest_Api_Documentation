import express from "express";

import { createCart } from "../controller/cartcontroller.js";

import { addItemToCart } from "../controller/addItemToCart.js";

import { removeItemFromCart } from "../controller/removeItemFromCart.js";

import { checkoutCart } from "../controller/checkoutCart.js";

import { deleteCart } from "../controller/deleteCart.js";


const router = express.Router();

router.post("/create", createCart);

router.post("/add-item", addItemToCart);

router.delete("/remove-item/:productId", removeItemFromCart);

router.post("/checkout", checkoutCart);

router.delete("/:cartId", deleteCart);

export default router;