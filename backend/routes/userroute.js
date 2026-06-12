import express from "express";
import {
    createUser,
    getAllUsers
} from "../controller/usercontroller.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

/**
 * Public route - No authentication required for user registration
 * This allows new users to sign up
 */
router.post("/", createUser);

/**
 * Protected route - Authentication required
 */
router.get("/", authenticateToken, getAllUsers);

export default router;