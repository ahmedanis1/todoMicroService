import { AppDataSource } from '../config/database';
import { User } from '../models/user.model';
import { RegisterDto, LoginDto, AuthResponse } from '../types';
import { hashPassword, comparePassword } from '../utils/password.util';
import { generateToken, verifyToken } from '../utils/jwt.util';
import { AppError } from '../middlewares/error.middleware';
import { Repository } from 'typeorm';

// Get repository function for better testability
const getUserRepository = (): Repository<User> => {
    return AppDataSource.getRepository(User);
};

export const register = async (dto: RegisterDto): Promise<AuthResponse> => {
    const userRepository = getUserRepository();

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(dto.email)) {
        throw new AppError('Invalid email format', 400);
    }

    // Check if user already exists
    const existingUser = await userRepository.findOne({
        where: { email: dto.email.toLowerCase() }
    });

    if (existingUser) {
        throw new AppError('Email already registered', 409);
    }

    // Hash password
    const hashedPassword = await hashPassword(dto.password);

    // Create new user
    const user = userRepository.create({
        email: dto.email.toLowerCase(),
        password: hashedPassword
    });

    try {
        await userRepository.save(user);
    } catch (error) {
        console.error('Error saving user:', error);
        throw new AppError('Failed to create user', 500);
    }

    // Generate JWT
    const token = generateToken({
        userId: user.uuid,
        email: user.email
    });

    return {
        token,
        user: {
            id: user.id.toString(),
            uuid: user.uuid,
            email: user.email
        }
    };
};

export const login = async (dto: LoginDto): Promise<AuthResponse> => {
    const userRepository = getUserRepository();

    // Find user by email
    const user = await userRepository.findOne({
        where: { email: dto.email.toLowerCase() }
    });

    if (!user) {
        throw new AppError('Invalid credentials', 401);
    }

    // Verify password
    const isValidPassword = await comparePassword(dto.password, user.password);

    if (!isValidPassword) {
        throw new AppError('Invalid credentials', 401);
    }

    // Generate JWT
    const token = generateToken({
        userId: user.uuid,
        email: user.email
    });

    return {
        token,
        user: {
            id: user.id.toString(),
            uuid: user.uuid,
            email: user.email
        }
    };
};

export const validateToken = async (token: string): Promise<boolean> => {
    try {
        const decoded = verifyToken(token);

        // Optional: Check if user still exists in database
        const userRepository = getUserRepository();
        const user = await userRepository.findOne({
            where: { uuid: decoded.userId }
        });

        return !!user;
    } catch (error) {
        return false;
    }
};

export const getUserByUuid = async (uuid: string): Promise<User | null> => {
    const userRepository = getUserRepository();
    return await userRepository.findOne({
        where: { uuid }
    });
};