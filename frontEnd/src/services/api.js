import axios from 'axios';
import { message } from 'antd';

const USER_SERVICE_URL = process.env.REACT_APP_USER_SERVICE_URL || 'http://localhost:3001';
const TODO_SERVICE_URL = process.env.REACT_APP_TODO_SERVICE_URL || 'http://localhost:3002';



export const userAPI = axios.create({
    baseURL: USER_SERVICE_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const todoAPI = axios.create({
    baseURL: TODO_SERVICE_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

todoAPI.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

const handleResponseError = (error) => {
    if (error.response) {
        switch (error.response.status) {
            case 401:
                message.error('Session expired. Please login again.');
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = '/auth';
                break;
            case 403:
                message.error('You do not have permission to perform this action.');
                break;
            case 404:
                message.error('Resource not found.');
                break;
            case 500:
                message.error('Server error. Please try again later.');
                break;
            default:
                message.error(error.response.data?.error?.message || 'An error occurred');
        }
    } else if (error.request) {
        message.error('Network error. Please check your connection.');
    } else {
        message.error('An unexpected error occurred.');
    }
    return Promise.reject(error);
};

userAPI.interceptors.response.use(
    (response) => response,
    handleResponseError
);

todoAPI.interceptors.response.use(
    (response) => response,
    handleResponseError
);