import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import connectdb from "./config/db.js"
import cartRoutes from "./routes/cartroute.js";
import productRoutes from "./routes/productroute.js";
import userRoutes from "./routes/userroute.js";
import { requestLogger } from "./middleware/requestLogger.js";
import { detailedLogger } from "./middleware/detailedLogger.js";
import logger from "./config/logger.js";

dotenv.config();
connectdb();
const app = express();

app.use(express.json());
app.use(cors());
app.use(helmet());

// Add logging middleware
app.use(requestLogger);
app.use(detailedLogger);

app.use("/api/cart", cartRoutes);
app.use("/api/products", productRoutes);
app.use("/api/users", userRoutes);

// Global error handler for uncaught errors
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