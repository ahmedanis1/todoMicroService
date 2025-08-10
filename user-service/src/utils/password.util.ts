import bcrypt from 'bcrypt';
import { env } from '../config/environment';

const SALT_ROUNDS = env.NODE_ENV === 'test' ? 1 : 10;

export const hashPassword = async (password: string): Promise<string> => {
    if (!password || password.length < 6) {
        throw new Error('Password must be at least 6 characters long');
    }

    return bcrypt.hash(password, SALT_ROUNDS);
};

export const comparePassword = async (
    password: string,
    hash: string
): Promise<boolean> => {
    if (!password || !hash) {
        return false;
    }

    return bcrypt.compare(password, hash);
};