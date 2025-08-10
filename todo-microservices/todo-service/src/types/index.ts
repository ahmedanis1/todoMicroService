import { Request } from 'express';

export interface CreateTodoDto {
    content: string;
}

export interface UpdateTodoDto {
    content?: string;
    completed?: boolean;
}

export interface TodoResponse {
    id: string;
    uuid: string;
    content: string;
    completed: boolean;
    userUuid: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface JwtPayload {
    userId: string;
    email: string;
}

export interface AuthRequest extends Request {
    user?: {
        userId: string;
        email: string;
    };
}