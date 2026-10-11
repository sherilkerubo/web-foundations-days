# Library Books REST API Specification

This document details the RESTful API design for managing book resources in the Library system.

## REST Endpoints

### 1. List All Books
* **Method:** `GET`
* **Path:** `/api/v1/books`
* **Description:** Retrieves a list of all books available in the library collection.
* **Success Status Code:** `200 OK`

### 2. List Books by Author
* **Method:** `GET`
* **Path:** `/api/v1/books?author=George+Orwell`
* **Description:** Retrieves a filtered list of books written by a specific author using a query parameter.
* **Success Status Code:** `200 OK`

### 3. Get One Book
* **Method:** `GET`
* **Path:** `/api/v1/books/:id`
* **Description:** Fetches detailed information for a single book identified by its unique ID.
* **Success Status Code:** `200 OK`

### 4. Create a Book
* **Method:** `POST`
* **Path:** `/api/v1/books`
* **Description:** Adds a new book entry to the library.
* **Request Body Example:**
  ```json
  {
    "title": "1984",
    "author": "George Orwell",
    "isbn": "9780451524935",
    "publishedYear": 1949,
    "copies": 5
  }