# 📋 Smart Task Prioritization System (TaskFlow)

TaskFlow is a Full-Stack Intelligent Team Task Management System built with **Next.js 16 (App Router)**. It helps teams organize, assign, and track tasks while dynamically computing a **SmartScore** (0–90) to spotlight the absolute highest priority item to work on next.

Backed by **MongoDB Atlas**, TaskFlow integrates secure user authentication, role-based page protection, activity auditing, and workload metrics.

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 16 (App Router) |
| **UI Library** | React 19 + TypeScript |
| **Database** | MongoDB Atlas / Official MongoDB Node Driver |
| **Styling** | Tailwind CSS v4 (via PostCSS) |
| **State Manager** | Zustand |
| **Date Utilities** | date-fns |
| **Theme** | next-themes (Light / Dark modes) |
| **Security** | `bcryptjs` password hashing & `jose` Edge-compatible JWT |

---

## 🚀 Key Features

*   **Intelligent Prioritization (SmartScore)**: Dynamically ranks tasks based on priority, deadline proximity, and estimated hours (never stale, computed live on request).
*   **Role-Based Access Control (RBAC)**: Protects routes and sidebars using JWT-verified sessions in Next.js middleware.
    *   `ADMIN` users have full access to create/assign tasks, manage team member workloads, and inspect analytics.
    *   `EMPLOYEE` users have read-only task views and dashboard spotlights.
*   **Team Workload Management**: Monitors workload levels (`LOW`, `MEDIUM`, `HIGH`) and displays workload distribution progress bars.
*   **Deadline Warnings**: Highlights overdue tasks (🔴) and tasks due within 48 hours (🟠).
*   **Action Auditing**: Logs CRUD events (Task Creation, Assignee Changes, Status Moves) into an `activities` collection.

---

## 🔢 SmartScore Calculation Formula

TaskFlow dynamically scores active tasks using the following matrix:

| Metric | Condition | Score Weight |
|---|---|---|
| **Priority** | `HIGH` | **+40** |
| | `MEDIUM` | **+25** |
| | `LOW` | **+10** |
| **Deadline Urgency** | Overdue or Due Today (≤ 0 days) | **+40** |
| | Due in 1–2 days | **+30** |
| | Due in 3–7 days | **+15** |
| | Due in 8+ days | **+0** |
| **Quick Win Bonus** | Estimated Hours ≤ 2 hours | **+10** |

**Max Score Potential: 90** (High Priority + Overdue + ≤ 2 hrs)

---

## 🔌 API Reference

### Auth Endpoints
*   `POST /api/auth/login` - Validates email/password, signs session token, sets secure cookie.
*   `POST /api/auth/register` - Creates a new user profile with a hashed password.
*   `POST /api/auth/logout` - Deletes session cookie.
*   `GET /api/auth/me` - Verifies session and returns logged-in user profile.

### Operations Endpoints
*   `GET /api/tasks` & `POST /api/tasks` - Manage tasks collection.
*   `PATCH /api/tasks/[id]` & `DELETE /api/tasks/[id]` - Edit/Delete individual tasks.
*   `GET /api/employees` & `POST /api/employees` - Manage employee records & active task counts.
*   `GET /api/activities` - Exposes audited system activities.
*   `GET /api/seed` - Seeds database with user accounts and initial task models.
*   `GET /api/debug` - Exposes database connection diagnostics.

---

## 🔑 Initial Setup & Seeding

### 1. Configure Environment Variables
Create a [`.env.local`](file:///D:/Smart%20Task%20Prioritization%20System/.env.local) file in the root directory:

```env
MONGODB_URI=mongodb+srv://tarun:M30PWi1NGUc69kpD@cluster0.x6g6ncr.mongodb.net/taskflow?retryWrites=true&w=majority
MONGODB_DB=taskflow
AUTH_SECRET=9f83ea647ef3a3d24266187b8d728e83b4b8893d59e4b6a839f8641bc389f81d
```

### 2. Install & Start Development Server
```bash
npm install
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)**.

### 3. Seed Database
Initialize user sessions and tasks by visiting the seed API in your browser:
👉 **[http://localhost:3000/api/seed](http://localhost:3000/api/seed)**

### 4. Evaluator Login Accounts

| Account Role | Email Address | Password |
|---|---|---|
| **Administrator** | `admin@taskflow.com` | `adminpassword` |
| **Employee** | `employee@taskflow.com` | `employeepassword` |
