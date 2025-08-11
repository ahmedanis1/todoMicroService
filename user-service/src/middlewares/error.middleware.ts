import { Request, Response, NextFunction } from 'express';

export class AppError extends Error {
    public readonly statusCode: number;
    public readonly isOperational: boolean;
    public readonly code?: string;

    constructor(message: string, statusCode: number, code?: string) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true;
        this.code = code;

        Error.captureStackTrace(this, this.constructor);
        Object.setPrototypeOf(this, AppError.prototype);
    }
}

// export const errorMiddleware = (
//     err: Error | AppError,
//     _req: Request, // underscore to silence unused param warning
//     res: Response,
//     _next: NextFunction
// ): void => {
//     let statusCode = 500;
//     let message = 'Internal Server Error';
//     let code: string | undefined;
//
//     if (err instanceof AppError) {
//         statusCode = err.statusCode;
//         message = err.message;
//         code = err.code;
//     }
//
//     res.status(statusCode).json({
//         success: false,
//         error: {
//             message,
//             code
//         }
//     });
// };

export const errorMiddleware = (
    err: Error | AppError,
    _req: Request,
    res: Response,
    _next: NextFunction
): void => {
    console.error('Error caught by middleware:', err);  // <-- add this

    let statusCode = 500;
    let message = 'Internal Server Error';
    let code: string | undefined;

    if (err instanceof AppError) {
        statusCode = err.statusCode;
        message = err.message;
        code = err.code;
    }

    res.status(statusCode).json({
        success: false,
        error: {
            message,
            code
        }
    });
};