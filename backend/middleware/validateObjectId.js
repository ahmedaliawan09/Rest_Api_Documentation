import mongoose from 'mongoose';

export const validateObjectId = (...fields) => {
    return (req, res, next) => {
        for (const field of fields) {
            let id;
            
            if (req.params[field]) {
                id = req.params[field];
            } else if (req.body[field]) {
                id = req.body[field];
            }
            
            if (id && !mongoose.Types.ObjectId.isValid(id)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid ID format",
                    error: {
                        reason: `The provided ${field} is not a valid ID format`,
                        invalidField: field,
                        providedValue: id,
                        possibleCauses: [
                            "ID must be a 24-character hexadecimal string",
                            "ID format does not match MongoDB ObjectId pattern"
                        ]
                    }
                });
            }
        }
        
        next();
    };
};
