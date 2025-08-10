import { DataSource } from 'typeorm';
import { User } from '../models/user.model';
import dotenv from 'dotenv';

dotenv.config();

export const AppDataSource = new DataSource({
    type: 'mysql',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    username: process.env.DB_USER || 'userservice',
    password: process.env.DB_PASSWORD || 'userpass123',
    database: process.env.DB_NAME || 'userdb',
    synchronize: process.env.NODE_ENV === 'development',
    logging: process.env.NODE_ENV === 'development',
    entities: [User],
    migrations: [],
    subscribers: [],
    connectorPackage: 'mysql2',
    extra: {
        connectionLimit: 10,
        connectTimeout: 60000,
        acquireTimeout: 60000,
        timeout: 60000
    }
});