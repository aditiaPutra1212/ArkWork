import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import path from 'path';

const logDir = path.join(process.cwd(), 'logs');

// Format log: [WAKTU] [LEVEL]: PESAN
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message }) => {
    return `[${timestamp}] ${level.toUpperCase()}: ${message}`;
  })
);

// Setup Winston
export const logger = winston.createLogger({
  format: logFormat,
  transports: [
    // 1. Tampilkan di Console (Terminal) berwarna
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        logFormat
      ),
    }),

    // 2. Simpan Error ke file: logs/error-2023-10-01.log
    new DailyRotateFile({
      dirname: logDir,
      filename: 'error-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      level: 'error', // Hanya catat yang error
      maxSize: '20m', // Max 20MB per file
      maxFiles: '14d', // Simpan selama 14 hari
    }),

    // 3. Simpan Semua aktivitas ke file: logs/combined-2023-10-01.log
    new DailyRotateFile({
      dirname: logDir,
      filename: 'combined-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '14d',
    }),
  ],
});