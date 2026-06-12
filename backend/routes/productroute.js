import express from "express";

import {
    createProduct,
    getAllProducts
} from "../controller/productcontroller.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

/**
 * All product routes require JWT authentication
 */
router.use(authenticateToken);

router.post("/", createProduct);

router.get("/", getAllProducts);

export default router;