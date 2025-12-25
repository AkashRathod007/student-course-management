-- ============================================================
-- STUDENT COURSE MANAGEMENT SYSTEM - SQL QUERIES
-- ============================================================
-- This file contains all SQL queries used in the application
-- Database: PostgreSQL (Neon)
-- Author: Akash Rathod
-- ============================================================


-- ============================================================
-- SECTION 1: DATABASE SCHEMA (Table Creation)
-- ============================================================

-- 1.1 Courses Table
-- Stores course information
CREATE TABLE IF NOT EXISTS courses (
    course_id SERIAL PRIMARY KEY,
    course_name VARCHAR(255) NOT NULL,
    course_code VARCHAR(50) UNIQUE NOT NULL,
    course_duration INTEGER -- Duration in months
);

-- 1.2 Students Table
-- Stores student information with foreign key to courses
CREATE TABLE IF NOT EXISTS students (
    student_id SERIAL PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    course_id INTEGER REFERENCES courses(course_id) ON DELETE SET NULL
);

-- 1.3 Admin Table
-- Stores admin credentials
CREATE TABLE IF NOT EXISTS admin (
    admin_id SERIAL PRIMARY KEY,
    admin_username VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL
);

-- 1.4 Users Table (for JWT middleware verification)
-- General users table for authentication
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100),
    email VARCHAR(255) UNIQUE,
    role VARCHAR(50) DEFAULT 'student'
);


-- ============================================================
-- SECTION 2: STUDENT CONTROLLER QUERIES
-- File: src/controllers/User.controller.js
-- ============================================================

-- 2.1 Register Student
-- Function: regiseterstudent()
-- Inserts a new student with hashed password
INSERT INTO students (first_name, last_name, email, password, course_id) 
VALUES ($1, $2, $3, $4, $5);

-- Example with actual values:
-- INSERT INTO students (first_name, last_name, email, password, course_id) 
-- VALUES ('John', 'Doe', 'john@example.com', '$2b$10$hashedpassword...', 1);


-- 2.2 Student Login - Find by Email
-- Function: studnetLogin()
-- Retrieves student by email for password verification
SELECT * FROM students WHERE email = $1;

-- Example:
-- SELECT * FROM students WHERE email = 'john@example.com';


-- ============================================================
-- SECTION 3: ADMIN CONTROLLER QUERIES
-- File: src/controllers/admin.controller.js
-- ============================================================

-- 3.1 Register Admin
-- Function: adminRegisteration()
-- Inserts a new admin with hashed password
INSERT INTO admin (admin_username, password) 
VALUES ($1, $2);

-- Example:
-- INSERT INTO admin (admin_username, password) 
-- VALUES ('admin1', '$2b$10$hashedpassword...');


-- 3.2 Admin Login - Find by Username
-- Function: loginadmin()
-- Retrieves admin credentials for verification
SELECT admin_username, password 
FROM admin 
WHERE admin_username = $1;

-- Example:
-- SELECT admin_username, password FROM admin WHERE admin_username = 'admin1';


-- 3.3 Get All Students with Course Details (LEFT JOIN)
-- Function: studentwithcoursedetails()
-- Retrieves all students with their enrolled course information
-- Uses LEFT JOIN to include students without courses
SELECT 
    s.student_id,
    s.first_name,
    s.last_name,
    s.email,
    c.course_name,
    c.course_code,
    c.course_duration
FROM students s
LEFT JOIN courses c ON s.course_id = c.course_id
ORDER BY s.student_id ASC;


-- 3.4 Get Students by Course Code (INNER JOIN)
-- Function: getStudentsByCourse()
-- Filters students by specific course code
-- Uses INNER JOIN to only get students enrolled in courses
SELECT 
    s.student_id,
    s.first_name,
    s.last_name,
    s.email,
    c.course_id,
    c.course_name,
    c.course_code,
    c.course_duration
FROM students s
JOIN courses c ON s.course_id = c.course_id
WHERE c.course_code = $1;

-- Example:
-- SELECT s.student_id, s.first_name, s.last_name, s.email, 
--        c.course_id, c.course_name, c.course_code, c.course_duration
-- FROM students s
-- JOIN courses c ON s.course_id = c.course_id
-- WHERE c.course_code = 'CS101';


-- 3.5 Update Student Details (Dynamic Query)
-- Function: updateStudentDeatils()
-- Dynamically updates student fields based on request body
-- Allowed fields: first_name, last_name, email, course_id

-- Single field update example:
UPDATE students
SET first_name = $1
WHERE student_id = $2
RETURNING first_name, last_name, email, course_id;

-- Multiple fields update example:
UPDATE students
SET first_name = $1, last_name = $2, email = $3
WHERE student_id = $4
RETURNING first_name, last_name, email, course_id;

-- Full update example:
UPDATE students
SET first_name = $1, last_name = $2, email = $3, course_id = $4
WHERE student_id = $5
RETURNING first_name, last_name, email, course_id;


-- 3.6 Delete Student with Transaction and Row Locking
-- Function: deleteStudent()
-- Uses transaction with FOR UPDATE lock for safe deletion

-- Step 1: Begin Transaction
BEGIN;

-- Step 2: Find and LOCK the student row
-- FOR UPDATE prevents other transactions from modifying this row
SELECT student_id, first_name, course_id 
FROM students 
WHERE student_id = $1 
FOR UPDATE;

-- Step 3: Delete the student
DELETE FROM students WHERE student_id = $1;

-- Step 4: Commit Transaction (if successful)
COMMIT;

-- Step 5: Rollback (if error occurs)
ROLLBACK;


-- ============================================================
-- SECTION 4: AUTH MIDDLEWARE QUERIES
-- File: src/middleware/auth.js
-- ============================================================

-- 4.1 Verify JWT - Find User by ID
-- Function: verifyJWt()
-- Retrieves user information for JWT token verification
SELECT id, username, email, role
FROM users
WHERE id = $1;

-- Example:
-- SELECT id, username, email, role FROM users WHERE id = 1;


-- ============================================================
-- SECTION 5: SAMPLE DATA
-- ============================================================

-- 5.1 Insert Sample Courses
INSERT INTO courses (course_name, course_code, course_duration) VALUES
('Full Stack Development', 'CS101', 6),
('Data Science Fundamentals', 'DS200', 4),
('Machine Learning', 'ML300', 8),
('Cloud Computing', 'CC400', 5),
('Cyber Security', 'CY500', 6);

-- 5.2 Insert Sample Students (password: 'password123' hashed)
-- Note: Use bcrypt to hash passwords in production
INSERT INTO students (first_name, last_name, email, password, course_id) VALUES
('Rohan', 'Rathod', 'rohan@example.com', '$2b$10$examplehash1...', 1),
('Priya', 'Verma', 'priya@example.com', '$2b$10$examplehash2...', 1),
('Amit', 'Patel', 'amit@example.com', '$2b$10$examplehash3...', 2),
('John', 'Doe', 'john.doe@example.com', '$2b$10$examplehash4...', 2),
('Akash', 'Rathod', 'akashratho1110@gmail.com', '$2b$10$examplehash5...', 2);

-- 5.3 Insert Sample Admin
INSERT INTO admin (admin_username, password) VALUES
('admin', '$2b$10$adminhashedpassword...');


-- ============================================================
-- SECTION 6: USEFUL QUERIES FOR TESTING
-- ============================================================

-- 6.1 View all students with courses
SELECT 
    s.student_id,
    s.first_name || ' ' || s.last_name AS full_name,
    s.email,
    COALESCE(c.course_name, 'Not Enrolled') AS course,
    c.course_code
FROM students s
LEFT JOIN courses c ON s.course_id = c.course_id
ORDER BY s.student_id;

-- 6.2 Count students per course
SELECT 
    c.course_name,
    c.course_code,
    COUNT(s.student_id) AS student_count
FROM courses c
LEFT JOIN students s ON c.course_id = s.course_id
GROUP BY c.course_id, c.course_name, c.course_code
ORDER BY student_count DESC;

-- 6.3 Find students not enrolled in any course
SELECT student_id, first_name, last_name, email
FROM students
WHERE course_id IS NULL;

-- 6.4 Get course with most students
SELECT 
    c.course_name,
    c.course_code,
    COUNT(s.student_id) AS enrollment_count
FROM courses c
JOIN students s ON c.course_id = s.course_id
GROUP BY c.course_id, c.course_name, c.course_code
ORDER BY enrollment_count DESC
LIMIT 1;


-- ============================================================
-- SECTION 7: INDEX RECOMMENDATIONS (Performance)
-- ============================================================

-- Index on students email for faster login lookups
CREATE INDEX IF NOT EXISTS idx_students_email ON students(email);

-- Index on students course_id for faster JOIN operations
CREATE INDEX IF NOT EXISTS idx_students_course_id ON students(course_id);

-- Index on admin username for faster login lookups
CREATE INDEX IF NOT EXISTS idx_admin_username ON admin(admin_username);

-- Index on courses course_code for faster filtering
CREATE INDEX IF NOT EXISTS idx_courses_code ON courses(course_code);

-- Index on users id and email for auth middleware
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);


-- ============================================================
-- SECTION 8: CLEANUP QUERIES (Development/Testing)
-- ============================================================

-- Drop all tables (use with caution!)
-- DROP TABLE IF EXISTS students CASCADE;
-- DROP TABLE IF EXISTS courses CASCADE;
-- DROP TABLE IF EXISTS admin CASCADE;
-- DROP TABLE IF EXISTS users CASCADE;

-- Truncate tables (remove all data but keep structure)
-- TRUNCATE TABLE students RESTART IDENTITY CASCADE;
-- TRUNCATE TABLE courses RESTART IDENTITY CASCADE;
-- TRUNCATE TABLE admin RESTART IDENTITY CASCADE;
-- TRUNCATE TABLE users RESTART IDENTITY CASCADE;


-- ============================================================
-- END OF SQL QUERIES FILE
-- ============================================================
