# Full-Stack Learning Management System (LMS) & Assessment Platform

[![FastAPI](https://img.shields.io/badge/FastAPI-0.141+-009688?style=flat&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Next.js](https://img.shields.io/badge/Next.js-16.3+-black?style=flat&logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat&logo=react&logoColor=black)](https://react.dev/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas_/_Motor-47A248?style=flat&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Redux Toolkit](https://img.shields.io/badge/Redux_Toolkit-2.12+-764ABC?style=flat&logo=redux&logoColor=white)](https://redux-toolkit.js.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?style=flat&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)

A production-grade, full-stack Learning Management & Assessment System engineered for high security, seamless user experience, and real-time state synchronization. Built with a high-performance **FastAPI** asynchronous backend, **MongoDB** non-blocking database persistence, and an interactive **Next.js** frontend with **Redux Toolkit** and **Tailwind CSS**.

---

## 📑 Table of Contents

- [Key Features](#-key-features)
- [Prerequisites](#-prerequisites)
- [Step-by-Step Setup Guide](#-step-by-step-setup-guide)
  - [1. Clone the Repository](#1-clone-the-repository)
  - [2. Database Setup (MongoDB Atlas)](#2-database-setup-mongodb-atlas)
  - [3. Backend Setup](#3-backend-setup)
  - [4. Frontend Setup](#4-frontend-setup)
  - [5. One-Click Launch (Windows)](#5-one-click-launch-windows)
- [Application Flow & Walkthrough](#-application-flow--walkthrough)
- [API Reference](#-api-reference)

---

## 🌟 Key Features

* **Strict Anti-Tampering & Security**:
  * **Answer Masking**: Answer keys (`correct_option_index`) are completely stripped on the server before test data is delivered to the browser. Inspection in DevTools reveals zero answer data.
  * **Server-Side Grading**: Score calculations and evaluation are done purely server-side against MongoDB answer keys.
  * **Single-Submission Lock**: Once submitted, session state is permanently marked as completed (`completed: True`). Double submissions are rejected with `400 Bad Request`.
  * **Stateless JWT Security**: Passwords hashed with `bcrypt` (salted); protected routes guarded with HTTP Bearer token verification.
* **Modern Assessment Interface**:
  * Paginated question flow with Prev / Next controls.
  * Quick-jump question navigation palette with visual status badges (Answered / Unanswered).
  * Auto-save responses to local Redux state and sync to backend.
  * Submission confirmation modal preventing accidental early submissions.
* **Onboarding & Track Personalization**:
  * Domain & topic selection saved to user profile.
  * Dynamic exam generation based on selected domain and topic.
* **Instant Scorecard & Feedback**:
  * Real-time percentage calculation, pass/fail grading threshold, and breakdown of correct vs. incorrect answers.

---

## 📋 Prerequisites

Ensure you have the following installed on your machine:

1. **Python**: Version `3.10` or higher (`python --version`)
2. **Node.js**: Version `18.0.0` or higher (`node --version`)
3. **npm**: Version `9.0.0` or higher (`npm --version`)
4. **Git**: Version `2.x` (`git --version`)
5. **MongoDB Database**:
   - A free **MongoDB Atlas** cloud cluster (recommended), OR
   - A locally running MongoDB instance (`mongodb://localhost:27017`)

---

## 🚀 Step-by-Step Setup Guide

### 1. Clone the Repository

```bash
git clone https://github.com/deepak57s/LMS-application.git
cd LMS-application
```

---

### 2. Database Setup (MongoDB Atlas)

If you don't already have a MongoDB Atlas database:

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and sign up for a free account.
2. Create a new free cluster (Shared M0 tier).
3. **Database Access**: Create a Database User with a username and password (e.g., `lms_admin`).
4. **Network Access**: Add IP Address `0.0.0.0/0` (Allow Access from Anywhere) so your local app can connect.
5. **Get Connection String**:
   - Click **Connect** → **Drivers**.
   - Copy the connection string. It looks like:
     ```text
     mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
     ```
   - Append your database name (e.g. `/lms_db`) before the query parameters:
     ```text
     mongodb+srv://lms_admin:YourPassword123@cluster0.xxxxx.mongodb.net/lms_db?retryWrites=true&w=majority
     ```

---

### 3. Backend Setup

Open a terminal and navigate to the `backend` folder:

```bash
cd backend
```

#### Step 3.1: Create and Activate Virtual Environment

* **On Windows (Command Prompt / PowerShell)**:
  ```powershell
  python -m venv venv
  venv\Scripts\activate
  ```
  *(If PowerShell displays a script execution error, run: `Set-ExecutionPolicy -Scope Process -ExecutionPolicy RemoteSigned`)*

* **On macOS / Linux**:
  ```bash
  python3 -m venv venv
  source venv/bin/activate
  ```

#### Step 3.2: Install Dependencies

```bash
pip install -r requirements.txt
```

#### Step 3.3: Configure Environment Variables

Create your `.env` file from the provided template:

* **Windows**:
  ```powershell
  copy .env.example .env
  ```
* **macOS / Linux**:
  ```bash
  cp .env.example .env
  ```

Open `backend/.env` in your text editor and fill in your connection details:

```env
# MongoDB Atlas Connection String
MONGODB_URL=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/lms_db?retryWrites=true&w=majority

# JWT Authentication Secret (Use any random secret string)
JWT_SECRET=super_secret_lms_key_2026_change_me_in_production
```

#### Step 3.4: Seed the Database

Populate your database with default domains (Web Development, Data Science, DevOps), topics, and question banks:

```bash
python seed.py
```

*Expected output:*
```text
Connecting to MongoDB...
Seeding domains and topics...
Seeded 3 domains and 9 topics.
Seeding question bank...
Seeded 27 questions across all topics.
Database seeding completed successfully!
```

#### Step 3.5: Run the Backend Server

```bash
uvicorn main:app --reload --port 8000
```

* **Health Check**: Visit [http://localhost:8000/](http://localhost:8000/)
* **Interactive API Documentation (Swagger UI)**: [http://localhost:8000/docs](http://localhost:8000/docs)
* **Alternative API Documentation (ReDoc)**: [http://localhost:8000/redoc](http://localhost:8000/redoc)

---

### 4. Frontend Setup

Open a **new, separate terminal** and navigate to the `frontend` folder:

```bash
cd frontend
```

#### Step 4.1: Install Node Dependencies

```bash
npm install
```

#### Step 4.2: Configure Environment Variables

Create the `.env.local` configuration file:

* **Windows**:
  ```powershell
  copy .env.example .env.local
  ```
* **macOS / Linux**:
  ```bash
  cp .env.example .env.local
  ```

Ensure `frontend/.env.local` contains:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

#### Step 4.3: Start the Development Server

```bash
npm run dev
```

* The Next.js frontend will launch on **[http://localhost:3000](http://localhost:3000)**.

---

### 5. One-Click Launch (Windows)

If you are on Windows, you can launch both backend and frontend simultaneously with a single double-click or command from the root directory:

```cmd
dev.bat
```

This launches two independent command windows:
1. `FastAPI Backend` on `http://localhost:8000`
2. `Next.js Frontend` on `http://localhost:3000`

---

## 🧭 Application Flow & Walkthrough

1. **Sign Up (`/signup`)**:
   - Register a new account with your name, email, and password.
   - Form inputs are validated in real-time. Upon successful creation, a JWT token is returned and stored securely.
2. **Login (`/login`)**:
   - Authenticate with registered credentials.
   - Invalid credentials trigger clean error feedback.
3. **Onboarding (`/onboarding`)**:
   - First-time users are prompted to choose their primary Learning Track (e.g., *Frontend Engineering*, *Cloud Computing*, *Python & ML*).
   - Preferences are linked directly to your MongoDB user profile.
4. **Dashboard (`/dashboard`)**:
   - View your active track, domain progress, and available test topics.
   - Click **Start Assessment** to initialize a personalized exam session.
5. **Exam Session (`/exam/[sessionId]`)**:
   - Questions are served randomized with stripped answers (anti-cheat).
   - Use navigation buttons (**Previous** / **Next**) or click any question number badge to jump directly.
   - Current progress is reflected in the progress bar.
   - Click **Submit Assessment** and confirm submission in the modal.
6. **Result & Scorecard (`/result/[sessionId]`)**:
   - The server validates all answers against the database answer key.
   - Instant score percentage, pass/fail badge, and correct vs. incorrect breakdown are displayed.
   - Locked session: Reloading or re-submitting prevents duplicate grading.

---

## 🔌 API Reference

### Authentication Endpoints (`/api/auth`)

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/signup` | Register new user account | No |
| `POST` | `/api/auth/login` | Authenticate credentials and retrieve JWT | No |
| `GET` | `/api/auth/me` | Fetch authenticated user profile | Yes (`Bearer`) |

### Catalog Endpoints (`/api/catalog`)

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/catalog/domains` | Fetch all learning domains and topics | No |
| `POST` | `/api/catalog/onboarding` | Save user's selected domain and topic | Yes (`Bearer`) |

### Exam Endpoints (`/api/exam`)

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/exam/start` | Create a new exam session for a topic | Yes (`Bearer`) |
| `GET` | `/api/exam/session/{id}`| Fetch masked exam questions for session | Yes (`Bearer`) |
| `POST` | `/api/exam/submit` | Submit answers and calculate grade | Yes (`Bearer`) |
| `GET` | `/api/exam/result/{id}` | Retrieve finalized scorecard | Yes (`Bearer`) |