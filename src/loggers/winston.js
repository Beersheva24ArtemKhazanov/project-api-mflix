import winston from "winston";

const environment = process.env.NODE_ENV || 'development';
const defaultLogLevel = environment === 'production' ? 'info' : 'debug';

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || defaultLogLevel,
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console()
  ]
});

export default logger;