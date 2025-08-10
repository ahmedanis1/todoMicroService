import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt.util';
import { AppError } from './error.middleware';
import { AuthRequest } from '../types';

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
        console.error('Auth middleware error:', error);
        if (error instanceof Error) {
            if (error.message.includes('expired')) {
                throw new AppError('Token expired', 401);
            }
            if (error.message.includes('invalid') || error.message.includes('malformed')) {
                throw new AppError('Invalid token', 401);
            }
        }
        throw new AppError('Authentication failed', 401);
    }
};