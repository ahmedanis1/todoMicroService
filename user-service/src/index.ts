import 'reflect-metadata';
import dotenv from 'dotenv';
dotenv.config();

import app from './app';
import { AppDataSource } from './config/database';
import { env } from './config/environment';

const PORT = env.PORT || 3001;

const startServer = async (): Promise<void> => {
    try {
        // Initialize database connection
        await AppDataSource.initialize();
        console.log('Database connection established');

        // Run migrations in production
        if (env.NODE_ENV === 'production') {
            await AppDataSource.runMigrations();
            console.log('Database migrations completed');
        }

        const server = app.listen(PORT, () => {
            console.log(` User Service running on port ${PORT}`);
        });

        // Graceful shutdown handlers
        const gracefulShutdown = async (signal: string): Promise<void> => {
            console.log(`\n${signal} received, starting graceful shutdown...`);

            server.close(async () => {
                console.log('HTTP server closed');

                try {
                    // await AppDataSource.destroy();
                    console.log('Database connection closed');
                    process.exit(0);
                } catch (error) {
                    console.error('Error during graceful shutdown:', error);
                    process.exit(1);
                }
            });

            // Force shutdown after 10 seconds
            setTimeout(() => {
                console.error('Forced shutdown after timeout');
                process.exit(1);
            }, 10000);
        };

        process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
        process.on('SIGINT', () => gracefulShutdown('SIGINT'));

        // Handle uncaught exceptions
        process.on('uncaughtException', (error) => {
            console.error('Uncaught Exception:', error);
            process.exit(1);
        });

        process.on('unhandledRejection', (reason, promise) => {
            console.error('Unhandled Rejection at:', promise, 'reason:', reason);
            process.exit(1);
        });

    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

startServer();