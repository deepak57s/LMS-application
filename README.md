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
- [Architecture & Tech Stack](#-architecture--tech-stack)
- [Repository Structure](#-repository-structure)
- [Prerequisites](#-prerequisites)
- [Step-by-Step Setup Guide](#-step-by-step-setup-guide)
  - [1. Clone the Repository](#1-clone-the-repository)
  - [2. Database Setup (MongoDB Atlas)](#2-database-setup-mongodb-atlas)
  - [3. Backend Setup](#3-backend-setup)
  - [4. Frontend Setup](#4-frontend-setup)
  - [5. One-Click Launch (Windows)](#5-one-click-launch-windows)
- [Application Flow & Walkthrough](#-application-flow--walkthrough)
- [Security & Anti-Tamper Mechanisms](#-security--anti-tamper-mechanisms)
- [API Reference](#-api-reference)
- [Troubleshooting & FAQ](#-troubleshooting--faq)
- [Pushing to GitHub](#-pushing-to-github)

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

## 🛠 Architecture & Tech Stack

```mermaid
graph LR
    subgraph Browser ["Frontend (Next.js 16 + Redux Toolkit)"]
        UI[Tailwind CSS UI]
        Redux[RTK Store / Slices]
        APIClient[RTK Query / Fetch]
        UI --> Redux
        Redux --> APIClient
    end

    subgraph Server ["Backend (FastAPI)"]
        CORS[CORS / Middleware]
        AuthRouter["/api/auth (JWT + Bcrypt)"]
        CatalogRouter["/api/catalog (Domains / Topics)"]
        ExamRouter["/api/exam (Sessions / Grading)"]
        CORS --> AuthRouter
        CORS --> CatalogRouter
        CORS --> ExamRouter
    end

    subgraph Storage ["Database (MongoDB Atlas)"]
        Users[(Users Collection)]
        Domains[(Domains & Topics)]
        Questions[(Questions Bank)]
        Sessions[(Exam Sessions)]
    end

    APIClient -- "REST + Bearer Token" --> CORS
    AuthRouter <--> Users
    CatalogRouter <--> Domains
    ExamRouter <--> Questions
    ExamRouter <--> Sessions
```

### Technologies

* **Backend**:
  * **Language**: Python 3.10+
  * **Framework**: [FastAPI](https://fastapi.tiangolo.com/) (Async ASGI)
  * **Server**: [Uvicorn](https://www.uvicorn.org/) (High-performance ASGI server)
  * **Driver**: [Motor](https://motor.readthedocs.io/) (Async MongoDB driver on top of PyMongo)
  * **Validation**: [Pydantic v2](https://docs.pydantic.dev/) & [pydantic-settings](https://docs.pydantic.dev/latest/concepts/pydantic_settings/)
  * **Auth & Security**: [python-jose](https://pypi.org/project/python-jose/) (JWT encoding/decoding) & [bcrypt](https://pypi.org/project/bcrypt/)
* **Frontend**:
  * **Framework**: [Next.js 16](https://nextjs.org/) (App Router, React 19)
  * **Language**: TypeScript
  * **State Management**: [Redux Toolkit](https://redux-toolkit.js.org/) (`@reduxjs/toolkit` & `react-redux`)
  * **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)

---

## 📁 Repository Structure

```text
lms/
├── backend/
│   ├── routes/
│   │   ├── __init__.py
│   │   ├── auth_routes.py      # Registration, login, profile endpoints
│   │   ├── catalog_routes.py   # Domains, topics, onboarding endpoints
│   │   └── exam_routes.py      # Session creation, question delivery, grading
│   ├── auth.py                 # JWT token creation/verification, password hashing
│   ├── config.py               # Pydantic Settings and environment management
│   ├── database.py             # Motor async MongoDB client & collections
│   ├── main.py                 # FastAPI application factory, CORS, exception handlers
│   ├── models.py               # Pydantic models for validation and responses
│   ├── requirements.txt        # Backend Python dependencies
│   ├── seed.py                 # Database seeder (domains, topics, 20+ questions)
│   ├── test_api.py             # End-to-end automated API verification suite
│   ├── .env.example            # Backend environment template
│   └── .env                    # Active backend environment (git-ignored)
├── frontend/
│   ├── public/                 # Static assets and icons
│   ├── src/
│   │   ├── app/
│   │   │   ├── dashboard/      # Learner dashboard page
│   │   │   ├── exam/[sessionId]/# Interactive assessment screen
│   │   │   ├── login/          # User login page
│   │   │   ├── onboarding/     # Domain/Topic selection page
│   │   │   ├── result/[sessionId]/ # Scorecard and result page
│   │   │   ├── signup/         # Account registration page
│   │   │   ├── globals.css     # Global styles & Tailwind directives
│   │   │   ├── layout.tsx      # Root layout with StoreProvider & Navbar
│   │   │   └── page.tsx        # Landing hero page
│   │   ├── components/
│   │   │   ├── AuthGuard.tsx   # Client route protection component
│   │   │   ├── Navbar.tsx      # Top navigation with user status & logout
│   │   │   └── StoreProvider.tsx# Redux Provider wrapper
│   │   ├── store/
│   │   │   ├── slices/         # authSlice, examSlice
│   │   │   ├── apiSlice.ts     # RTK Query API definition
│   │   │   └── index.ts        # Redux store configuration
│   │   └── types/              # TypeScript interfaces and models
│   ├── package.json            # Node.js dependencies and scripts
│   ├── tsconfig.json           # TypeScript configuration
│   ├── next.config.ts          # Next.js configuration
│   ├── .env.example            # Frontend environment template
│   └── .env.local              # Active frontend environment (git-ignored)
├── .gitignore                  # Git ignore rules for Python, Node, OS, and Secrets
├── dev.bat                     # Windows one-click dual-server launcher
└── README.md                   # Complete documentation
```

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
git clone https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git
cd lms
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

## 🛡️ Security & Anti-Tamper Mechanisms

| Security Feature | Implementation Mechanism | Benefit |
| :--- | :--- | :--- |
| **Answer Masking** | Pydantic response filters exclude `correct_option_index` on `/api/exam/session` | Inspecting network payloads or React state reveals zero answers. |
| **Server-Side Grading** | Submission endpoint queries DB answer key directly by ObjectId | Users cannot spoof score calculations in the browser. |
| **Session Locking** | Sessions transition to `completed = True` upon first grading | Retrying or replaying requests returns `400 Bad Request`. |
| **JWT Authorization** | PyJWT with expiration and signature verification | Protected endpoints require valid `Bearer <token>` headers. |
| **Password Hashing** | Salting and hashing via `bcrypt` | Plaintext passwords are never stored or logged. |

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

---

## ❓ Troubleshooting & FAQ

### 1. MongoDB Connection Error: `ServerSelectionTimeoutError`
* **Cause**: Your IP address is not whitelisted in MongoDB Atlas or connection string credentials are wrong.
* **Fix**: In MongoDB Atlas, go to **Network Access** → Click **Add IP Address** → Choose **Allow Access from Anywhere (`0.0.0.0/0`)**. Double check that your password does not contain unescaped special characters.

### 2. PowerShell Script Execution Disabled (`venv\Scripts\activate`)
* **Error**: `File ... activate.ps1 cannot be loaded because running scripts is disabled on this system.`
* **Fix**: Open PowerShell as Administrator or run in your current terminal:
  ```powershell
  Set-ExecutionPolicy -Scope Process -ExecutionPolicy RemoteSigned
  ```
  Then re-run `venv\Scripts\activate`.

### 3. Port 8000 or Port 3000 Already in Use
* **Fix**:
  * For Backend: Run on an alternate port: `uvicorn main:app --reload --port 8001` (update `NEXT_PUBLIC_API_URL` in `frontend/.env.local`).
  * For Frontend: Next.js will automatically prompt to run on port `3001` if `3000` is busy.

### 4. Running Backend Automated Tests
To run the automated API verification test suite:
```bash
cd backend
venv\Scripts\activate   # or source venv/bin/activate
python test_api.py
```

---

## 📤 Pushing to GitHub

Follow these steps to submit this repository to GitHub:

### Step 1: Create a New Repository on GitHub
1. Log in to [GitHub](https://github.com/).
2. In the upper-right corner, click **+** and select **New repository**.
3. Name your repository (e.g., `lms-platform`).
4. Keep it **Public** (or **Private** based on your submission requirements).
5. **Do NOT** check "Initialize this repository with a README, .gitignore, or license" (we already have them configured).
6. Click **Create repository**.
7. Copy the repository URL (e.g. `https://github.com/YOUR_USERNAME/lms-platform.git`).

### Step 2: Initialize Git and Commit Your Code
Open your terminal in the root `lms` directory:

```bash
# 1. Initialize git (if not already done)
git init

# 2. Stage all project files
git add .

# 3. Create your initial commit
git commit -m "feat: complete full-stack LMS and assessment platform"
```

### Step 3: Link Remote and Push
Replace `YOUR_USERNAME` and `lms-platform` with your actual GitHub username and repository name:

```bash
# 4. Set default branch to main
git branch -M main

# 5. Add remote GitHub origin
git remote add origin https://github.com/YOUR_USERNAME/lms-platform.git

# 6. Push code to GitHub
git push -u origin main
```

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).