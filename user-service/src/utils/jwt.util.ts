import jwt, { SignOptions } from 'jsonwebtoken';
import { env } from '../config/environment';
import { JwtPayload } from '../types';

const signOptions: SignOptions = {
    expiresIn: 3600,
    issuer: 'user-service',
    audience: 'todo-app'
};

const verifyOptions = {
    issuer: 'user-service',
    audience: 'todo-app'
};

export const generateToken = (payload: JwtPayload): string => {
    if (!env.JWT_SECRET) {
        throw new Error('JWT_SECRET is not defined');
    }

    return jwt.sign(payload, env.JWT_SECRET, signOptions);
};

export const verifyToken = (token: string): JwtPayload => {
    if (!env.JWT_SECRET) {
        throw new Error('JWT_SECRET is not defined');
    }

    try {
        return jwt.verify(token, env.JWT_SECRET, verifyOptions) as unknown as JwtPayload;
    } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            throw new Error('Token has expired');
        }
        if (error instanceof jwt.JsonWebTokenError) {
            throw new Error('Invalid token');
        }
        throw error;
    }
};

export const decodeToken = (token: string): JwtPayload | null => {
    try {
        return jwt.decode(token) as JwtPayload;
    } catch {
        return null;
    }
};
