import { userAPI } from './api';

export const authService = {
    async register(email, password) {
        const response = await userAPI.post('/api/auth/register', {
            email,
            password,
        });
        return response.data;
    },

    async login(email, password) {
        const response = await userAPI.post('api/auth/login', {
            email,
            password,
        });
        return response.data;
    },

    logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    },

    getCurrentUser() {
        const userStr = localStorage.getItem('user');
        return userStr ? JSON.parse(userStr) : null;
    },

    getToken() {
        return localStorage.getItem('token');
    },
};