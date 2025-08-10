import 'reflect-metadata';
import dotenv from 'dotenv';
dotenv.config();

import app from './app';
import { AppDataSource } from './config/database';

const PORT = process.env.PORT || 3002;

const startServer = async (): Promise<void> => {
    try {
        // Initialize database connection
        await AppDataSource.initialize();
        console.log('Database connection established');

        // Start server
        const server = app.listen(PORT, () => {
            console.log(`Todo Service running on port ${PORT}`);
            console.log(`Environment: ${process.env.NODE_ENV}`);
        });

        // Graceful shutdown
        process.on('SIGTERM', async () => {
            console.log('SIGTERM received, shutting down gracefully...');
            server.close(() => {
                AppDataSource.destroy();
                process.exit(0);
            });
        });

        process.on('SIGINT', async () => {
            console.log('SIGINT received, shutting down gracefully...');
            server.close(() => {
                AppDataSource.destroy();
                process.exit(0);
            });
        });

    } catch (error) {
        console.error(' Failed to start server:', error);
        process.exit(1);
    }
};

startServer();