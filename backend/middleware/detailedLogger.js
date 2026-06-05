import logger from '../config/logger.js';


const generateDetailedMessage = (method, url, statusCode, requestBody, params, query, responseBody) => {
    const success = statusCode >= 200 && statusCode < 400;
    
    // Extract error message from new response format
    const errorMessage = responseBody?.message || 'Unknown error';
    const successMessage = responseBody?.message || '';
    
    // Users API
    if (url.includes('/api/users')) {
        if (method === 'POST' && success) {
            return `User created - Email: ${requestBody.email}, Name: ${requestBody.first_name} ${requestBody.last_name}, Phone: ${requestBody.phone}`;
        }
        if (method === 'POST' && !success) {
            return `Failed to create user - Email: ${requestBody.email || 'N/A'}, Error: ${errorMessage}`;
        }
        if (method === 'GET' && success) {
            const count = responseBody?.data?.length || 0;
            return `Users fetched - Count: ${count}`;
        }
    }
    
    // Products API
    if (url.includes('/api/products')) {
        if (method === 'POST' && success) {
            return `Product created - Name: ${requestBody.name}, Price: ${requestBody.price}, Stock: ${requestBody.stock_quantity}`;
        }
        if (method === 'POST' && !success) {
            return `Failed to create product - Name: ${requestBody.name || 'N/A'}, Error: ${errorMessage}`;
        }
        if (method === 'GET' && success) {
            const count = responseBody?.count || responseBody?.data?.length || 0;
            const filters = query?.status ? `Filter: ${query.status}` : 'No filters';
            return `Products fetched - Count: ${count}, ${filters}`;
        }
        if (method === 'GET' && !success) {
            return `Failed to fetch products - Error: ${errorMessage}`;
        }
    }
    
    // Cart Create API
    if (url.includes('/api/cart/create')) {
        if (success) {
            const cartId = responseBody?.data?.id || 'N/A';
            return `Cart created - User ID: ${requestBody.userId}, Cart ID: ${cartId}`;
        }
        return `Failed to create cart - User ID: ${requestBody.userId || 'N/A'}, Error: ${errorMessage}`;
    }
    
    // Add Item to Cart API
    if (url.includes('/api/cart/add-item')) {
        if (success) {
            return `Item added to cart - Cart: ${requestBody.cartId}, Product: ${requestBody.productId}, Qty: ${requestBody.quantity}`;
        }
        return `Failed to add item - Cart: ${requestBody.cartId || 'N/A'}, Product: ${requestBody.productId || 'N/A'}, Qty: ${requestBody.quantity || 'N/A'}, Error: ${errorMessage}`;
    }
    
    // Remove Item from Cart API
    if (url.includes('/api/cart/remove-item')) {
        if (success) {
            return `Item removed from cart - Cart: ${requestBody.cartId}, Product: ${params.productId}`;
        }
        return `Failed to remove item - Cart: ${requestBody.cartId || 'N/A'}, Product: ${params.productId || 'N/A'}, Error: ${errorMessage}`;
    }
    
    // Checkout Cart API
    if (url.includes('/api/cart/checkout')) {
        if (success) {
            const totalAmount = responseBody?.data?.total_amount || 'N/A';
            return `Cart checked out - Cart: ${requestBody.cartId}, Total: ${totalAmount}`;
        }
        return `Failed to checkout - Cart: ${requestBody.cartId || 'N/A'}, Error: ${errorMessage}`;
    }
    
    // Delete Cart API
    if (url.includes('/api/cart') && method === 'DELETE') {
        if (success) {
            return `Cart deleted - Cart: ${params.cartId || requestBody.cartId}`;
        }
        return `Failed to delete cart - Cart: ${params.cartId || requestBody.cartId || 'N/A'}, Error: ${errorMessage}`;
    }
    
    // Get Cart API
    if (url.includes('/api/cart') && method === 'GET') {
        if (success) {
            return `Cart fetched - Cart: ${params.id || 'N/A'}`;
        }
        return `Failed to fetch cart - Cart: ${params.id || 'N/A'}, Error: ${errorMessage}`;
    }
    
    // Generic fallback
    if (success) return `Request successful - ${successMessage || 'OK'}`;
    return `Request failed - Error: ${errorMessage}`;
};


export const detailedLogger = (req, res, next) => {
    const startTime = Date.now();
    
    
    const originalJson = res.json;
    const originalSend = res.send;
    
    
    let responseBody = null;
    
    
    res.json = function(body) {
        responseBody = body;
        return originalJson.call(this, body);
    };
    
    
    res.send = function(body) {
         
        try {
            responseBody = typeof body === 'string' ? JSON.parse(body) : body;
        } catch (e) {
            responseBody = body;
        }
        return originalSend.call(this, body);
    };
    
     
    res.on('finish', () => {
        const duration = Date.now() - startTime;
        const userId = req.user?.id || req.body?.userId || 'anonymous';
        const success = res.statusCode >= 200 && res.statusCode < 400;
        
        // Get detailed message with query params
        const detailedMessage = generateDetailedMessage(
            req.method,
            req.originalUrl || req.url,
            res.statusCode,
            req.body || {},
            req.params || {},
            req.query || {},
            responseBody
        );
        
         
        const summary = `[${req.method}] ${req.originalUrl || req.url} | User: ${userId} | Status: ${res.statusCode} | ${duration}ms | ${success ? '✓' : '✗'} | ${detailedMessage}`;
        
        
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
