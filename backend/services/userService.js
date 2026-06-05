import prisma from '../config/prisma.js';

/**
 * User Service - Handles all user-related database operations
 */

class UserService {
    /**
     * Create a new user
     * @param {Object} userData - User data (first_name, last_name, email, phone, password)
     * @returns {Promise<Object>} Created user
     */
    async createUser(userData) {
        return await prisma.user.create({
            data: userData
        });
    }

    /**
     * Get all users
     * @returns {Promise<Array>} List of all users
     */
    async getAllUsers() {
        return await prisma.user.findMany({
            select: {
                id: true,
                first_name: true,
                last_name: true,
                email: true,
                phone: true,
                created_at: true,
                updated_at: true
                // Exclude password from default selection
            }
        });
    }

    /**
     * Get user by ID
     * @param {number} id - User ID
     * @returns {Promise<Object|null>} User or null
     */
    async getUserById(id) {
        return await prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                first_name: true,
                last_name: true,
                email: true,
                phone: true,
                created_at: true,
                updated_at: true
            }
        });
    }

    /**
     * Get user by email
     * @param {string} email - User email
     * @returns {Promise<Object|null>} User or null
     */
    async getUserByEmail(email) {
        return await prisma.user.findUnique({
            where: { email }
        });
    }

    /**
     * Update user
     * @param {number} id - User ID
     * @param {Object} userData - Updated user data
     * @returns {Promise<Object>} Updated user
     */
    async updateUser(id, userData) {
        return await prisma.user.update({
            where: { id },
            data: userData
        });
    }

    /**
     * Delete user
     * @param {number} id - User ID
     * @returns {Promise<Object>} Deleted user
     */
    async deleteUser(id) {
        return await prisma.user.delete({
            where: { id }
        });
    }

    /**
     * Get user with their carts
     * @param {number} id - User ID
     * @returns {Promise<Object|null>} User with carts
     */
    async getUserWithCarts(id) {
        return await prisma.user.findUnique({
            where: { id },
            include: {
                carts: {
                    include: {
                        cart_items: {
                            include: {
                                product: true
                            }
                        }
                    }
                }
            }
        });
    }
}

export default new UserService();
