import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt.util';
import { AppError } from './error.middleware';

export interface AuthRequest extends Request {
    user?: {
        userId: string;
        email: string;
    };
}

export const authenticate = (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): void => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new AppError('No token provided', 401);
        }

        const token = authHeader.substring(7);
        const decoded = verifyToken(token);

        req.user = {
            userId: decoded.userId,
            email: decoded.email
        };

        next();
    } catch (error) {
        if (error instanceof AppError) {
            next(error);
            return;
        }

        if (error instanceof Error) {
            if (error.message.includes('expired')) {
                next(new AppError('Token expired', 401));
                return;
            }
            if (error.message.includes('invalid') || error.message.includes('malformed')) {
                next(new AppError('Invalid token', 401));
                return;
            }
        }

        next(new AppError('Authentication failed', 401));
    }
};