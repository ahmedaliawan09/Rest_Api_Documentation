import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import connectdb from "./config/db.js"
import cartRoutes from "./routes/cartroute.js";
import productRoutes from "./routes/productroute.js";
import userRoutes from "./routes/userroute.js";

dotenv.config();
connectdb();
const app = express();

app.use(express.json());
app.use(cors());
app.use(helmet());

app.use("/api/cart", cartRoutes);
app.use("/api/products", productRoutes);
app.use("/api/users", userRoutes);
export default app;