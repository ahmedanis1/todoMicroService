# Todo Microservices Application

A full-stack todo application built with microservices architecture using Node.js, TypeScript, React, and MySQL.

## 📋 Table of Contents

- [Architecture Overview](#-architecture-overview)
- [Tech Stack](#-tech-stack)
- [Prerequisites](#-prerequisites)
- [Project Structure](#-project-structure)
- [Installation & Setup](#-installation--setup)
- [Running the Application](#-running-the-application)
- [API Documentation](#-api-documentation)
- [Testing](#-testing)
- [Docker Support](#-docker-support)
- [Environment Variables](#-environment-variables)
- [Troubleshooting](#-troubleshooting)
- [Contributing](#-contributing)
- [License](#-license)

## 🏗 Architecture Overview

This application follows a microservices architecture with the following components:

```
┌─────────────────┐
│   Frontend      │
│   (React)       │
│   Port: 3000    │
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
┌────▼──┐  ┌──▼────┐
│ User  │  │ Todo  │
│Service│  │Service│
│ :3001 │  │ :3002 │
└───┬───┘  └───┬───┘
    │          │
┌───▼───┐  ┌───▼───┐
│ MySQL │  │ MySQL │
│userdb │  │tododb │
└───────┘  └───────┘
```

### Services:

1. **User Service** - Handles authentication (register/login) and JWT token generation
2. **Todo Service** - Manages CRUD operations for todos with JWT validation
3. **Frontend** - React application with Ant Design UI components

## 🛠 Tech Stack

### Backend
- **Runtime**: Node.js (v16+)
- **Language**: TypeScript
- **Framework**: Express.js
- **Database**: MySQL 8.0
- **ORM**: TypeORM
- **Authentication**: JWT (jsonwebtoken)
- **Validation**: Joi
- **Security**: Helmet, CORS, bcrypt
- **Testing**: Jest, Supertest

### Frontend
- **Framework**: React 18
- **UI Library**: Ant Design (antd)
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **State Management**: React Hooks
- **Styling**: CSS, Ant Design styles

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v16.0.0 or higher)
- **npm** (v7.0.0 or higher)
- **MySQL** (v8.0 or higher)
- **Git**

### Verify Installation:
```bash
node --version    # Should output v16.x.x or higher
npm --version     # Should output v7.x.x or higher
mysql --version   # Should output 8.x.x
```

## 📁 Project Structure

```
todo-microservices/
├── user-service/
│   ├── src/
│   │   ├── config/         # Database and environment config
│   │   ├── controllers/    # Request handlers
│   │   ├── middlewares/    # Custom middleware
│   │   ├── models/         # Database models
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic
│   │   ├── utils/          # Utility functions
│   │   ├── validators/     # Input validation schemas
│   │   ├── types/          # TypeScript types
│   │   ├── app.ts          # Express app setup
│   │   └── index.ts        # Entry point
│   ├── package.json
│   ├── tsconfig.json
│   ├── .env
│   └── nodemon.json
│
├── todo-service/
│   ├── src/
│   │   └── [Similar structure as user-service]
│   ├── package.json
│   ├── tsconfig.json
│   ├── .env
│   └── nodemon.json
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API services
│   │   ├── utils/          # Utility functions
│   │   ├── App.js          # Main App component
│   │   └── index.js        # Entry point
│   ├── package.json
│   └── .env
│
├── docker-compose.yml       # Docker orchestration
└── README.md               # This file
```

## 🚀 Installation & Setup

### Step 1: Clone the Repository

```bash
git clone <repository-url>
cd todo-microservices
```

### Step 2: Setup MySQL Databases

```bash
# Login to MySQL
mysql -u root -p

# Run the following SQL commands:
```

```sql
-- Create databases
CREATE DATABASE IF NOT EXISTS userdb;
CREATE DATABASE IF NOT EXISTS tododb;

-- Create users
CREATE USER IF NOT EXISTS 'userservice'@'localhost' IDENTIFIED BY 'userpass123';
CREATE USER IF NOT EXISTS 'todoservice'@'localhost' IDENTIFIED BY 'todopass123';

-- Grant privileges
GRANT ALL PRIVILEGES ON userdb.* TO 'userservice'@'localhost';
GRANT ALL PRIVILEGES ON tododb.* TO 'todoservice'@'localhost';

-- Apply changes
FLUSH PRIVILEGES;

-- Exit MySQL
EXIT;
```

### Step 3: Setup User Service

```bash
# Navigate to user service
cd user-service

# Install dependencies
npm install

# Create .env file
cat > .env << EOL
NODE_ENV=development
PORT=3001
DB_HOST=localhost
DB_PORT=3306
DB_USER=userservice
DB_PASSWORD=userpass123
DB_NAME=userdb
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=24h
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:8080
EOL
```

### Step 4: Setup Todo Service

```bash
# Navigate to todo service
cd ../todo-service

# Install dependencies
npm install

# Create .env file
cat > .env << EOL
NODE_ENV=development
PORT=3002
DB_HOST=localhost
DB_PORT=3306
DB_USER=todoservice
DB_PASSWORD=todopass123
DB_NAME=tododb
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:8080
EOL
```

### Step 5: Setup Frontend

```bash
# Navigate to frontend
cd ../frontend

# Install dependencies
npm install

# Create .env file
cat > .env << EOL
REACT_APP_USER_SERVICE_URL=http://localhost:3001
REACT_APP_TODO_SERVICE_URL=http://localhost:3002
EOL
```

## 🏃‍♂️ Running the Application

### Development Mode

Open **3 separate terminal windows** and run:

#### Terminal 1 - User Service:
```bash
cd user-service
npm run dev
```
You should see:
```
✅ Database connection established
🚀 User Service running on port 3001
📍 Environment: development
```

#### Terminal 2 - Todo Service:
```bash
cd todo-service
npm run dev
```
You should see:
```
✅ Database connection established
🚀 Todo Service running on port 3002
📍 Environment: development
```

#### Terminal 3 - Frontend:
```bash
cd frontend
npm start
```
The browser will open automatically at http://localhost:3000

### Production Mode

#### Build and run services:
```bash
# User Service
cd user-service
npm run build
npm start

# Todo Service
cd todo-service
npm run build
npm start

# Frontend
cd frontend
npm run build
npx serve -s build -l 3000
```

## 📚 API Documentation

### Base URLs
- User Service: `http://localhost:3001`
- Todo Service: `http://localhost:3002`

### Authentication Endpoints

#### 1. Register User
Creates a new user account and returns JWT token.

**Endpoint:** `POST /api/auth/register`  
**Service:** User Service  
**Auth Required:** No

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "Test123"
}
```

**Validation Rules:**
- Email: Valid email format, required
- Password: Minimum 6 characters, required

**Success Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "1",
      "uuid": "550e8400-e29b-41d4-a716-446655440000",
      "email": "user@example.com"
    }
  }
}
```

**Error Response (409):**
```json
{
  "success": false,
  "error": {
    "message": "Email already registered"
  }
}
```

#### 2. Login User
Authenticates user and returns JWT token.

**Endpoint:** `POST /api/auth/login`  
**Service:** User Service  
**Auth Required:** No

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "Test123"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "1",
      "uuid": "550e8400-e29b-41d4-a716-446655440000",
      "email": "user@example.com"
    }
  }
}
```

**Error Response (401):**
```json
{
  "success": false,
  "error": {
    "message": "Invalid credentials"
  }
}
```

### Todo Endpoints

All todo endpoints require JWT authentication. Include the token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

#### 3. Create Todo
Creates a new todo for the authenticated user.

**Endpoint:** `POST /api/todos`  
**Service:** Todo Service  
**Auth Required:** Yes

**Request Body:**
```json
{
  "content": "Buy groceries"
}
```

**Validation Rules:**
- Content: Min 1 character, Max 1000 characters, required

**Success Response (201):**
```json
{
  "success": true,
  "message": "Todo created successfully",
  "data": {
    "id": "1",
    "uuid": "123e4567-e89b-12d3-a456-426614174000",
    "content": "Buy groceries",
    "completed": false,
    "userUuid": "550e8400-e29b-41d4-a716-446655440000",
    "createdAt": "2024-01-10T10:00:00.000Z",
    "updatedAt": "2024-01-10T10:00:00.000Z"
  }
}
```

#### 4. Get All Todos
Retrieves all todos for the authenticated user.

**Endpoint:** `GET /api/todos`  
**Service:** Todo Service  
**Auth Required:** Yes

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "1",
      "uuid": "123e4567-e89b-12d3-a456-426614174000",
      "content": "Buy groceries",
      "completed": false,
      "userUuid": "550e8400-e29b-41d4-a716-446655440000",
      "createdAt": "2024-01-10T10:00:00.000Z",
      "updatedAt": "2024-01-10T10:00:00.000Z"
    }
  ]
}
```

#### 5. Get Single Todo
Retrieves a specific todo by ID.

**Endpoint:** `GET /api/todos/:id`  
**Service:** Todo Service  
**Auth Required:** Yes

**URL Parameters:**
- `id`: UUID of the todo

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "1",
    "uuid": "123e4567-e89b-12d3-a456-426614174000",
    "content": "Buy groceries",
    "completed": false,
    "userUuid": "550e8400-e29b-41d4-a716-446655440000",
    "createdAt": "2024-01-10T10:00:00.000Z",
    "updatedAt": "2024-01-10T10:00:00.000Z"
  }
}
```

#### 6. Update Todo
Updates an existing todo.

**Endpoint:** `PUT /api/todos/:id`  
**Service:** Todo Service  
**Auth Required:** Yes

**URL Parameters:**
- `id`: UUID of the todo

**Request Body:**
```json
{
  "content": "Buy groceries and household items",
  "completed": true
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Todo updated successfully",
  "data": {
    "id": "1",
    "uuid": "123e4567-e89b-12d3-a456-426614174000",
    "content": "Buy groceries and household items",
    "completed": true,
    "userUuid": "550e8400-e29b-41d4-a716-446655440000",
    "createdAt": "2024-01-10T10:00:00.000Z",
    "updatedAt": "2024-01-10T13:00:00.000Z"
  }
}
```

#### 7. Delete Todo
Deletes a todo permanently.

**Endpoint:** `DELETE /api/todos/:id`  
**Service:** Todo Service  
**Auth Required:** Yes

**URL Parameters:**
- `id`: UUID of the todo

**Success Response (204):**
```
No Content
```

### Error Responses

All endpoints may return the following error responses:

#### 400 Bad Request
```json
{
  "success": false,
  "error": {
    "message": "Validation error message"
  }
}
```

#### 401 Unauthorized
```json
{
  "success": false,
  "error": {
    "message": "No token provided"
  }
}
```

#### 404 Not Found
```json
{
  "success": false,
  "error": {
    "message": "Resource not found"
  }
}
```

#### 500 Internal Server Error
```json
{
  "success": false,
  "error": {
    "message": "Internal Server Error"
  }
}
```

## 🧪 Testing

### Testing with Postman

1. Import the Postman collection from `api-docs/postman-collection.json`
2. Set environment variables:
   - `user_service_url`: http://localhost:3001
   - `todo_service_url`: http://localhost:3002
3. Run the collection

### Testing with cURL

#### Register:
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "Test123"}'
```

#### Login:
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "Test123"}'
```

#### Create Todo:
```bash
curl -X POST http://localhost:3002/api/todos \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{"content": "Buy groceries"}'
```

### Unit Testing

```bash
# User Service
cd user-service
npm test

# Todo Service
cd todo-service
npm test

# Frontend
cd frontend
npm test
```

## 🐳 Docker Support

### Using Docker Compose

```bash
# Build and run all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Stop and remove volumes
docker-compose down -v
```

## 🔧 Environment Variables

### User Service (.env)

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | development |
| `PORT` | Service port | 3001 |
| `DB_HOST` | MySQL host | localhost |
| `DB_PORT` | MySQL port | 3306 |
| `DB_USER` | Database user | userservice |
| `DB_PASSWORD` | Database password | userpass123 |
| `DB_NAME` | Database name | userdb |
| `JWT_SECRET` | JWT signing secret | change-this-secret |
| `JWT_EXPIRES_IN` | Token expiration | 24h |
| `ALLOWED_ORIGINS` | CORS allowed origins | http://localhost:3000 |

### Todo Service (.env)

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | development |
| `PORT` | Service port | 3002 |
| `DB_HOST` | MySQL host | localhost |
| `DB_PORT` | MySQL port | 3306 |
| `DB_USER` | Database user | todoservice |
| `DB_PASSWORD` | Database password | todopass123 |
| `DB_NAME` | Database name | tododb |
| `JWT_SECRET` | JWT signing secret | change-this-secret |
| `ALLOWED_ORIGINS` | CORS allowed origins | http://localhost:3000 |

### Frontend (.env)

| Variable | Description | Default |
|----------|-------------|---------|
| `REACT_APP_USER_SERVICE_URL` | User service URL | http://localhost:3001 |
| `REACT_APP_TODO_SERVICE_URL` | Todo service URL | http://localhost:3002 |

## 🐛 Troubleshooting

### Common Issues

#### CORS Error
```bash
# Ensure ALLOWED_ORIGINS includes http://localhost:3000
# Restart backend services after changes
```

#### Database Connection Failed
```bash
# Check MySQL is running
sudo systemctl status mysql

# Verify credentials in .env files
```

#### Port Already in Use
```bash
# Find process using port
lsof -i :3001  # Mac/Linux
netstat -ano | findstr :3001  # Windows

# Kill the process
kill -9 <PID>  # Mac/Linux
taskkill /PID <PID> /F  # Windows
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 👥 Authors

- Ahmad Anis - 

## 🙏 Acknowledgments

- Built as a technical challenge demonstrating microservices architecture
- Uses best practices for Node.js and React development
- Implements proper authentication and authorization
- Follows RESTful API design principles

---

**Happy Coding! 🚀**
