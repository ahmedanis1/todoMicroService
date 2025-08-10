import jwt from 'jsonwebtoken';
import { JwtPayload } from '../types';

export const verifyToken = (token: string): JwtPayload => {
    const secret = process.env.JWT_SECRET || 'default-secret';

    try {
        return jwt.verify(token, secret) as JwtPayload;
    } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            throw new Error('Token expired');
        }
        if (error instanceof jwt.JsonWebTokenError) {
            throw new Error('Invalid token');
        }
        throw error;
    }
};