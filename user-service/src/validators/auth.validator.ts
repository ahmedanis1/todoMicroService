import Joi from 'joi';

export const registerSchema = Joi.object({
    email: Joi.string()
        .email({ tlds: { allow: false } })
        .max(255)
        .required()
        .messages({
            'string.email': 'Please provide a valid email address',
            'string.max': 'Email cannot exceed 255 characters',
            'any.required': 'Email is required'
        }),
    password: Joi.string()
        .min(6)
        .max(100)
        .required()
        .pattern(/^(?=.*[a-zA-Z])(?=.*[0-9])/)
        .messages({
            'string.min': 'Password must be at least 6 characters long',
            'string.max': 'Password cannot exceed 100 characters',
            'string.pattern.base': 'Password must contain at least one letter and one number',
            'any.required': 'Password is required'
        })
});

export const loginSchema = Joi.object({
    email: Joi.string()
        .email({ tlds: { allow: false } })
        .required()
        .messages({
            'string.email': 'Please provide a valid email address',
            'any.required': 'Email is required'
        }),
    password: Joi.string()
        .required()
        .messages({
            'any.required': 'Password is required'
        })
});