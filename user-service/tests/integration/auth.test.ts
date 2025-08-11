// import request from 'supertest';
import request = require('supertest');
import app from '../../src/app';
import { AppDataSource } from '../../src/config/database';
import { User } from '../../src/models/user.model';
// import bcrypt from 'bcrypt';
import * as bcrypt from 'bcrypt';
// import jwt from 'jsonwebtoken';
import * as jwt from 'jsonwebtoken';


describe('User Service - Authentication Tests', () => {
    const userRepository = () => AppDataSource.getRepository(User);

    describe('User Story 1: User Registration', () => {
        const validUser = {
            email: 'tests@example.com',
            password: 'Test123'
        };

        it('TC1.1: Should register a new user with valid email and password', async () => {
            const response = await request(app)
                .post('/api/auth/register')
                .send(validUser)
                .expect(201);
            expect(response.body).toHaveProperty('success', true);
            expect(response.body).toHaveProperty('message', 'User registered successfully');
            expect(response.body.data).toHaveProperty('token');
            expect(response.body.data.user).toHaveProperty('email', validUser.email);
            expect(response.body.data.user).toHaveProperty('uuid');
            expect(response.body.data.user).not.toHaveProperty('password');

            // Verify user was created in database
            const user = await userRepository().findOne({
                where: { email: validUser.email }
            });
            expect(user).toBeTruthy();
            expect(user?.email).toBe(validUser.email);
        });

        it('TC1.2: Should hash the password before storing', async () => {
            await request(app)
                .post('/api/auth/register')
                .send(validUser)
                .expect(201);

            const user = await userRepository().findOne({
                where: { email: validUser.email }
            });

            expect(user?.password).not.toBe(validUser.password);
            const isPasswordHashed = await bcrypt.compare(validUser.password, user!.password);
            expect(isPasswordHashed).toBe(true);
        });

        it('TC1.3: Should return 409 if email is already registered', async () => {
            // First registration
            await request(app)
                .post('/api/auth/register')
                .send(validUser)
                .expect(201);

            // Second registration with same email
            const response = await request(app)
                .post('/api/auth/register')
                .send(validUser)
                .expect(409);

            expect(response.body).toHaveProperty('success', false);
            expect(response.body.error.message).toContain('already registered');
        });

        it('TC1.4: Should return 400 for invalid email format', async () => {
            const response = await request(app)
                .post('/api/auth/register')
                .send({
                    email: 'invalid-email',
                    password: 'Test123'
                })
                .expect(400);

            expect(response.body).toHaveProperty('success', false);
            expect(response.body.error.message).toContain('valid email');
        });

        it('TC1.5: Should return 400 for password less than 6 characters', async () => {
            const response = await request(app)
                .post('/api/auth/register')
                .send({
                    email: 'tests@example.com',
                    password: '12345'
                })
                .expect(400);

            expect(response.body).toHaveProperty('success', false);
            expect(response.body.error.message).toContain('at least 6 characters');
        });

        it('TC1.6: Should return 400 for missing email', async () => {
            const response = await request(app)
                .post('/api/auth/register')
                .send({
                    password: 'Test123'
                })
                .expect(400);

            expect(response.body).toHaveProperty('success', false);
            expect(response.body.error.message).toContain('Email is required');
        });

        it('TC1.7: Should return 400 for missing password', async () => {
            const response = await request(app)
                .post('/api/auth/register')
                .send({
                    email: 'tests@example.com'
                })
                .expect(400);

            expect(response.body).toHaveProperty('success', false);
            expect(response.body.error.message).toContain('Password is required');
        });

        it('TC1.8: Should return 400 for empty request body', async () => {
            const response = await request(app)
                .post('/api/auth/register')
                .send({})
                .expect(400);

            expect(response.body).toHaveProperty('success', false);
        });

        it('TC1.9: Should convert email to lowercase before storing', async () => {
            await request(app)
                .post('/api/auth/register')
                .send({
                    email: 'TEST@EXAMPLE.COM',
                    password: 'Test123'
                })
                .expect(201);

            const user = await userRepository().findOne({
                where: { email: 'tests@example.com' }
            });
            expect(user).toBeTruthy();
        });

        it('TC1.10: Should generate unique UUID for each user', async () => {
            const response1 = await request(app)
                .post('/api/auth/register')
                .send({
                    email: 'user1@example.com',
                    password: 'Test123'
                });

            const response2 = await request(app)
                .post('/api/auth/register')
                .send({
                    email: 'user2@example.com',
                    password: 'Test123'
                });

            expect(response1.body.data.user.uuid).not.toBe(response2.body.data.user.uuid);
        });
    });

    describe('User Story 2: User Login', () => {
        const testUser = {
            email: 'tests@example.com',
            password: 'Test123'
        };

        beforeEach(async () => {
            // Create a tests user before each login tests
            await request(app)
                .post('/api/auth/register')
                .send(testUser);
        });

        it('TC2.1: Should login with valid credentials and return JWT', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send(testUser)
                .expect(200);

            expect(response.body).toHaveProperty('success', true);
            expect(response.body).toHaveProperty('message', 'Login successful');
            expect(response.body.data).toHaveProperty('token');
            expect(response.body.data.user).toHaveProperty('email', testUser.email);
            expect(response.body.data.user).not.toHaveProperty('password');
        });

        it('TC2.2: JWT should contain user identification in payload', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send(testUser);

            const token = response.body.data.token;
            const decoded = jwt.decode(token) as any;

            expect(decoded).toHaveProperty('userId');
            expect(decoded).toHaveProperty('email', testUser.email);
            expect(decoded).toHaveProperty('iat');
            expect(decoded).toHaveProperty('exp');
        });

        it('TC2.3: Should return 401 for invalid email', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'wrong@example.com',
                    password: testUser.password
                })
                .expect(401);

            expect(response.body).toHaveProperty('success', false);
            expect(response.body.error.message).toContain('Invalid credentials');
        });

        it('TC2.4: Should return 401 for invalid password', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send({
                    email: testUser.email,
                    password: 'WrongPassword'
                })
                .expect(401);

            expect(response.body).toHaveProperty('success', false);
            expect(response.body.error.message).toContain('Invalid credentials');
        });

        it('TC2.5: Should not expose password in response', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send(testUser);

            const responseString = JSON.stringify(response.body);
            expect(responseString).not.toContain(testUser.password);
            expect(response.body.data.user).not.toHaveProperty('password');
        });

        it('TC2.6: Should return 400 for missing email', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send({
                    password: testUser.password
                })
                .expect(400);

            expect(response.body).toHaveProperty('success', false);
            expect(response.body.error.message).toContain('Email is required');
        });

        it('TC2.7: Should return 400 for missing password', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send({
                    email: testUser.email
                })
                .expect(400);

            expect(response.body).toHaveProperty('success', false);
            expect(response.body.error.message).toContain('Password is required');
        });

        it('TC2.8: Should handle case-insensitive email login', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'TEST@EXAMPLE.COM',
                    password: testUser.password
                })
                .expect(200);

            expect(response.body.data.user.email).toBe('tests@example.com');
        });

        it('TC2.9: JWT should be valid and verifiable', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send(testUser);

            const token = response.body.data.token;
            const secret = process.env.JWT_SECRET || 'mySecretFormicroService';

            expect(() => jwt.verify(token, secret)).not.toThrow();
        });

        it('TC2.10: Should return different tokens for different users', async () => {
            // Create second user
            await request(app)
                .post('/api/auth/register')
                .send({
                    email: 'user2@example.com',
                    password: 'Test123'
                });

            const response1 = await request(app)
                .post('/api/auth/login')
                .send(testUser);

            const response2 = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'user2@example.com',
                    password: 'Test123'
                });

            expect(response1.body?.data?.token).not.toBe(response2?.body?.data?.token);
        });
    });
});