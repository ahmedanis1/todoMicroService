import { DataSource } from 'typeorm';
import { Todo } from '../models/todo.model';
import dotenv from 'dotenv';

dotenv.config();

export const AppDataSource = new DataSource({
    type: 'mysql',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    username: process.env.DB_USER || 'todoservice',
    password: process.env.DB_PASSWORD || 'todopass123',
    database: process.env.DB_NAME || 'tododb',
    synchronize: process.env.NODE_ENV === 'development',
    logging: process.env.NODE_ENV === 'development',
    entities: [Todo],
    connectorPackage: 'mysql2'
});