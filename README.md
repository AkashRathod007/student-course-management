# 📚 Student Course Management System

A full-stack RESTful API backend for managing students and courses, built with **Node.js**, **Express 5**, and **PostgreSQL (Neon)**. Features role-based authentication for both Students and Admins with JWT-based security.



---

## 📋 Table of Contents

- [Features](#-features)
- [Screenshots](#-screenshots)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Installation](#-installation)
- [Environment Variables](#-environment-variables)
- [API Endpoints](#-api-endpoints)
- [Authentication](#-authentication)
- [Database Schema](#-database-schema)
- [Usage Examples](#-usage-examples)

---

## ✨ Features

### 👨‍🎓 Student Features
- ✅ Student registration with course enrollment
- ✅ Secure login with JWT authentication
- ✅ Profile viewing (protected route)
- ✅ Logout functionality with cookie clearing

### 👨‍💼 Admin Features
- ✅ Admin registration and login
- ✅ View all students with course details (JOIN query)
- ✅ Filter students by course code
- ✅ Update student information (dynamic field updates)
- ✅ Delete students with transaction support & row locking

### 🔐 Security Features
- ✅ Password hashing with bcrypt (10 salt rounds)
- ✅ JWT-based authentication (Access & Refresh tokens)
- ✅ HTTP-only cookies for secure token storage
- ✅ Protected routes middleware
- ✅ SQL injection prevention with parameterized queries

---

## 📸 Screenshots

### Home Page
<img width="1910" height="867" alt="Screenshot 2025-12-25 224457" src="https://github.com/user-attachments/assets/b6a39198-1e00-498d-aa14-0fed98c18166" />

### Login Page (Student/Admin Toggle)
<img width="1900" height="861" alt="Screenshot 2025-12-25 224527" src="https://github.com/user-attachments/assets/1994a866-5825-4939-b211-e88894977f10" />


### Admin Dashboard
<img width="1887" height="867" alt="Screenshot 2025-12-25 224628" src="https://github.com/user-attachments/assets/a273cd27-00c1-42b5-995f-41b796448c7a" />


---

## 🛠 Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| Node.js | 22.x | Runtime environment |
| Express.js | 5.2.1 | Web framework |
| PostgreSQL | - | Database (via Neon) |
| pg | 8.16.3 | PostgreSQL client |
| jsonwebtoken | 9.0.3 | JWT authentication |
| bcrypt | 6.0.0 | Password hashing |
| cookie-parser | 1.4.7 | Cookie handling |
| cors | 2.8.5 | Cross-origin requests |
| dotenv | 17.2.3 | Environment variables |
| nodemon | - | Development server |

---

## 📁 Project Structure

```
student-course-management/
├── .env                          # Environment variables
├── package.json                  # Dependencies and scripts
├── README.md                     # Documentation
├── database/
│   └── queries.sql               # All SQL queries
├── screenshots/                  # Application screenshots
│   ├── home.png
│   ├── login.png
│   └── admin-dashboard.png
└── src/
    ├── app.js                    # Express app configuration
    ├── server.js                 # Server entry point
    ├── config/
    │   └── db.js                 # PostgreSQL connection pool
    ├── controllers/
    │   ├── admin.controller.js   # Admin business logic
    │   └── User.controller.js    # Student business logic
    ├── middleware/
    │   └── auth.js               # JWT verification middleware
    ├── routes/
    │   ├── admin.route.js        # Admin API routes
    │   └── user.routes.js        # Student API routes
    └── utils/
        ├── ApiError.js           # Custom error class
        ├── ApiResponse.js        # Standardized API response
        └── asyncHandler.js       # Async error wrapper
```

---

## 🚀 Installation

### Prerequisites
- Node.js (v18 or higher)
- PostgreSQL database (or Neon account)
- npm or yarn

### Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd student-course-management
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   # Create .env file and add your configuration
   cp .env.example .env
   ```

4. **Set up the database**
   - Run the SQL script in `database/queries.sql` to create tables
   - Or use Neon's SQL editor

5. **Run the server**
   ```bash
   # Development mode (with hot reload)
   npm run dev

   # Production mode
   npm start
   ```

6. **Server will start at**
   ```
   http://localhost:3000
   ```

---

## 🔐 Environment Variables

Create a `.env` file in the root directory:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration (Neon PostgreSQL)
DB_URL=postgresql://username:password@host/database?sslmode=require

# CORS Configuration
CORS_ORIGIN=*

# JWT Configuration
ACCESS_TOKEN_SECRET=your_super_secret_access_token_key
ACCESS_TOKEN_EXPIRY=15m
REFRESH_TOKEN_SECRET=your_super_secret_refresh_token_key
REFRESH_TOKEN_EXPIRY=7d
```

---

## 📡 API Endpoints

### Base URL: `http://localhost:3000`

### 👨‍🎓 Student Routes (`/api/v1`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|:-------------:|
| `POST` | `/register/student` | Register a new student | ❌ |
| `POST` | `/login` | Student login | ✅ |
| `POST` | `/logout` | Student logout | ✅ |
| `GET` | `/profile` | Get student profile | ✅ |

### 👨‍💼 Admin Routes (`/api/v1/admin`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|:-------------:|
| `POST` | `/register` | Register a new admin | ❌ |
| `POST` | `/login` | Admin login | ✅ |
| `GET` | `/students` | Get all students with courses | ✅ |
| `POST` | `/subjet/:id` | Get students by course code | ✅ |
| `PATCH` | `/students/:id` | Update student details | ✅ |

---

## 🔒 Authentication

The API uses **JWT (JSON Web Tokens)** for authentication:

### Token Types
| Token | Lifespan | Storage | Purpose |
|-------|----------|---------|---------|
| Access Token | 15 minutes | HTTP-only Cookie | API Authorization |
| Refresh Token | 7 days | HTTP-only Cookie | Token Renewal |

### Authentication Flow

```
1. User Login
   └── POST /api/v1/login
       └── Returns: accesstoken + refreshToken (in cookies)

2. Accessing Protected Routes
   └── Include cookies OR Authorization header
       └── Header: "Authorization: Bearer <accesstoken>"

3. Token Verification
   └── Middleware decodes JWT
       └── Attaches user to req.user
           └── Proceeds to route handler

4. Logout
   └── POST /api/v1/logout
       └── Clears all authentication cookies
```

### Cookie Configuration
```javascript
{
  httpOnly: true,      // Prevents XSS attacks
  secure: true,        // HTTPS only in production
  sameSite: 'strict',  // CSRF protection
  maxAge: ...          // Token-specific expiry
}
```

---

## 🗄 Database Schema

### Entity Relationship Diagram

```
┌─────────────────┐       ┌─────────────────┐
│    students     │       │     courses     │
├─────────────────┤       ├─────────────────┤
│ student_id (PK) │───┐   │ course_id (PK)  │
│ first_name      │   │   │ course_name     │
│ last_name       │   │   │ course_code     │
│ email (UNIQUE)  │   └──►│ course_duration │
│ password        │       └─────────────────┘
│ course_id (FK)  │
└─────────────────┘

┌─────────────────┐       ┌─────────────────┐
│     admin       │       │     users       │
├─────────────────┤       ├─────────────────┤
│ admin_id (PK)   │       │ id (PK)         │
│ admin_username  │       │ username        │
│ password        │       │ email (UNIQUE)  │
└─────────────────┘       │ role            │
                          └─────────────────┘
```

### SQL Table Definitions

See [database/queries.sql](./database/queries.sql) for complete schema and all SQL queries used in the application.

---

## 📝 Usage Examples

### 1. Register a Student

```bash
curl -X POST http://localhost:3000/api/v1/register/student \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "John",
    "last_name": "Doe",
    "email": "john@example.com",
    "password": "password123",
    "course_id": 1
  }'
```

**Response:**
```json
{
  "statusCode": 201,
  "success": true,
  "message": "Student is registerd",
  "data": {}
}
```

### 2. Student Login

```bash
curl -X POST http://localhost:3000/api/v1/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

**Response:**
```json
{
  "statusCode": 200,
  "success": true,
  "message": "user is logged in and jwt cookies are set",
  "data": {
    "student_id": 1,
    "first_name": "John",
    "last_name": "Doe",
    "email": "john@example.com",
    "course_id": 1
  }
}
```

### 3. Get All Students (Admin)

```bash
curl -X GET http://localhost:3000/api/v1/admin/students
```

**Response:**
```json
{
  "count": 5,
  "data": [
    {
      "student_id": 2,
      "first_name": "Rohan",
      "last_name": "rathod",
      "email": "rohan@example.com",
      "course_name": "Full Stack Development",
      "course_code": "CS101",
      "course_duration": 6
    },
    ...
  ]
}
```

### 4. Filter Students by Course

```bash
curl -X POST http://localhost:3000/api/v1/admin/subjet/DS200
```

**Response:**
```json
{
  "success": true,
  "message": "Students registered for course DS200",
  "data": [
    {
      "student_id": 4,
      "first_name": "Amit",
      "last_name": "Patel",
      "email": "amit@example.com",
      "course_id": 2,
      "course_name": "Data Science Fundamentals",
      "course_code": "DS200",
      "course_duration": 4
    }
  ]
}
```

### 5. Update Student

```bash
curl -X PATCH http://localhost:3000/api/v1/admin/students/1 \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "Jane",
    "email": "jane.updated@example.com"
  }'
```

**Response:**
```json
{
  "statusCode": 200,
  "success": true,
  "message": "The student with 1 is updated",
  "data": {
    "first_name": "Jane",
    "last_name": "Doe",
    "email": "jane.updated@example.com",
    "course_id": 1
  }
}
```

---

## 🧪 Error Handling

The API uses a standardized error response format:

```json
{
  "statusCode": 401,
  "success": false,
  "message": "Please provide the username and password",
  "data": null,
  "errors": null
}
```

### Common Error Codes

| Code | Description |
|------|-------------|
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Authentication required |
| 404 | Not Found - Resource doesn't exist |
| 422 | Unprocessable Entity - Validation error |
| 500 | Internal Server Error |

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the **ISC License**.

---

## 👤 Author

**Akash Rathod**

---

## 🙏 Acknowledgments

- [Express.js](https://expressjs.com/)
- [Neon Database](https://neon.tech/)
- [JSON Web Tokens](https://jwt.io/)




