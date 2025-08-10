export const env = {
    NODE_ENV: process.env.NODE_ENV || 'development',
    PORT: parseInt(process.env.PORT || '3002'),
    DB_HOST: process.env.DB_HOST || 'localhost',
    DB_PORT: parseInt(process.env.DB_PORT || '3306'),
    DB_USER: process.env.DB_USER || 'todoservice',
    DB_PASSWORD: process.env.DB_PASSWORD || 'todopass123',
    DB_NAME: process.env.DB_NAME || 'tododb',
    JWT_SECRET: process.env.JWT_SECRET || 'change-this-secret',
    ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS || 'http://localhost:8080'
};