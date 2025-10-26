# TypeScript Express REST API

A robust, production-ready REST API built with TypeScript, Express.js, and MongoDB. Features comprehensive authentication, user management, input validation, security middleware, and extensive documentation.

## 🚀 Features

- **TypeScript** - Full type safety and modern JavaScript features
- **Express.js** - Fast, unopinionated web framework
- **MongoDB & Mongoose** - Document database with elegant modeling
- **JWT Authentication** - Secure token-based authentication
- **Input Validation** - Zod schemas for request validation
- **Security Middleware** - Rate limiting, CORS, helmet, and more
- **Error Handling** - Centralized error handling with custom error classes
- **Logging** - Winston logger with different log levels
- **Documentation** - Comprehensive TSDoc comments throughout codebase
- **Feature-Based Architecture** - Scalable, modular project structure

## 📋 Table of Contents

- [Quick Start](#-quick-start)
- [Project Structure](#-project-structure)
- [API Documentation](#-api-documentation)
- [Environment Variables](#-environment-variables)
- [Authentication](#-authentication)
- [Testing the API](#-testing-the-api)
- [Development](#-development)
- [Deployment](#-deployment)
- [Contributing](#-contributing)

## 🏃 Quick Start

### Prerequisites

- Node.js (v18+ recommended)
- MongoDB (local or cloud instance)
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd rest-api
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start MongoDB**
   ```bash
   # Local MongoDB
   mongod
   
   # Or use MongoDB Atlas (cloud)
   # Just ensure your MONGODB_URI is set correctly
   ```

5. **Run the application**
   ```bash
   # Development mode (with hot reload)
   npm run dev
   
   # Production build and start
   npm run build
   npm start
   ```

6. **Verify installation**
   ```bash
   curl http://localhost:3000
   # Should respond with: {"message": "Welcome to TypeScript Express REST API"}
   ```

## 🏗️ Project Structure

```
src/
├── index.ts                 # Application entry point
├── features/               # Feature-based modules
│   ├── auth/              # Authentication feature
│   │   ├── auth.controller.ts  # HTTP request handlers
│   │   ├── auth.routes.ts      # Route definitions
│   │   ├── auth.schemas.ts     # Zod validation schemas
│   │   ├── auth.service.ts     # Business logic
│   │   └── auth.types.ts       # TypeScript interfaces
│   └── users/             # User management feature
│       ├── user.controller.ts  # HTTP request handlers
│       ├── user.model.ts       # Mongoose schema & model
│       ├── user.routes.ts      # Route definitions
│       ├── user.schemas.ts     # Zod validation schemas
│       ├── user.service.ts     # Business logic
│       └── user.types.ts       # TypeScript interfaces
└── shared/                # Shared utilities and configuration
    ├── config/           # Configuration modules
    │   ├── database.ts   # MongoDB connection
    │   ├── env.ts        # Environment variables
    │   └── logger.ts     # Winston logger setup
    ├── middleware/       # Express middleware
    │   ├── auth.ts       # Authentication middleware
    │   ├── cors.ts       # CORS configuration
    │   ├── errorHandler.simple.ts  # Error handling
    │   ├── rateLimiter.ts           # Rate limiting
    │   ├── security.ts              # Security headers
    │   └── validation.ts            # Request validation
    ├── types/           # Shared TypeScript types
    │   ├── api.types.ts      # API response types
    │   ├── common.types.ts   # Common interfaces
    │   └── index.ts          # Type exports
    └── utils/           # Utility functions
        ├── ApiError.ts       # Custom error classes
        ├── asyncHandler.ts   # Async error handling
        ├── jwt.ts           # JWT utilities
        └── password.ts      # Password hashing utilities
```

### 🏗️ Development Phase Guide

When building this REST API from scratch, follow this recommended development order:

#### **Phase 1: Foundation Setup** 
*Set up the basic project infrastructure and core utilities*

```bash
# 1. Initialize project and install dependencies
npm init -y
npm install express mongoose zod bcrypt jsonwebtoken winston cors helmet express-rate-limit
npm install -D typescript @types/node @types/express @types/bcrypt @types/jsonwebtoken tsx nodemon

# 2. Create these files first:
```

1. **`tsconfig.json`** - TypeScript configuration
2. **`package.json`** - Scripts and dependencies  
3. **`.env`** - Environment variables
4. **`src/shared/config/env.ts`** - Environment validation
5. **`src/shared/config/logger.ts`** - Winston logger setup
6. **`src/shared/utils/ApiError.ts`** - Custom error classes
7. **`src/shared/utils/asyncHandler.ts`** - Async error wrapper

#### **Phase 2: Database & Authentication Utilities**
*Build core utilities before business logic*

8. **`src/shared/config/database.ts`** - MongoDB connection
9. **`src/shared/utils/password.ts`** - Password hashing utilities
10. **`src/shared/utils/jwt.ts`** - JWT token utilities
11. **`src/shared/types/api.types.ts`** - API response types
12. **`src/shared/types/common.types.ts`** - Common interfaces
13. **`src/shared/types/index.ts`** - Type exports

#### **Phase 3: Core Middleware**
*Essential middleware for security and request handling*

14. **`src/shared/middleware/cors.ts`** - CORS configuration
15. **`src/shared/middleware/security.ts`** - Security headers
16. **`src/shared/middleware/rateLimiter.ts`** - Rate limiting
17. **`src/shared/middleware/errorHandler.simple.ts`** - Error handling
18. **`src/shared/middleware/validation.ts`** - Request validation

#### **Phase 4: User Feature (Complete)**
*Build the user system first as auth depends on it*

19. **`src/features/users/user.types.ts`** - User TypeScript interfaces
20. **`src/features/users/user.schemas.ts`** - Zod validation schemas
21. **`src/features/users/user.model.ts`** - Mongoose user model
22. **`src/features/users/user.service.ts`** - User business logic
23. **`src/features/users/user.controller.ts`** - User HTTP handlers
24. **`src/features/users/user.routes.ts`** - User API endpoints

#### **Phase 5: Authentication Feature (Complete)**
*Build auth system after user system is ready*

25. **`src/features/auth/auth.types.ts`** - Auth TypeScript interfaces
26. **`src/features/auth/auth.schemas.ts`** - Auth validation schemas
27. **`src/features/auth/auth.service.ts`** - Auth business logic
28. **`src/features/auth/auth.controller.ts`** - Auth HTTP handlers
29. **`src/features/auth/auth.routes.ts`** - Auth API endpoints

#### **Phase 6: Authentication Middleware**
*Build auth middleware after auth service is complete*

30. **`src/shared/middleware/auth.ts`** - JWT authentication middleware

#### **Phase 7: Main Application**
*Tie everything together*

31. **`src/index.ts`** - Main application entry point

### 📋 Development Tips

**Why This Order?**
- ✅ **Dependencies First**: Build utilities before features that use them
- ✅ **Bottom-Up Approach**: Core infrastructure before business logic
- ✅ **User Before Auth**: Authentication needs user models to work
- ✅ **Middleware Last**: Auth middleware needs auth service to be complete
- ✅ **Integration Final**: Main app imports all completed modules

**Testing Each Phase:**
```bash
# After Phase 1-3: Test basic server
npm run dev
curl http://localhost:3000

# After Phase 4: Test user creation
curl -X POST http://localhost:3000/api/users -H "Content-Type: application/json" -d '{"email":"test@test.com"}'

# After Phase 5: Test authentication
curl -X POST http://localhost:3000/api/auth/register -H "Content-Type: application/json" -d '{"email":"test@test.com","password":"test123"}'

# After Phase 6-7: Test protected routes
curl -H "Authorization: Bearer TOKEN" http://localhost:3000/api/auth/me
```

**Phase Completion Checklist:**
- [ ] **Phase 1**: TypeScript compiles, basic utilities work
- [ ] **Phase 2**: Database connects, password hashing works  
- [ ] **Phase 3**: Server starts with all middleware
- [ ] **Phase 4**: User CRUD operations work
- [ ] **Phase 5**: Registration and login work
- [ ] **Phase 6**: Protected routes require authentication
- [ ] **Phase 7**: Full API is functional and tested

## 📚 API Documentation

### Base URL
```
http://localhost:3000/api
```

### Authentication Endpoints

#### POST /auth/register
Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "name": "John Doe"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "60f7c8a5b8c9e4a123456789",
      "email": "user@example.com",
      "name": "John Doe",
      "createdAt": "2023-10-26T10:30:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### POST /auth/login
Authenticate user credentials.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "60f7c8a5b8c9e4a123456789",
      "email": "user@example.com",
      "name": "John Doe"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### GET /auth/me
Get authenticated user's profile.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Response:**
```json
{
  "success": true,
  "message": "Profile retrieved successfully",
  "data": {
    "id": "60f7c8a5b8c9e4a123456789",
    "email": "user@example.com",
    "name": "John Doe",
    "createdAt": "2023-10-26T10:30:00.000Z",
    "updatedAt": "2023-10-26T10:30:00.000Z"
  }
}
```

#### PATCH /auth/change-password
Change user's password.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Request Body:**
```json
{
  "currentPassword": "oldPassword123",
  "newPassword": "newSecurePassword456"
}
```

#### POST /auth/forgot-password
Request password reset.

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

#### POST /auth/reset-password
Reset password with token.

**Request Body:**
```json
{
  "token": "reset_token_from_email",
  "newPassword": "newSecurePassword123"
}
```

#### POST /auth/verify-token
Verify JWT token validity.

**Request Body:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### POST /auth/logout
Logout user (client-side token removal).

### User Management Endpoints

#### GET /users
Get all users with pagination and filtering.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10, max: 100)
- `sort` (optional): Sort field ('name', 'email', 'createdAt')
- `search` (optional): Search in name/email fields

**Example:**
```bash
GET /api/users?page=2&limit=5&sort=name&search=john
```

#### GET /users/:id
Get user by ID (self-access only).

**Headers:**
```
Authorization: Bearer <jwt-token>
```

#### PUT /users/:id
Update user information (self-access only).

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Request Body:**
```json
{
  "name": "Updated Name",
  "email": "newemail@example.com"
}
```

#### DELETE /users/:id
Delete user account (self-access only).

**Headers:**
```
Authorization: Bearer <jwt-token>
```

## 🔒 Authentication

This API uses JWT (JSON Web Tokens) for authentication. After successful login or registration, you'll receive a token that must be included in the `Authorization` header for protected routes.

### Token Format
```
Authorization: Bearer <your-jwt-token>
```

### Token Expiration
- Access tokens expire after 24 hours
- Users need to login again after token expiration

### Protected Routes
Most endpoints require authentication. Public endpoints include:
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/forgot-password`
- `POST /api/auth/reset-password`
- `POST /api/auth/verify-token`
- `POST /api/auth/logout`

## 🌍 Environment Variables

Create a `.env` file in the root directory:

```env
# Server Configuration
NODE_ENV=development
PORT=3000

# Database
MONGODB_URI=mongodb://localhost:27017/rest-api

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=24h

# Email Configuration (for password reset)
EMAIL_FROM=noreply@yourapp.com
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Logging
LOG_LEVEL=info
```

## 🧪 Testing the API

### Using cURL

#### 1. Test Server Status
```bash
curl http://localhost:3000
```

#### 2. Register a New User
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "testPassword123",
    "name": "Test User"
  }'
```

#### 3. Login User
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "testPassword123"
  }'
```

#### 4. Get User Profile (use token from login)
```bash
curl -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

#### 5. Get All Users
```bash
curl -X GET http://localhost:3000/api/users \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

#### 6. Update User Profile
```bash
curl -X PUT http://localhost:3000/api/users/USER_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Name",
    "email": "updated@example.com"
  }'
```

### Using Postman

1. **Import Collection**: Create a new Postman collection
2. **Set Base URL**: `http://localhost:3000/api`
3. **Configure Auth**: Use Bearer Token type with your JWT  
4. **Test Endpoints**: Follow the API documentation above

### Sample Testing Flow

1. **Register** a new user → Save the returned JWT token
2. **Login** with the same credentials → Verify token is valid
3. **Get profile** using the token → Verify user data
4. **Get users list** → Verify pagination works
5. **Update profile** → Verify changes are saved
6. **Change password** → Verify authentication still works
7. **Delete account** → Verify user is removed

## 💻 Development

### Available Scripts

```bash
# Development with hot reload
npm run dev

# Build TypeScript to JavaScript
npm run build

# Start production server
npm start

# Type checking only
npm run type-check

# Linting
npm run lint

# Format code
npm run format
```

### Code Style & Standards

- **TypeScript**: Strict mode enabled with comprehensive type checking
- **ESLint**: Code linting with TypeScript rules
- **Prettier**: Code formatting for consistency
- **TSDoc**: Comprehensive documentation comments
- **Error Handling**: Centralized error handling with custom error classes
- **Validation**: Zod schemas for runtime type validation

### Adding New Features

1. **Create Feature Directory**: `src/features/your-feature/`
2. **Add Types**: Define TypeScript interfaces in `types.ts`
3. **Create Schemas**: Add Zod validation schemas in `schemas.ts`
4. **Build Model**: Create Mongoose model if needed in `model.ts`
5. **Implement Service**: Add business logic in `service.ts`
6. **Create Controller**: Add HTTP handlers in `controller.ts`
7. **Define Routes**: Set up endpoints in `routes.ts`
8. **Update Main App**: Import routes in `src/index.ts`

### Database Migrations

This project uses Mongoose without formal migrations. For schema changes:

1. Update the Mongoose model
2. Handle backward compatibility in your service layer
3. Consider data transformation scripts for major changes

## 🚀 Deployment

### Using PM2 (Production)

1. **Install PM2**
   ```bash
   npm install -g pm2
   ```

2. **Build Application**
   ```bash
   npm run build
   ```

3. **Start with PM2**
   ```bash
   pm2 start dist/index.js --name "rest-api"
   ```

4. **Monitor**
   ```bash
   pm2 status
   pm2 logs rest-api
   ```

### Using Docker

1. **Create Dockerfile**
   ```dockerfile
   FROM node:18-alpine
   WORKDIR /app
   COPY package*.json ./
   RUN npm ci --only=production
   COPY dist/ ./dist/
   EXPOSE 3000
   CMD ["node", "dist/index.js"]
   ```

2. **Build and Run**
   ```bash
   docker build -t rest-api .
   docker run -p 3000:3000 --env-file .env rest-api
   ```

### Environment-Specific Configurations

- **Development**: Hot reload, detailed logging, CORS enabled
- **Production**: Optimized build, error logging only, security headers
- **Testing**: In-memory database, mock services

## 🤝 Contributing

1. **Fork the repository**
2. **Create feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit changes**: `git commit -m 'Add amazing feature'`
4. **Push to branch**: `git push origin feature/amazing-feature`
5. **Open Pull Request**

### Contribution Guidelines

- Follow existing code style and patterns
- Add TSDoc comments for new functions/classes
- Include tests for new features
- Update README if adding new functionality
- Ensure TypeScript compiles without errors

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Express.js** - Web framework
- **Mongoose** - MongoDB object modeling
- **Zod** - TypeScript-first schema validation
- **Winston** - Logging library
- **Helmet** - Security middleware
- **bcrypt** - Password hashing

## 📞 Support

For support, email your-email@example.com or create an issue in the repository.

---

**Built with ❤️ using TypeScript and Express.js**
