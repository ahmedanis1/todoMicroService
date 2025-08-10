import { Request, Response, NextFunction } from 'express';
import { Schema } from 'joi';
import { AppError } from './error.middleware';

export const validate = (schema: Schema) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        const { error, value } = schema.validate(req.body, {
            abortEarly: false,
            stripUnknown: true
        });

        if (error) {
            const messages = error.details.map(detail => detail.message);
            throw new AppError(messages.join(', '), 400);
        }

        req.body = value;
        next();
    };
};