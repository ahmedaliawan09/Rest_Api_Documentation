import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

const { combine, timestamp, printf, colorize, errors } = winston.format;


const logFormat = printf(({ level, message, timestamp, stack, ...metadata }) => {
    let log = `${timestamp} [${level}]: ${message}`;
    
     
    if (Object.keys(metadata).length > 0) {
        log += ` | ${JSON.stringify(metadata, null, 2)}`;
    }
    
    
    if (stack) {
        log += `\n${stack}`;
    }
    
    return log;
});


const allLogsTransport = new DailyRotateFile({
    filename: 'logs/all-%DATE%.log',
    datePattern: 'YYYY-MM-DD',
    maxSize: '20m',
    maxFiles: '30d',
    level: 'info'
});


const errorLogsTransport = new DailyRotateFile({
    filename: 'logs/error-%DATE%.log',
    datePattern: 'YYYY-MM-DD',
    maxSize: '20m',
    maxFiles: '90d',
    level: 'error'
});


const httpLogsTransport = new DailyRotateFile({
    filename: 'logs/http-%DATE%.log',
    datePattern: 'YYYY-MM-DD',
    maxSize: '20m',
    maxFiles: '30d',
    level: 'http'
});


const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: combine(
        errors({ stack: true }),
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        logFormat
    ),
    transports: [
        allLogsTransport,
        errorLogsTransport,
        httpLogsTransport
    ]
});


// ALWAYS add console logger (needed for CloudWatch to capture logs)
// CloudWatch captures container stdout/stderr, not log files inside containers
logger.add(new winston.transports.Console({
    format: combine(
        colorize(),
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        logFormat
    ),
    level: 'info' // Log info, warn, error to console for CloudWatch
}));

export default logger;
