import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import todoRoutes from './routes/todo.routes';
import { errorMiddleware } from './middlewares/error.middleware';

const app: Application = express();

// Security middlewares
app.use(helmet());
app.use(cors({ origin: true, credentials: true }));
app.options('*', cors({ origin: true, credentials: true }));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// General middlewares
app.use(compression());
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req: Request, res: Response) => {
    res.status(200).json({
        status: 'healthy',
        service: 'todo-service',
        timestamp: new Date().toISOString()
    });
});

// API routes
app.use('/api/todos', todoRoutes);

// 404 handler
app.use((req: Request, res: Response) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

// Error handling middleware
app.use(errorMiddleware);

export default app;