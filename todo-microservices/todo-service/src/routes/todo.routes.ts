import { Router } from 'express';
import * as todoController from '../controllers/todo.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validation.middleware';
import { createTodoSchema, updateTodoSchema, uuidSchema } from '../validators/todo.validator';

const router = Router();

// All routes require authentication
router.use(authenticate);

// POST /api/todos - Create new todo
router.post('/', validate(createTodoSchema), todoController.createTodo);

// GET /api/todos - Get all todos for authenticated user
router.get('/', todoController.getAllTodos);

// GET /api/todos/:id - Get specific todo
router.get('/:id', todoController.getTodoById);

// PUT /api/todos/:id - Update todo
router.put('/:id', validate(updateTodoSchema), todoController.updateTodo);

// DELETE /api/todos/:id - Delete todo
router.delete('/:id', todoController.deleteTodo);

export default router;