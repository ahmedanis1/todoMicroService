import express, { Application, Request, Response } from 'express';
import cors from 'cors';
// import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
// import rateLimit from 'express-rate-limit';
import authRoutes from './routes/auth.routes';
import { errorMiddleware } from './middlewares/error.middleware';
import { env } from './config/environment';
const app: Application = express();

app.use(cors({ origin: true, credentials: true }));
app.options('*', cors({ origin: true, credentials: true }));

app.use(compression());
app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use('/api/auth', authRoutes);

app.use((req: Request, res: Response) => {
    res.status(404).json({
        success: false,
        error: {
            message: 'Resource not found',
            path: req.path
        }
    });
});

app.get('/health', (_req: Request, res: Response) => {
    res.status(200).json({
        status: 'healthy',
        service: 'todo-service',
        timestamp: new Date().toISOString()
    });
});

app.use(errorMiddleware);

export default app;