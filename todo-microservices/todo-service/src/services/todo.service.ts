    import { AppDataSource } from '../config/database';
    import { Todo } from '../models/todo.model';
    import { CreateTodoDto, UpdateTodoDto, TodoResponse } from '../types';
    import { AppError } from '../middlewares/error.middleware';

    const getTodoRepository = () => AppDataSource.getRepository(Todo);

    export const create = async (
        userId: string,
        dto: CreateTodoDto
    ): Promise<TodoResponse> => {
        const todoRepository = getTodoRepository();

        const todo = todoRepository.create({
            content: dto.content,
            userUuid: userId
        });

        await todoRepository.save(todo);

        return {
            id: todo.id.toString(),
            uuid: todo.uuid,
            content: todo.content,
            completed: todo.completed,
            userUuid: todo.userUuid,
            createdAt: todo.createdAt,
            updatedAt: todo.updatedAt
        };
    };

    export const findAll = async (userId: string): Promise<TodoResponse[]> => {
        const todoRepository = getTodoRepository();

        const todos = await todoRepository.find({
            where: { userUuid: userId },
            order: { createdAt: 'DESC' }
        });

        return todos.map(todo => ({
            id: todo.id.toString(),
            uuid: todo.uuid,
            content: todo.content,
            completed: todo.completed,
            userUuid: todo.userUuid,
            createdAt: todo.createdAt,
            updatedAt: todo.updatedAt
        }));
    };

    export const findOne = async (
        userId: string,
        todoId: string
    ): Promise<TodoResponse> => {
        const todoRepository = getTodoRepository();

        const todo = await todoRepository.findOne({
            where: { uuid: todoId, userUuid: userId }
        });

        if (!todo) {
            throw new AppError('Todo not found', 404);
        }

        return {
            id: todo.id.toString(),
            uuid: todo.uuid,
            content: todo.content,
            completed: todo.completed,
            userUuid: todo.userUuid,
            createdAt: todo.createdAt,
            updatedAt: todo.updatedAt
        };
    };

    export const update = async (
        userId: string,
        todoId: string,
        dto: UpdateTodoDto
    ): Promise<TodoResponse> => {
        const todoRepository = getTodoRepository();

        const todo = await todoRepository.findOne({
            where: { uuid: todoId, userUuid: userId }
        });

        if (!todo) {
            throw new AppError('Todo not found', 404);
        }

        if (dto.content !== undefined) {
            todo.content = dto.content;
        }

        if (dto.completed !== undefined) {
            todo.completed = dto.completed;
        }

        await todoRepository.save(todo);

        return {
            id: todo.id.toString(),
            uuid: todo.uuid,
            content: todo.content,
            completed: todo.completed,
            userUuid: todo.userUuid,
            createdAt: todo.createdAt,
            updatedAt: todo.updatedAt
        };
    };

    export const remove = async (
        userId: string,
        todoId: string
    ): Promise<void> => {
        const todoRepository = getTodoRepository();

        const todo = await todoRepository.findOne({
            where: { uuid: todoId, userUuid: userId }
        });

        if (!todo) {
            throw new AppError('Todo not found', 404);
        }

        await todoRepository.remove(todo);
    };