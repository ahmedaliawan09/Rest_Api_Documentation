import Product from "../models/Product.js";

export const createProduct = async (req, res) => {
    try {
        const { name, description, price, quantity } = req.body;

        const product = await Product.create({
            name,
            description,
            price,
            quantity
        });

        res.status(201).json(product);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getAllProducts = async (req, res) => {
    try {
        const products = await Product.find();

        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};