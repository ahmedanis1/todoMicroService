import { Request, Response, NextFunction } from 'express';
import { Schema } from 'joi';
import { AppError } from './error.middleware';

export const validate = (schema: Schema) => {
    return (req: Request, _res: Response, next: NextFunction): void => {
        const { error, value } = schema.validate(req.body, {
            abortEarly: false,
            stripUnknown: true
        });

        if (error) {
            const messages = error.details.map(detail => detail.message);
            throw new AppError(messages.join(', '), 400);
        }

        // Replace body with validated and sanitized data
        req.body = value;
        next();
    };
};

export const validateQuery = (schema: Schema) => {
    return (req: Request, _res: Response, next: NextFunction): void => {
        const { error, value } = schema.validate(req.query, {
            abortEarly: false,
            stripUnknown: true
        });

        if (error) {
            const messages = error.details.map(detail => detail.message);
            throw new AppError(messages.join(', '), 400);
        }

        req.query = value;
        next();
    };
};

export const validateParams = (schema: Schema) => {
    return (req: Request, _res: Response, next: NextFunction): void => {
        const { error, value } = schema.validate(req.params, {
            abortEarly: false,
            stripUnknown: true
        });

        if (error) {
            const messages = error.details.map(detail => detail.message);
            throw new AppError(messages.join(', '), 400);
        }

        req.params = value;
        next();
    };
};