import logger from '../config/logger.js';

// Generate detailed human-readable log message
const generateDetailedMessage = (method, url, statusCode, requestBody, params, responseBody) => {
    const success = statusCode >= 200 && statusCode < 400;
    
    // User routes
    if (url.includes('/api/users')) {
        if (method === 'POST' && success) {
            return `User created successfully - Email: ${requestBody.email}, Name: ${requestBody.firstName} ${requestBody.lastName}, Phone: ${requestBody.phone}`;
        }
        if (method === 'POST' && !success) {
            return `Failed to create user - Email: ${requestBody.email}, Reason: ${responseBody?.error?.reason || 'Unknown error'}`;
        }
        if (method === 'GET' && success) {
            return `User data fetched successfully - User ID: ${params.id || 'all users'}`;
        }
        if (method === 'GET' && !success) {
            return `Failed to fetch user - User ID: ${params.id}, Reason: ${responseBody?.error?.reason || 'User not found'}`;
        }
        if (method === 'PUT' && success) {
            return `User updated successfully - User ID: ${params.id || requestBody.userId}`;
        }
        if (method === 'DELETE' && success) {
            return `User deleted successfully - User ID: ${params.id || requestBody.userId}`;
        }
    }
    
    // Product routes
    if (url.includes('/api/products')) {
        if (method === 'POST' && success) {
            return `Product created successfully - Product: ${requestBody.name}, Price: ${requestBody.price}, Quantity: ${requestBody.quantity}`;
        }
        if (method === 'POST' && !success) {
            return `Failed to create product - Product: ${requestBody.name}, Reason: ${responseBody?.error?.reason || 'Unknown error'}`;
        }
        if (method === 'GET' && success) {
            return `Products fetched successfully - Product ID: ${params.id || 'all products'}`;
        }
        if (method === 'PUT' && success) {
            return `Product updated successfully - Product ID: ${params.id || requestBody.productId}`;
        }
        if (method === 'DELETE' && success) {
            return `Product deleted successfully - Product ID: ${params.id || requestBody.productId}`;
        }
    }
    
    // Cart create
    if (url.includes('/api/cart/create')) {
        if (success) {
            const cartId = responseBody?.data?._id || responseBody?.data?.id || 'N/A';
            return `Cart created successfully - User ID: ${requestBody.userId}, Cart ID: ${cartId}`;
        }
        return `Failed to create cart - User ID: ${requestBody.userId}, Reason: ${responseBody?.error?.reason || 'Unknown error'}`;
    }
    
    // Cart add item
    if (url.includes('/api/cart/add-item')) {
        if (success) {
            return `Product added to cart successfully - Cart ID: ${requestBody.cartId}, Product ID: ${requestBody.productId}, Quantity: ${requestBody.quantity}`;
        }
        
        // Check all possible error reasons from response
        const errorReason = responseBody?.error?.reason || responseBody?.message || '';
        const available = responseBody?.error?.availableQuantity;
        const requested = requestBody.quantity;
        const currentInCart = responseBody?.error?.currentCartQuantity;
        const maxCanAdd = responseBody?.error?.maxCanAdd;
        
        if (errorReason.includes('exceed') || errorReason.includes('Insufficient') || available !== undefined) {
            if (currentInCart !== undefined) {
                return `Failed to add product to cart - Cart ID: ${requestBody.cartId}, Product ID: ${requestBody.productId}, Requested Additional Quantity: ${requested}, Current in Cart: ${currentInCart}, Available Stock: ${available}, Max Can Add: ${maxCanAdd}, Reason: Adding more would exceed available stock`;
            }
            return `Failed to add product to cart - Cart ID: ${requestBody.cartId}, Product ID: ${requestBody.productId}, Requested Quantity: ${requested}, Available Stock: ${available}, Reason: Insufficient stock`;
        }
        if (errorReason.includes('checked out') || errorReason.includes('CHECKED_OUT')) {
            return `Failed to add product to cart - Cart ID: ${requestBody.cartId}, Product ID: ${requestBody.productId}, Reason: Cart already checked out, user must create new cart`;
        }
        if (errorReason.includes('Cart not found')) {
            return `Failed to add product to cart - Cart ID: ${requestBody.cartId}, Product ID: ${requestBody.productId}, Reason: Cart does not exist`;
        }
        if (errorReason.includes('Product not found')) {
            return `Failed to add product to cart - Cart ID: ${requestBody.cartId}, Product ID: ${requestBody.productId}, Reason: Product does not exist`;
        }
        return `Failed to add product to cart - Cart ID: ${requestBody.cartId}, Product ID: ${requestBody.productId}, Reason: ${errorReason || 'Error details not provided'}`;
    }
    
    // Cart remove item
    if (url.includes('/api/cart/remove-item')) {
        if (success) {
            return `Product removed from cart successfully - Cart ID: ${requestBody.cartId}, Product ID: ${params.productId}`;
        }
        if (responseBody?.error?.reason?.includes('not present in the cart')) {
            return `Failed to remove product from cart - Cart ID: ${requestBody.cartId}, Product ID: ${params.productId}, Reason: Product not found in cart`;
        }
        return `Failed to remove product from cart - Cart ID: ${requestBody.cartId}, Product ID: ${params.productId}, Reason: ${responseBody?.error?.reason || 'Unknown error'}`;
    }
    
    // Cart checkout
    if (url.includes('/api/cart/checkout')) {
        if (success) {
            const totalAmount = responseBody?.data?.totalAmount || 'N/A';
            return `Cart checked out successfully - Cart ID: ${requestBody.cartId}, Total Amount: ${totalAmount}`;
        }
        return `Failed to checkout cart - Cart ID: ${requestBody.cartId}, Reason: ${responseBody?.error?.reason || 'Unknown error'}`;
    }
    
    // Cart delete
    if (url.includes('/api/cart') && method === 'DELETE') {
        if (success) {
            return `Cart deleted successfully - Cart ID: ${requestBody.cartId || params.id}`;
        }
        return `Failed to delete cart - Cart ID: ${requestBody.cartId || params.id}, Reason: ${responseBody?.error?.reason || 'Cart not found'}`;
    }
    
    // Cart get
    if (url.includes('/api/cart') && method === 'GET') {
        if (success) {
            return `Cart fetched successfully - Cart ID: ${params.id || 'N/A'}`;
        }
        return `Failed to fetch cart - Cart ID: ${params.id}, Reason: ${responseBody?.error?.reason || 'Cart not found'}`;
    }
    
    // Default
    if (success) return `Request completed successfully`;
    return `Request failed - Reason: ${responseBody?.error?.reason || responseBody?.message || 'Unknown error'}`;
};

// Middleware to log detailed API activity
export const detailedLogger = (req, res, next) => {
    const startTime = Date.now();
    
    // Capture original json and send methods
    const originalJson = res.json;
    const originalSend = res.send;
    
    // Track response body
    let responseBody = null;
    
    // Override res.json to capture response
    res.json = function(body) {
        responseBody = body;
        return originalJson.call(this, body);
    };
    
    // Override res.send to capture response
    res.send = function(body) {
        // Parse body if it's a string
        try {
            responseBody = typeof body === 'string' ? JSON.parse(body) : body;
        } catch (e) {
            responseBody = body;
        }
        return originalSend.call(this, body);
    };
    
    // Log when response finishes
    res.on('finish', () => {
        const duration = Date.now() - startTime;
        const userId = req.user?.id || req.body?.userId || 'anonymous';
        const success = res.statusCode >= 200 && res.statusCode < 400;
        
        // Generate detailed message
        const detailedMessage = generateDetailedMessage(
            req.method,
            req.originalUrl || req.url,
            res.statusCode,
            req.body || {},
            req.params || {},
            responseBody
        );
        
        // Create comprehensive single-line log
        const summary = `[${req.method}] ${req.originalUrl || req.url} | User: ${userId} | Status: ${res.statusCode} | ${duration}ms | ${success ? '✓' : '✗'} | ${detailedMessage}`;
        
        // Log based on status code
        if (res.statusCode >= 500) {
            logger.error(summary);
        } else if (res.statusCode >= 400) {
            logger.warn(summary);
        } else {
            logger.info(summary);
        }
    });
    
    next();
};
