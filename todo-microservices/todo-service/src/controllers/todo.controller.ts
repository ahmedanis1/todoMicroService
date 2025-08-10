import { Response, NextFunction } from 'express';
import * as todoService from '../services/todo.service';
import { AuthRequest } from '../types';

export const createTodo = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const userId = req.user!.userId;
        const todo = await todoService.create(userId, req.body);

        res.status(201).json({
            success: true,
            message: 'Todo created successfully',
            data: todo
        });
    } catch (error) {
        next(error);
    }
};

export const getAllTodos = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const userId = req.user!.userId;
        const todos = await todoService.findAll(userId);

        res.status(200).json({
            success: true,
            data: todos
        });
    } catch (error) {
        next(error);
    }
};

export const getTodoById = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const userId = req.user!.userId;
        const todoId = req.params.id;
        const todo = await todoService.findOne(userId, todoId);

        res.status(200).json({
            success: true,
            data: todo
        });
    } catch (error) {
        next(error);
    }
};

export const updateTodo = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const userId = req.user!.userId;
        const todoId = req.params.id;
        const todo = await todoService.update(userId, todoId, req.body);

        res.status(200).json({
            success: true,
            message: 'Todo updated successfully',
            data: todo
        });
    } catch (error) {
        next(error);
    }
};

export const deleteTodo = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const userId = req.user!.userId;
        const todoId = req.params.id;
        await todoService.remove(userId, todoId);

        res.status(204).send();
    } catch (error) {
        next(error);
    }
};