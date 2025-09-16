# FounderFit Backend

This is the backend service for the FounderFit application.  
It provides APIs for user authentication, business idea evaluation, and progress tracking in the 28-day challenge.

---

## 🚀 Tech Stack

- Node.js + Express
- MySQL
- JWT Authentication

---

## 📦 Installation

1. Clone this repository:
   ```bash
   git clone https://github.com/EMMATECH25/founderfit-backend.git
   cd founderfit-backend
   ```

Install dependencies:

npm install

Create a .env file in the root folder using the .env.example as reference:

cp .env.example .env

Fill in the actual values for your database and JWT secret inside .env.

🗄️ Database Setup

Run this schema in your MySQL server:

-- Users Table
CREATE TABLE IF NOT EXISTS users (
id INT AUTO_INCREMENT PRIMARY KEY,
name VARCHAR(100),
email VARCHAR(100) UNIQUE,
password VARCHAR(255),
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Day2 Responses
CREATE TABLE IF NOT EXISTS day2_responses (
id INT AUTO_INCREMENT PRIMARY KEY,
user_id INT NOT NULL,
selection_criteria JSON NOT NULL,
location VARCHAR(100),
scalability VARCHAR(100),
risk_tolerance VARCHAR(100),
time_commitment VARCHAR(100),
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Day3 Responses
CREATE TABLE IF NOT EXISTS day3_responses (
id INT AUTO_INCREMENT PRIMARY KEY,
user_id INT NOT NULL,
ideas JSON NOT NULL,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

▶️ Running the server

Development:

npm run dev

Production:

npm start

The server runs on http://localhost:10000 (or the PORT specified in .env).

🔑 API Endpoints

Auth

POST /api/auth/register

POST /api/auth/login

Day 2

POST /api/day2/save

GET /api/day2/get

Day 3

POST /api/day3/save

GET /api/day3/get

📤 Deployment

To deploy on any hosting service:

Upload this code or pull directly from GitHub.

Configure environment variables from .env.example.

Set up a MySQL database and run the schema.

Start the app with:

npm start

👨‍💻 Author

Developed by Emmanuel (Backend Engineer)

---
