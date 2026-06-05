import userService from '../services/userService.js';

const MAX_INT = 2147483647;

export const createUser = async (req, res) => {
    try {
        const { first_name, last_name, email, phone, password } = req.body;

        // Validation - Check required fields
        if (!first_name || !last_name || !email || !phone || !password) {
            return res.status(400).json({
                success: false,
                message: "All fields are required: first_name, last_name, email, phone, password"
            });
        }

        // Validate first_name
        if (typeof first_name !== 'string' || first_name.trim().length === 0 || first_name.length > 100) {
            return res.status(400).json({
                success: false,
                message: "Invalid first name"
            });
        }

        // Validate last_name
        if (typeof last_name !== 'string' || last_name.trim().length === 0 || last_name.length > 100) {
            return res.status(400).json({
                success: false,
                message: "Invalid last name"
            });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (typeof email !== 'string' || !emailRegex.test(email) || email.length > 255) {
            return res.status(400).json({
                success: false,
                message: "Invalid email format"
            });
        }

        // Validate phone
        if (typeof phone !== 'string' || phone.trim().length === 0 || phone.length > 20) {
            return res.status(400).json({
                success: false,
                message: "Invalid phone number"
            });
        }

        // Validate password
        if (typeof password !== 'string' || password.length < 6 || password.length > 255) {
            return res.status(400).json({
                success: false,
                message: "Password must be between 6 and 255 characters"
            });
        }

        const user = await userService.createUser(req.body);

        res.status(201).json({
            success: true,
            message: "User created successfully",
            data: user
        });
    } catch (error) {
        console.error('Create user error:', error);

        // Handle Prisma unique constraint violation
        if (error.code === 'P2002') {
            // Prisma returns target as an array of field names
            const target = error.meta?.target;
            
            // Check if email is in the target array
            if (target && target.includes('email')) {
                return res.status(409).json({
                    success: false,
                    message: "Email already exists"
                });
            }
            
            // Check if phone is in the target array
            if (target && target.includes('phone')) {
                return res.status(409).json({
                    success: false,
                    message: "Phone number already exists"
                });
            }

            // Fallback to generic message
            return res.status(409).json({
                success: false,
                message: "This record already exists"
            });
        }

        // Generic server error - hide internal details
        res.status(500).json({
            success: false,
            message: "Failed to create user. Please try again later"
        });
    }
};

export const getAllUsers = async (req, res) => {
    try {
        const users = await userService.getAllUsers();

        res.status(200).json({
            success: true,
            data: users
        });
    } catch (error) {
        console.error('Get all users error:', error);

        res.status(500).json({
            success: false,
            message: "Failed to retrieve users. Please try again later"
        });
    }
};