import morgan from 'morgan';
import logger from '../config/logger.js';

// Create a stream object for morgan to write to winston
const stream = {
    write: (message) => {
        logger.http(message.trim());
    }
};

// Custom morgan format with full details
morgan.token('body', (req) => JSON.stringify(req.body));
morgan.token('user-id', (req) => req.user?.id || 'anonymous');
morgan.token('user-email', (req) => req.user?.email || 'N/A');

// Detailed morgan format
const morganFormat = ':remote-addr - :user-id [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" - Response Time: :response-time ms - Body: :body';

// Export morgan middleware
export const requestLogger = morgan(morganFormat, { stream });
