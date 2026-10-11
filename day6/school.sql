-- Disable foreign key constraints during table cleanup
PRAGMA foreign_keys = ON;

DROP TABLE IF EXISTS enrolments;
DROP TABLE IF EXISTS courses;
DROP TABLE IF EXISTS students;

-- Table: students
CREATE TABLE students (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Table: courses
CREATE TABLE courses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    code TEXT NOT NULL UNIQUE
);

-- Table: enrolments (Join Table)
CREATE TABLE enrolments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER NOT NULL,
    course_id INTEGER NOT NULL,
    grade TEXT,
    enrolled_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    UNIQUE (student_id, course_id) -- Prevents duplicate enrolments
);

-- Sample Data: Insert Students
INSERT INTO students (name, email) VALUES
('Grace Hopper', 'grace.hopper@example.com'),
('Ada Lovelace', 'ada.lovelace@example.com'),
('Alan Turing', 'alan.turing@example.com'),
('Katherine Johnson', 'katherine.johnson@example.com'); -- Student with no enrolments

-- Sample Data: Insert Courses
INSERT INTO courses (title, code) VALUES
('Web Foundations', 'CS101'),
('Database Systems', 'CS201'),
('Algorithms & Data Structures', 'CS301');

-- Sample Data: Insert Enrolments
INSERT INTO enrolments (student_id, course_id, grade) VALUES
(1, 1, 'A'), -- Grace in Web Foundations
(1, 2, 'B'), -- Grace in Database Systems
(2, 1, 'A'), -- Ada in Web Foundations
(2, 3, 'A+'),-- Ada in Algorithms
(3, 2, 'C'); -- Alan in Database Systems


-- ============================================================================
-- REQUIRED QUERIES
-- ============================================================================

-- Query 1: All courses for one student (by name)
SELECT c.title, c.code, e.grade
FROM courses c
JOIN enrolments e ON c.id = e.course_id
JOIN students s ON s.id = e.student_id
WHERE s.name = 'Grace Hopper';

-- Query 2: All students on one course (by course title)
SELECT s.name, s.email, e.grade
FROM students s
JOIN enrolments e ON s.id = e.student_id
JOIN courses c ON c.id = e.course_id
WHERE c.title = 'Web Foundations';

-- Query 3: The number of students per course
SELECT c.title, COUNT(e.student_id) AS student_count
FROM courses c
LEFT JOIN enrolments e ON c.id = e.course_id
GROUP BY c.id, c.title;

-- Query 4: Students who have no enrolments
SELECT s.id, s.name, s.email
FROM students s
LEFT JOIN enrolments e ON s.id = e.student_id
WHERE e.id IS NULL;

-- Query 5: Update one enrolment's grade
UPDATE enrolments
SET grade = 'A+'
WHERE student_id = (SELECT id FROM students WHERE name = 'Grace Hopper')
  AND course_id = (SELECT id FROM courses WHERE code = 'CS201');
  