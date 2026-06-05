/**
 * Middleware to validate integer IDs for Prisma/MySQL
 * Replaces MongoDB ObjectId validation
 */

export const validateIntegerId = (...fields) => {
    return (req, res, next) => {
        for (const field of fields) {
            let id;
            
            if (req.params[field]) {
                id = req.params[field];
            } else if (req.body[field]) {
                id = req.body[field];
            }
            
            if (id !== undefined && id !== null) {
                const numericId = Number(id);
                
                // Check if it's a valid integer
                if (!Number.isInteger(numericId) || numericId <= 0) {
                    return res.status(400).json({
                        success: false,
                        message: "Invalid ID format",
                        error: {
                            reason: `The provided ${field} must be a positive integer`,
                            invalidField: field,
                            providedValue: id,
                            possibleCauses: [
                                "ID must be a positive integer",
                                "ID format does not match expected numeric format"
                            ]
                        }
                    });
                }
            }
        }
        
        next();
    };
};

// Backward compatibility alias
export const validateObjectId = validateIntegerId;

