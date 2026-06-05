import prisma from '../config/prisma.js';

/**
 * Product Service - Handles all product-related database operations
 */

class ProductService {
    /**
     * Create a new product
     * @param {Object} productData - Product data (name, description, price, stock_quantity, status)
     * @returns {Promise<Object>} Created product
     */
    async createProduct(productData) {
        return await prisma.product.create({
            data: productData
        });
    }

    /**
     * Get all products
     * @param {Object} filters - Optional filters (status, minPrice, maxPrice)
     * @returns {Promise<Array>} List of products
     */
    async getAllProducts(filters = {}) {
        const where = {};

        if (filters.status) {
            where.status = filters.status;
        }

        if (filters.minPrice || filters.maxPrice) {
            where.price = {};
            if (filters.minPrice) where.price.gte = filters.minPrice;
            if (filters.maxPrice) where.price.lte = filters.maxPrice;
        }

        return await prisma.product.findMany({
            where,
            orderBy: { created_at: 'desc' }
        });
    }

    /**
     * Get product by ID
     * @param {number} id - Product ID
     * @returns {Promise<Object|null>} Product or null
     */
    async getProductById(id) {
        return await prisma.product.findUnique({
            where: { id }
        });
    }

    /**
     * Update product
     * @param {number} id - Product ID
     * @param {Object} productData - Updated product data
     * @returns {Promise<Object>} Updated product
     */
    async updateProduct(id, productData) {
        return await prisma.product.update({
            where: { id },
            data: productData
        });
    }

    /**
     * Delete product
     * @param {number} id - Product ID
     * @returns {Promise<Object>} Deleted product
     */
    async deleteProduct(id) {
        return await prisma.product.delete({
            where: { id }
        });
    }

    /**
     * Update product stock quantity
     * @param {number} id - Product ID
     * @param {number} quantity - Quantity to add/subtract (negative to decrease)
     * @returns {Promise<Object>} Updated product
     */
    async updateStock(id, quantity) {
        return await prisma.product.update({
            where: { id },
            data: {
                stock_quantity: {
                    increment: quantity
                }
            }
        });
    }

    /**
     * Get products with low stock
     * @param {number} threshold - Stock threshold (default: 10)
     * @returns {Promise<Array>} Products with stock below threshold
     */
    async getLowStockProducts(threshold = 10) {
        return await prisma.product.findMany({
            where: {
                stock_quantity: {
                    lte: threshold
                },
                status: 'ACTIVE'
            }
        });
    }

    /**
     * Search products by name
     * @param {string} searchTerm - Search term
     * @returns {Promise<Array>} Matching products
     */
    async searchProducts(searchTerm) {
        return await prisma.product.findMany({
            where: {
                OR: [
                    { name: { contains: searchTerm } },
                    { description: { contains: searchTerm } }
                ],
                status: 'ACTIVE'
            }
        });
    }
}

export default new ProductService();
