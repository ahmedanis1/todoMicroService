import Joi from 'joi';

export const createTodoSchema = Joi.object({
    content: Joi.string()
        .min(1)
        .max(1000)
        .required()
        .messages({
            'string.min': 'Todo content cannot be empty',
            'string.max': 'Todo content cannot exceed 1000 characters',
            'any.required': 'Todo content is required'
        })
});

export const updateTodoSchema = Joi.object({
    content: Joi.string()
        .min(1)
        .max(1000)
        .optional()
        .messages({
            'string.min': 'Todo content cannot be empty',
            'string.max': 'Todo content cannot exceed 1000 characters'
        }),
    completed: Joi.boolean()
        .optional()
}).min(1).messages({
    'object.min': 'At least one field must be provided for update'
});

export const uuidSchema = Joi.object({
    id: Joi.string()
        .uuid()
        .required()
        .messages({
            'string.guid': 'Invalid todo ID format',
            'any.required': 'Todo ID is required'
        })
});