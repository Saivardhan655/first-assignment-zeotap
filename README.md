# Rule Engine with AST

## Table of Contents
- [Project Overview](#project-overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Endpoints](#endpoints)
- [How to Run with Docker](#how-to-run-with-docker)
- [How to Test the API](#how-to-test-the-api)
- [Contributing](#contributing)
- [License](#license)

---

## Project Overview

This project implements a **Rule Engine** using an **Abstract Syntax Tree (AST)** to determine user eligibility based on custom rules such as age, department, salary, and experience. The system allows:
- Dynamic creation and modification of rules.
- Combining rules using logical operators (`AND`, `OR`).
- Evaluating rules against real data.
- Persistent rule storage in a MongoDB database.

## Features
- **Create Rule**: Define rules as strings and convert them into an AST.
- **Combine Rules**: Combine multiple ASTs into a single rule using logical operators.
- **Evaluate Rules**: Evaluate rules against user-provided data.
- **Parent AST Management**: Store and update a combined parent AST with multiple rules.
- **MongoDB Integration**: Rules and ASTs are stored in MongoDB for persistence.

## Technology Stack
- **Backend**: Node.js with Express.js
- **Database**: MongoDB (Atlas or local)
- **Languages**: JavaScript, Node.js
- **Libraries**: 
  - `express` for API handling
  - `mongoose` for MongoDB integration
  - `cors` for cross-origin requests
  - `dotenv` for environment variable management
  - `body-parser` for JSON request handling
- **Docker**: Dockerized for easy setup and containerization

---

## Prerequisites
- **Node.js** (v14 or higher)
- **npm** (Node package manager)
- **MongoDB Atlas** or local MongoDB instance
- **Docker** (if you plan to run it with Docker)

---

## Getting Started

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/Saivardhan655/first-assignment-zeotap.git
   cd first-assignment-zeotap
   ```

2. **Install Dependencies**:
   Run the following command to install all necessary packages:
   ```bash
   npm install
   ```

3. **Setup Environment Variables**:
   Create a `.env` file in the project root and configure the following variables:
   ```bash
   MONGO_URI=<your-mongodb-connection-string>
   PORT=5000
   ```

4. **Run the Project**:
   Start the Node.js server:
   ```bash
   npm start
   ```
   The server will run at `http://localhost:5000`.


## Endpoints

1. **POST /create_rule**
   - **Description**: Creates a new rule and returns the corresponding AST.
   - **Request**:
     ```json
     {
       "rule": "(age > 30 AND department = 'Sales') OR (experience > 5 AND salary < 50000)"
     }
     ```
   - **Response**:
     ```json
     {
       "message": "Rule created",
       "ast": { ... },   // Generated AST
       "parentAST": { ... }   // Updated parent AST
     }
     ```

2. **POST /evaluate_rule**
   - **Description**: Evaluates a rule against given data.
   - **Request**:
     ```json
     {
       "data": {
         "age": 35,
         "department": "Sales",
         "salary": 60000,
         "experience": 3
       },
       "ast": { ... }   // The AST you want to evaluate
     }
     ```
   - **Response**:
     ```json
     {
       "eligible": true
     }
     ```

3. **POST /combine_ast**
   - **Description**: Combines multiple ASTs using a specified operator (`AND`, `OR`).
   - **Request**:
     ```json
     {
       "astList": [
         { "type": "operand", "value": "age > 30" },
         { "type": "operand", "value": "salary < 50000" }
       ],
       "operator": "AND"
     }
     ```
   - **Response**:
     ```json
     {
       "combinedAST": { ... }
     }
     ```

4. **GET /parent_ast**
   - **Description**: Fetches the current parent AST (combined AST).
   - **Response**:
     ```json
     {
       "parentAST": { ... }
     }
     ```

---

## How to Run with Docker

1. **Build the Docker Image**:
   ```bash
   docker build -t rule-engine-ast .
   ```

2. **Run the Docker Container**:
   You need to pass environment variables for MongoDB:
   ```bash
   docker run -d -p 5000:5000 --env MONGO_URI=<your-mongodb-connection-string> rule-engine-ast
   ```

3. **Verify the Container**:
   Once the container is running, you can verify it by checking running containers:
   ```bash
   docker ps
   ```

4. **Stopping the Container**:
   If you want to stop the container:
   ```bash
   docker stop <container-id>
   ```

---

## How to Test the API

1. **Postman**:
   You can use **Postman** to test all the endpoints. Here's how you can configure it:
   - **Create a POST request** to `http://localhost:5000/create_rule` with a rule string in the body.
   - **Evaluate Rules** using the `/evaluate_rule` endpoint and JSON data.

2. **cURL**:
   You can also use `curl` to test the API from the command line:
   - Create a rule:
     ```bash
     curl -X POST http://localhost:5000/create_rule -H "Content-Type: application/json" -d '{"rule":"(age > 30 AND department = 'Sales')"}'
     ```
   - Evaluate a rule:
     ```bash
     curl -X POST http://localhost:5000/evaluate_rule -H "Content-Type: application/json" -d '{"data":{"age":35,"department":"Sales"},"ast":{...}}'
     ```

---

## Contributing
If you'd like to contribute, please fork the repository and use a feature branch. Pull requests are welcome.
