import { todoAPI } from './api';

export const todoService = {
    async getAllTodos() {
        const response = await todoAPI.get('/api/todos');
        return response.data;
    },

    async getTodoById(id) {
        const response = await todoAPI.get(`/api/todos/${id}`);
        return response.data;
    },

    async createTodo(content) {
        const response = await todoAPI.post('/api/todos', { content });
        return response.data;
    },

    async updateTodo(id, data) {
        const response = await todoAPI.put(`/api/todos/${id}`, data);
        return response.data;
    },

    async deleteTodo(id) {
        const response = await todoAPI.delete(`/api/todos/${id}`);
        return response.data;
    },
};