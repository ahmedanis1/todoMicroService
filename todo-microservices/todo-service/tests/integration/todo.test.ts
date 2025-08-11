import request = require('supertest');
import app from '../../src/app';
import { AppDataSource } from '../../src/config/database';
import { Todo } from '../../src/models/todo.model';
import * as jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';



describe('Todo Service - CRUD Operations Tests', () => {
    const todoRepository = () => AppDataSource.getRepository(Todo);

    let validToken: string;
    let anotherUserToken: string;
    const userId = uuidv4();
    const anotherUserId = uuidv4();

    beforeAll(() => {
        // Generate valid tokens for testing
        const secret = process.env.JWT_SECRET || 'test-secret';

        validToken = jwt.sign(
            { userId, email: 'test@example.com' },
            secret,
            { expiresIn: '1h' }
        );

        anotherUserToken = jwt.sign(
            { userId: anotherUserId, email: 'another@example.com' },
            secret,
            { expiresIn: '1h' }
        );
    });

    describe('User Story 1: Create Todo', () => {
        const validTodo = {
            content: 'Buy groceries'
        };

        it('TC3.1: Should create a todo with valid JWT', async () => {
            const response = await request(app)
                .post('/api/todos')
                .set('Authorization', `Bearer ${validToken}`)
                .send(validTodo)
                .expect(201);

            expect(response.body).toHaveProperty('success', true);
            expect(response.body).toHaveProperty('message', 'Todo created successfully');
            expect(response.body.data).toHaveProperty('uuid');
            expect(response.body.data).toHaveProperty('content', validTodo.content);
            expect(response.body.data).toHaveProperty('completed', false);
            expect(response.body.data).toHaveProperty('userUuid', userId);
        });

        it('TC3.2: Created todo should be associated with authenticated user', async () => {
            const response = await request(app)
                .post('/api/todos')
                .set('Authorization', `Bearer ${validToken}`)
                .send(validTodo);

            const todoId = response.body.data.uuid;
            const todo = await todoRepository().findOne({
                where: { uuid: todoId }
            });

            expect(todo?.userUuid).toBe(userId);
        });

        it('TC3.3: Should return 401 if JWT is missing', async () => {
            const response = await request(app)
                .post('/api/todos')
                .send(validTodo)
                .expect(401);

            expect(response.body).toHaveProperty('success', false);
            expect(response.body.error.message).toContain('No token provided');
        });

        it('TC3.4: Should return 401 if JWT is invalid', async () => {
            const response = await request(app)
                .post('/api/todos')
                .set('Authorization', 'Bearer invalid.token.here')
                .send(validTodo)
                .expect(401);

            expect(response.body).toHaveProperty('success', false);
            expect(response.body.error.message).toContain('Invalid token');
        });

        it('TC3.5: Should return 401 if JWT is expired', async () => {
            const expiredToken = jwt.sign(
                { userId, email: 'test@example.com' },
                process.env.JWT_SECRET || 'test-secret',
                { expiresIn: '-1h' }
            );

            const response = await request(app)
                .post('/api/todos')
                .set('Authorization', `Bearer ${expiredToken}`)
                .send(validTodo)
                .expect(401);

            expect(response.body).toHaveProperty('success', false);
            expect(response.body.error.message).toContain('Token expired');
        });

        it('TC3.6: Should return 400 for empty content', async () => {
            const response = await request(app)
                .post('/api/todos')
                .set('Authorization', `Bearer ${validToken}`)
                .send({ content: '' })
                .expect(400);

            expect(response.body).toHaveProperty('success', false);
            expect(response.body.error.message).toContain('cannot be empty');
        });

        it('TC3.7: Should return 400 for missing content', async () => {
            const response = await request(app)
                .post('/api/todos')
                .set('Authorization', `Bearer ${validToken}`)
                .send({})
                .expect(400);

            expect(response.body).toHaveProperty('success', false);
            expect(response.body.error.message).toContain('content is required');
        });

        it('TC3.8: Should return 400 for content exceeding max length', async () => {
            const longContent = 'a'.repeat(1001);

            const response = await request(app)
                .post('/api/todos')
                .set('Authorization', `Bearer ${validToken}`)
                .send({ content: longContent })
                .expect(400);

            expect(response.body).toHaveProperty('success', false);
            expect(response.body.error.message).toContain('exceed 1000 characters');
        });

        it('TC3.9: Should generate unique UUID for each todo', async () => {
            const response1 = await request(app)
                .post('/api/todos')
                .set('Authorization', `Bearer ${validToken}`)
                .send({ content: 'Todo 1' });

            const response2 = await request(app)
                .post('/api/todos')
                .set('Authorization', `Bearer ${validToken}`)
                .send({ content: 'Todo 2' });

            expect(response1.body.data.uuid).not.toBe(response2.body.data.uuid);
        });

        it('TC3.10: Should set completed to false by default', async () => {
            const response = await request(app)
                .post('/api/todos')
                .set('Authorization', `Bearer ${validToken}`)
                .send(validTodo);

            expect(response.body.data.completed).toBe(false);
        });
    });

    describe('User Story 2: Read Todos', () => {
        beforeEach(async () => {
            // Clear todos and create test data
            await todoRepository().clear();

            // Create todos for main user
            await todoRepository().save([
                { content: 'Todo 1', userUuid: userId, completed: false },
                { content: 'Todo 2', userUuid: userId, completed: true },
                { content: 'Todo 3', userUuid: userId, completed: false }
            ]);

            // Create todos for another user
            await todoRepository().save([
                { content: 'Another user todo', userUuid: anotherUserId, completed: false }
            ]);
        });

        it('TC4.1: Should fetch todos with valid JWT', async () => {
            const response = await request(app)
                .get('/api/todos')
                .set('Authorization', `Bearer ${validToken}`)
                .expect(200);

            expect(response.body).toHaveProperty('success', true);
            expect(response.body.data).toBeInstanceOf(Array);
            expect(response.body.data).toHaveLength(3);
        });

        it('TC4.2: Should return only todos belonging to authenticated user', async () => {
            const response = await request(app)
                .get('/api/todos')
                .set('Authorization', `Bearer ${validToken}`)
                .expect(200);

            response.body.data.forEach((todo: any) => {
                expect(todo.userUuid).toBe(userId);
            });

            // Verify another user's todos are not included
            const todoContents = response.body.data.map((t: any) => t.content);
            expect(todoContents).not.toContain('Another user todo');
        });

        it('TC4.3: Should return empty array if user has no todos', async () => {
            // Clear todos for main user
            await todoRepository().delete({ userUuid: userId });

            const response = await request(app)
                .get('/api/todos')
                .set('Authorization', `Bearer ${validToken}`)
                .expect(200);

            expect(response.body).toHaveProperty('success', true);
            expect(response.body.data).toEqual([]);
        });

        it('TC4.4: Should return 401 if JWT is missing', async () => {
            const response = await request(app)
                .get('/api/todos')
                .expect(401);

            expect(response.body).toHaveProperty('success', false);
            expect(response.body.error.message).toContain('No token provided');
        });

        it('TC4.5: Should return 401 if JWT is invalid', async () => {
            const response = await request(app)
                .get('/api/todos')
                .set('Authorization', 'Bearer invalid.token')
                .expect(401);

            expect(response.body).toHaveProperty('success', false);
            expect(response.body.error.message).toContain('Invalid token');
        });

        it('TC4.6: Should return todos in correct format', async () => {
            const response = await request(app)
                .get('/api/todos')
                .set('Authorization', `Bearer ${validToken}`)
                .expect(200);

            const todo = response.body.data[0];
            expect(todo).toHaveProperty('id');
            expect(todo).toHaveProperty('uuid');
            expect(todo).toHaveProperty('content');
            expect(todo).toHaveProperty('completed');
            expect(todo).toHaveProperty('userUuid');
            expect(todo).toHaveProperty('createdAt');
            expect(todo).toHaveProperty('updatedAt');
        });

        it('TC4.7: Different users should see different todos', async () => {
            const response1 = await request(app)
                .get('/api/todos')
                .set('Authorization', `Bearer ${validToken}`);

            const response2 = await request(app)
                .get('/api/todos')
                .set('Authorization', `Bearer ${anotherUserToken}`);

            expect(response1.body.data).toHaveLength(3);
            expect(response2.body.data).toHaveLength(1);
            expect(response2.body.data[0].content).toBe('Another user todo');
        });
    });

    describe('User Story 3: Update Todo', () => {
        let todoId: string;

        beforeEach(async () => {
            await todoRepository().clear();

            const todo = await todoRepository().save({
                content: 'Original content',
                userUuid: userId,
                completed: false
            });
            todoId = todo.uuid;

            // Create todo for another user
            await todoRepository().save({
                content: 'Another user todo',
                userUuid: anotherUserId,
                completed: false
            });
        });

        it('TC5.1: Should update todo with valid JWT', async () => {
            const response = await request(app)
                .put(`/api/todos/${todoId}`)
                .set('Authorization', `Bearer ${validToken}`)
                .send({
                    content: 'Updated content',
                    completed: true
                })
                .expect(200);

            expect(response.body).toHaveProperty('success', true);
            expect(response.body).toHaveProperty('message', 'Todo updated successfully');
            expect(response.body.data).toHaveProperty('content', 'Updated content');
            expect(response.body.data).toHaveProperty('completed', true);
        });

        it('TC5.2: Only owner should be able to update todo', async () => {
            const response = await request(app)
                .put(`/api/todos/${todoId}`)
                .set('Authorization', `Bearer ${anotherUserToken}`)
                .send({
                    content: 'Trying to update'
                })
                .expect(404);

            expect(response.body).toHaveProperty('success', false);
            expect(response.body.error.message).toContain('not found');
        });

        it('TC5.3: Should return 404 if todo does not exist', async () => {
            const nonExistentId = uuidv4();

            const response = await request(app)
                .put(`/api/todos/${nonExistentId}`)
                .set('Authorization', `Bearer ${validToken}`)
                .send({
                    content: 'Updated content'
                })
                .expect(404);

            expect(response.body).toHaveProperty('success', false);
            expect(response.body.error.message).toContain('not found');
        });

        it('TC5.4: Should return 401 if JWT is missing', async () => {
            const response = await request(app)
                .put(`/api/todos/${todoId}`)
                .send({
                    content: 'Updated content'
                })
                .expect(401);

            expect(response.body).toHaveProperty('success', false);
            expect(response.body.error.message).toContain('No token provided');
        });

        it('TC5.5: Should return 401 if JWT is invalid', async () => {
            const response = await request(app)
                .put(`/api/todos/${todoId}`)
                .set('Authorization', 'Bearer invalid.token')
                .send({
                    content: 'Updated content'
                })
                .expect(401);

            expect(response.body).toHaveProperty('success', false);
            expect(response.body.error.message).toContain('Invalid token');
        });

        it('TC5.6: Should allow partial updates (only content)', async () => {
            const response = await request(app)
                .put(`/api/todos/${todoId}`)
                .set('Authorization', `Bearer ${validToken}`)
                .send({
                    content: 'Only content updated'
                })
                .expect(200);

            expect(response.body.data.content).toBe('Only content updated');
            expect(response.body.data.completed).toBe(false);
        });

        it('TC5.7: Should allow partial updates (only completed)', async () => {
            const response = await request(app)
                .put(`/api/todos/${todoId}`)
                .set('Authorization', `Bearer ${validToken}`)
                .send({
                    completed: true
                })
                .expect(200);

            expect(response.body.data.content).toBe('Original content');
            expect(response.body.data.completed).toBe(true);
        });

        it('TC5.8: Should return 400 for invalid update data', async () => {
            const response = await request(app)
                .put(`/api/todos/${todoId}`)
                .set('Authorization', `Bearer ${validToken}`)
                .send({
                    content: ''
                })
                .expect(400);

            expect(response.body).toHaveProperty('success', false);
            expect(response.body.error.message).toContain('cannot be empty');
        });

        it('TC5.9: Should update updatedAt timestamp', async () => {
            const originalTodo = await todoRepository().findOne({
                where: { uuid: todoId }
            });
            const originalUpdatedAt = originalTodo?.updatedAt;

            await new Promise(resolve => setTimeout(resolve, 1000));

            await request(app)
                .put(`/api/todos/${todoId}`)
                .set('Authorization', `Bearer ${validToken}`)
                .send({
                    content: 'Updated to check timestamp'
                });

            const updatedTodo = await todoRepository().findOne({
                where: { uuid: todoId }
            });

            expect(updatedTodo?.updatedAt).not.toEqual(originalUpdatedAt);
        });
    });

    describe('User Story 4: Delete Todo', () => {
        let todoId: string;
        let anotherUserTodoId: string;

        beforeEach(async () => {
            await todoRepository().clear();

            const todo = await todoRepository().save({
                content: 'Todo to delete',
                userUuid: userId,
                completed: false
            });
            todoId = todo.uuid;

            const anotherTodo = await todoRepository().save({
                content: 'Another user todo',
                userUuid: anotherUserId,
                completed: false
            });
            anotherUserTodoId = anotherTodo.uuid;
        });

        it('TC6.1: Should delete todo with valid JWT', async () => {
            await request(app)
                .delete(`/api/todos/${todoId}`)
                .set('Authorization', `Bearer ${validToken}`)
                .expect(204);

            const deletedTodo = await todoRepository().findOne({
                where: { uuid: todoId }
            });
            expect(deletedTodo).toBeNull();
        });

        it('TC6.2: Only owner should be able to delete todo', async () => {
            const response = await request(app)
                .delete(`/api/todos/${todoId}`)
                .set('Authorization', `Bearer ${anotherUserToken}`)
                .expect(404);

            expect(response.body).toHaveProperty('success', false);

            // Verify todo still exists
            const todo = await todoRepository().findOne({
                where: { uuid: todoId }
            });
            expect(todo).toBeTruthy();
        });

        it('TC6.3: Should return 404 if todo does not exist', async () => {
            const nonExistentId = uuidv4();

            const response = await request(app)
                .delete(`/api/todos/${nonExistentId}`)
                .set('Authorization', `Bearer ${validToken}`)
                .expect(404);

            expect(response.body).toHaveProperty('success', false);
            expect(response.body.error.message).toContain('not found');
        });

        it('TC6.4: Should return 401 if JWT is missing', async () => {
            const response = await request(app)
                .delete(`/api/todos/${todoId}`)
                .expect(401);

            expect(response.body).toHaveProperty('success', false);
            expect(response.body.error.message).toContain('No token provided');

            // Verify todo still exists
            const todo = await todoRepository().findOne({
                where: { uuid: todoId }
            });
            expect(todo).toBeTruthy();
        });

        it('TC6.5: Should return 401 if JWT is invalid', async () => {
            const response = await request(app)
                .delete(`/api/todos/${todoId}`)
                .set('Authorization', 'Bearer invalid.token')
                .expect(401);

            expect(response.body).toHaveProperty('success', false);
            expect(response.body.error.message).toContain('Invalid token');
        });

        it('TC6.6: Should not return any content on successful deletion', async () => {
            const response = await request(app)
                .delete(`/api/todos/${todoId}`)
                .set('Authorization', `Bearer ${validToken}`)
                .expect(204);

            expect(response.body).toEqual({});
        });

        it('TC6.7: Should handle deletion of already deleted todo', async () => {
            // First deletion
            await request(app)
                .delete(`/api/todos/${todoId}`)
                .set('Authorization', `Bearer ${validToken}`)
                .expect(204);

            // Second deletion attempt
            const response = await request(app)
                .delete(`/api/todos/${todoId}`)
                .set('Authorization', `Bearer ${validToken}`)
                .expect(404);

            expect(response.body).toHaveProperty('success', false);
            expect(response.body.error.message).toContain('not found');
        });

        it('TC6.8: Deleting one todo should not affect others', async () => {
            // Create another todo for the same user
            const anotherTodo = await todoRepository().save({
                content: 'Keep this todo',
                userUuid: userId,
                completed: false
            });

            await request(app)
                .delete(`/api/todos/${todoId}`)
                .set('Authorization', `Bearer ${validToken}`)
                .expect(204);

            // Verify other todos still exist
            const remainingTodo = await todoRepository().findOne({
                where: { uuid: anotherTodo.uuid }
            });
            expect(remainingTodo).toBeTruthy();

            const anotherUsersTodo = await todoRepository().findOne({
                where: { uuid: anotherUserTodoId }
            });
            expect(anotherUsersTodo).toBeTruthy();
        });
    });
});