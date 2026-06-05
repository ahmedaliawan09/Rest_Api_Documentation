import productService from '../services/productService.js';

const MAX_INT = 2147483647;
const MAX_DECIMAL = 99999999.99;

export const createProduct = async (req, res) => {
    try {
        const { name, description, price, stock_quantity, status } = req.body;

        // Validation - Check required fields
        if (!name || price === undefined || stock_quantity === undefined) {
            return res.status(400).json({
                success: false,
                message: "Missing required fields: name, price, and stock_quantity are required"
            });
        }

        // Validate name
        if (typeof name !== 'string' || name.trim().length === 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid product name"
            });
        }

        if (name.length > 255) {
            return res.status(400).json({
                success: false,
                message: "Product name is too long (max 255 characters)"
            });
        }

        // Validate description if provided
        if (description !== undefined && description !== null) {
            if (typeof description !== 'string') {
                return res.status(400).json({
                    success: false,
                    message: "Invalid product description"
                });
            }
            if (description.length > 1000) {
                return res.status(400).json({
                    success: false,
                    message: "Product description is too long (max 1000 characters)"
                });
            }
        }

        // Validate price
        const priceNum = Number(price);
        if (isNaN(priceNum) || priceNum <= 0) {
            return res.status(400).json({
                success: false,
                message: "Price must be a positive number"
            });
        }

        if (priceNum > MAX_DECIMAL) {
            return res.status(400).json({
                success: false,
                message: "Price exceeds maximum allowed value"
            });
        }

        // Validate stock_quantity
        const stockStr = String(stock_quantity);
        if (!/^\d+$/.test(stockStr)) {
            return res.status(400).json({
                success: false,
                message: "Stock quantity must be a non-negative integer"
            });
        }

        if (stockStr.length > 10) {
            return res.status(400).json({
                success: false,
                message: "Stock quantity exceeds maximum allowed value"
            });
        }

        const stockNum = parseInt(stockStr, 10);
        if (stockNum <= 0 || stockNum > MAX_INT) {
            return res.status(400).json({
                success: false,
                message: "Stock quantity must be greater than 0"
            });
        }

        // Validate status if provided
        if (status && !['ACTIVE', 'INACTIVE'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid status. Must be either ACTIVE or INACTIVE"
            });
        }

        const product = await productService.createProduct({
            name: String(name).trim(),
            description: description ? String(description).trim() : null,
            price: priceNum,
            stock_quantity: stockNum,
            status: status || 'ACTIVE'
        });

        res.status(201).json({
            success: true,
            message: "Product created successfully",
            data: product
        });
    } catch (error) {
        console.error('Create product error:', error);

        // Handle Prisma unique constraint violation
        if (error.code === 'P2002') {
            return res.status(409).json({
                success: false,
                message: "A product with this name already exists"
            });
        }

        // Generic server error - hide internal details
        res.status(500).json({
            success: false,
            message: "Failed to create product. Please try again later"
        });
    }
};

export const getAllProducts = async (req, res) => {
    try {
        const { status, minPrice, maxPrice } = req.query;

        const filters = {};

        // Validate status
        if (status) {
            if (!['ACTIVE', 'INACTIVE'].includes(status)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid status. Must be either ACTIVE or INACTIVE"
                });
            }
            filters.status = status;
        }

        // Validate minPrice
        if (minPrice) {
            const minPriceNum = Number(minPrice);
            if (isNaN(minPriceNum) || minPriceNum < 0) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid minPrice. Must be a positive number"
                });
            }
            if (minPriceNum > MAX_DECIMAL) {
                return res.status(400).json({
                    success: false,
                    message: "minPrice exceeds maximum allowed value"
                });
            }
            filters.minPrice = minPriceNum;
        }

        // Validate maxPrice
        if (maxPrice) {
            const maxPriceNum = Number(maxPrice);
            if (isNaN(maxPriceNum) || maxPriceNum < 0) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid maxPrice. Must be a positive number"
                });
            }
            if (maxPriceNum > MAX_DECIMAL) {
                return res.status(400).json({
                    success: false,
                    message: "maxPrice exceeds maximum allowed value"
                });
            }
            filters.maxPrice = maxPriceNum;
        }

        // Validate price range
        if (filters.minPrice && filters.maxPrice && filters.minPrice > filters.maxPrice) {
            return res.status(400).json({
                success: false,
                message: "minPrice cannot be greater than maxPrice"
            });
        }

        const products = await productService.getAllProducts(filters);

        res.status(200).json({
            success: true,
            count: products.length,
            data: products
        });
    } catch (error) {
        console.error('Get products error:', error);

        // Generic server error - hide internal details
        res.status(500).json({
            success: false,
            message: "Failed to retrieve products. Please try again later"
        });
    }
};