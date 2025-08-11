import { Request, Response, NextFunction } from 'express';
import * as authService from '../services/auth.service';
import { RegisterDto, LoginDto, ApiResponse, AuthResponse } from '../types';

export const register = async (
    req: Request<{}, {}, RegisterDto>,
    res: Response<ApiResponse<AuthResponse>>,
    next: NextFunction
): Promise<void> => {
    try {
        const result = await authService.register(req.body);

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: result
        });
        console.log(result)
    } catch (error) {
        console.error('Register error:', error);
        next(error);
    }
};

export const login = async (
    req: Request<{}, {}, LoginDto>,
    res: Response<ApiResponse<AuthResponse>>,
    next: NextFunction
): Promise<void> => {
    try {
        const result = await authService.login(req.body);

        res.status(200).json({
            success: true,
            message: 'Login successful',
            data: result
        });
    } catch (error) {
        next(error);
    }
};

export const validateToken = async (
    req: Request,
    res: Response<ApiResponse<{ valid: boolean }>>,
    next: NextFunction
): Promise<void> => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(200).json({
                success: true,
                data: { valid: false }
            });
            return;
        }

        const token = authHeader.substring(7);
        const isValid = await authService.validateToken(token);

        res.status(200).json({
            success: true,
            data: { valid: isValid }
        });
    } catch (error) {
        next(error);
    }
};