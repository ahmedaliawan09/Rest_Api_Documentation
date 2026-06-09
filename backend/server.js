import app from "./index.js"
import logger from "./config/logger.js";

const port = 5000;

app.listen(port, () => {
    logger.info(`Server started successfully on port ${port}`);
    console.log(`app is listening on ${port}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    logger.error('UNHANDLED REJECTION', {
        error: err.message,
        stack: err.stack
    }); 
    console.log('Unhandled Rejection! Shutting down...');
    process.exit(1);
});
   
 
process.on('uncaughtException', (err) => {
    logger.error('UNCAUGHT EXCEPTION', {
        error: err.message, 
        stack: err.stack
    });
    console.log('Uncaught Exception! Shutting down...');
    process.exit(1);
});