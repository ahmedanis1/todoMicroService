import { Request } from 'express';

// DTOs
export interface RegisterDto {
    email: string;
    password: string;
}

export interface LoginDto {
    email: string;
    password: string;
}

// Response Types
export interface AuthResponse {
    token: string;
    user: {
        id: string;
        uuid: string;
        email: string;
    };
}

export interface ApiResponse<T = any> {
    success: boolean;
    message?: string;
    data?: T;
    error?: {
        message: string;
        code?: string;
        details?: any;
    };
}

// JWT Types
export interface JwtPayload {
    userId: string;
    email: string;
    iat?: number;
    exp?: number;
}

// Request Types
export interface AuthRequest extends Request {
    user?: {
        userId: string;
        email: string;
    };
}

// User Types
export interface UserData {
    id: number;
    uuid: string;
    email: string;
    createdAt: Date;
    updatedAt: Date;
}