import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import cartRoutes from "./routes/cartroute.js";
import productRoutes from "./routes/productroute.js";
import userRoutes from "./routes/userroute.js";
import authRoutes from "./routes/authRoute.js";
import { requestLogger } from "./middleware/requestLogger.js";
import { detailedLogger } from "./middleware/detailedLogger.js";
import logger from "./config/logger.js";

dotenv.config();
const app = express();

app.use(express.json());
app.use(cors());
app.use(helmet());


app.use(requestLogger);
app.use(detailedLogger);

// Health check endpoint
app.get("/health", (req, res) => {
    res.status(200).json({
        status: "ok",
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || "development"
    });
});

// Auth routes (public - no token required)
app.use("/api/auth", authRoutes);

// Existing routes (currently public, can protect later)
app.use("/api/cart", cartRoutes);
app.use("/api/products", productRoutes);
app.use("/api/users", userRoutes);


app.use((err, req, res, next) => {
    logger.error('UNCAUGHT ERROR', {
        error: err.message,
        stack: err.stack,
        method: req.method,
        url: req.originalUrl,
        ip: req.ip,
        userId: req.user?.id || 'anonymous'
    });
    
    res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: {
            reason: err.message
        }
    });
});

export default app;