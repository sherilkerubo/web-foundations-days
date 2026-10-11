# School Database Schema & Architectural Design

This document details the database structure, entity relationships, indexing strategy, and database model justification for the School Management System.

## Table Explanations

1. **`students`**: Stores core profile information for enrolled students, including unique identifiers, full names, and unique email addresses.
2. **`courses`**: Holds details about available academic modules, including course titles and unique course codes.
3. **`enrolments`**: Serves as a junction/join table linking students to courses. It tracks the relationship between a specific student and a specific course while holding attributes unique to that relationship, such as the awarded `grade` and enrollment timestamp.

## Entity Relationships

- **Student to Enrolment (1:N)**: One student can have multiple enrollment records, but each enrollment record belongs to exactly one student.
- **Course to Enrolment (1:N)**: One course can contain multiple enrollment records, but each enrollment record belongs to exactly one course.
- **Student to Course (M:N)**: The relationship between students and courses is **many-to-many**. A single student can enroll in multiple courses, and a single course can be taken by multiple students.

### Why a Join Table is Needed
Relational databases cannot directly express a many-to-many relationship without creating massive data redundancy or violating normal form rules (such as storing arrays/lists inside a single cell). The `enrolments` join table decomposes the M:N relationship into two 1:N relationships (`students` $\rightarrow$ `enrolments` and `courses` $\rightarrow$ `enrolments`), maintaining data integrity and allowing attributes like `grade` to be stored accurately for each specific pairing.

## Indexing Strategy

```sql
CREATE INDEX idx_enrolments_student_id ON enrolments(student_id);