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
    synchronize: process.env.TYPEORM_SYNC === 'true',
    logging: true,
    entities: [User],
    migrations: [],
    subscribers: [],
    dropSchema: true,

    connectorPackage: 'mysql2',
    extra: {
        acquireTimeout: 60000,
        timeout: 60000
    }
});