# 📋 Smart Task Prioritization System (TaskFlow)

## 🏗️ Project Overview

**TaskFlow** is a Full-Stack Intelligent Team Task Management System built with **Next.js 16**. It helps teams create, organize, assign, and track tasks efficiently.

The main feature of TaskFlow is its **SmartScore algorithm**, which automatically evaluates tasks based on **priority, deadline urgency, and estimated effort** and recommends the most important task to work on next.

The application uses **MongoDB Atlas** for persistent data storage and includes **secure authentication, role-based access control, task assignment, workload management, analytics, and activity tracking**.

---

# ✨ Key Features

* 🧠 **Smart Task Prioritization** using the SmartScore algorithm
* 📋 Create, edit, delete, and manage tasks
* 👥 Employee and team management
* 🔄 Assign and reassign tasks to team members
* 🔐 Secure Login and Authentication
* 👑 Role-Based Access Control (Administrator and Employee)
* 📊 Analytics dashboard for administrators
* ⚠️ Deadline and overdue task alerts
* 📈 Team workload monitoring
* 📝 Activity history and task auditing
* 🌙 Light and Dark mode
* 🗄️ Persistent cloud database using MongoDB Atlas

---

# 🛠️ Technology Stack

| Layer                 | Technology                      |
| --------------------- | ------------------------------- |
| **Framework**         | Next.js 16 (App Router)         |
| **UI Library**        | React 19                        |
| **Language**          | TypeScript                      |
| **Database**          | MongoDB Atlas                   |
| **Database Driver**   | Official MongoDB Node.js Driver |
| **Styling**           | Tailwind CSS v4                 |
| **State Management**  | Zustand                         |
| **Date Utilities**    | date-fns                        |
| **Theme**             | next-themes                     |
| **Authentication**    | JWT-based Authentication        |
| **Password Security** | bcryptjs                        |
| **Icons**             | Lucide React                    |

---

# 🧠 SmartScore Algorithm

TaskFlow calculates a **SmartScore between 0 and 90** for every active task.

The score is calculated dynamically, so task urgency automatically changes as deadlines get closer.

## Scoring Rules

| Factor               | Condition           | Points |
| -------------------- | ------------------- | -----: |
| **Priority**         | HIGH                |    +40 |
|                      | MEDIUM              |    +25 |
|                      | LOW                 |    +10 |
| **Deadline Urgency** | Overdue / Due Today |    +40 |
|                      | Due in 1–2 days     |    +30 |
|                      | Due in 3–7 days     |    +15 |
|                      | Due in 8+ days      |     +0 |
| **Quick Win Bonus**  | Estimated Hours ≤ 2 |    +10 |

### Maximum SmartScore: **90**

> A HIGH priority task that is overdue or due today and can be completed within two hours receives the maximum SmartScore.

### 🎯 Smart Recommendation

The system automatically finds the non-completed task with the highest SmartScore and displays it as the **Recommended Task** on the dashboard.

---

# 🔐 Authentication System

TaskFlow includes a secure user authentication system.

## Authentication Features

* User Registration
* User Login
* User Logout
* Password Hashing using `bcryptjs`
* JWT-based session management
* Protected application routes
* Role-based authorization
* Secure session cookies

## Authentication API

| Endpoint             | Method | Description                                |
| -------------------- | ------ | ------------------------------------------ |
| `/api/auth/register` | POST   | Creates a new user account                 |
| `/api/auth/login`    | POST   | Authenticates a user and creates a session |
| `/api/auth/logout`   | POST   | Logs out the current user                  |
| `/api/auth/me`       | GET    | Returns the currently logged-in user       |

---

# 👑 Role-Based Access Control (RBAC)

TaskFlow has two user roles:

1. **Administrator**
2. **Employee**

Both roles can actively collaborate and manage tasks. Administrative features and sensitive business information are restricted to Administrators.

## 👑 Administrator Permissions

Administrators have complete access to the system:

* ✅ View all tasks
* ✅ Create, edit, and delete tasks
* ✅ Change task status, priority, deadline, and description
* ✅ Assign and reassign tasks
* ✅ View the dashboard
* ✅ Manage employees and users
* ✅ View analytics and workload metrics
* ✅ View activity history
* ✅ Promote an Employee to Administrator

## 👨‍💻 Employee Permissions

Employees can actively collaborate on task management:

* ✅ View tasks
* ✅ Create, edit, and delete tasks
* ✅ Update task status, priority, deadline, and description
* ✅ **Assign and reassign tasks to team members**
* ✅ View the dashboard
* ❌ Cannot manage employee/user accounts
* ❌ Cannot access analytics
* ❌ Cannot promote another user to Administrator
* ❌ Cannot change user roles

## 📊 Permission Matrix

| Feature                    | Administrator | Employee |
| -------------------------- | :-----------: | :------: |
| View Tasks                 |       ✅       |     ✅    |
| Create Tasks               |       ✅       |     ✅    |
| Edit Tasks                 |       ✅       |     ✅    |
| Delete Tasks               |       ✅       |     ✅    |
| Update Task Status         |       ✅       |     ✅    |
| Change Priority & Deadline |       ✅       |     ✅    |
| **Assign/Reassign Tasks**  |       ✅       |     ✅    |
| View Dashboard             |       ✅       |     ✅    |
| Manage Employees/Users     |       ✅       |     ❌    |
| View Analytics             |       ✅       |     ❌    |
| View Activity History      |       ✅       |     ❌    |
| Promote Employee to Admin  |       ✅       |     ❌    |

### 🔑 Important Role Rule

> **Only an existing Administrator can promote an Employee to Administrator. Employees cannot change their own role or promote other users.**

---

# 👥 Team and Employee Management

Administrators can manage team members and their information.

Employee profiles can contain:

* Full Name
* Email Address
* Role
* Department

The system calculates the number of active tasks assigned to each team member to help understand workload distribution.

---

# 📊 Analytics and Workload Management

The Analytics section is available **only to Administrators**.

It helps management understand:

* Total number of tasks
* Completed tasks
* Tasks in progress
* Pending tasks
* Overdue tasks
* Employee workload distribution
* Task completion progress

Workload levels can be categorized as:

* 🟢 **LOW**
* 🟡 **MEDIUM**
* 🔴 **HIGH**

This helps administrators identify overloaded employees and make better management decisions.

---

# ⚠️ Deadline Alerts

TaskFlow automatically highlights important deadlines.

The dashboard can display:

* 🔴 Overdue tasks
* 🟠 Tasks due within the next 48 hours
* 📅 Upcoming tasks

This helps teams avoid missing important deadlines.

---

# 📝 Activity Auditing

The application records important actions in the **activities collection**.

Examples include:

* Task created
* Task updated
* Task deleted
* Task status changed
* Task assigned or reassigned

This provides transparency and helps administrators understand changes made within the system.

---

# 🗄️ MongoDB Database Design

TaskFlow uses **MongoDB Atlas**, a cloud-based NoSQL database.

## 1️⃣ Users Collection

Stores login and role information.

```typescript
interface User {
  _id: ObjectId;
  fullName: string;
  email: string;
  password: string; // Stored as a hashed password
  role: "ADMIN" | "EMPLOYEE";
  department?: string;
  createdAt: string;
  updatedAt: string;
}
```

> Passwords are hashed before storage and are never stored as plain text.

---

## 2️⃣ Tasks Collection

Stores all tasks created in the application.

```typescript
interface Task {
  _id: ObjectId;
  title: string;
  description?: string;
  priority: "LOW" | "MEDIUM" | "HIGH";
  status: "TODO" | "IN_PROGRESS" | "COMPLETED";
  deadline: string;
  estimatedHours: number;
  assignedTo?: string;
  createdAt: string;
  updatedAt: string;
}
```

> **SmartScore is calculated dynamically and is not permanently stored in MongoDB.**

---

## 3️⃣ Employees Collection

Stores team member information.

```typescript
interface Employee {
  _id: ObjectId;
  name: string;
  email: string;
  role: string;
  department?: string;
  createdAt: string;
  updatedAt: string;
}
```

---

## 4️⃣ Activities Collection

Stores system activity history.

```typescript
interface Activity {
  _id: ObjectId;
  action: string;
  description: string;
  taskId?: string;
  taskTitle?: string;
  employeeId?: string;
  employeeName?: string;
  createdAt: string;
}
```

---

# 🔌 API Reference

## 🔐 Authentication APIs

* `POST /api/auth/register` — Register a new user
* `POST /api/auth/login` — Login and create a user session
* `POST /api/auth/logout` — Logout the user
* `GET /api/auth/me` — Get the current logged-in user

## 📋 Task APIs

* `GET /api/tasks` — Get all tasks
* `POST /api/tasks` — Create a new task
* `GET /api/tasks/[id]` — Get a specific task
* `PATCH /api/tasks/[id]` — Update a task
* `DELETE /api/tasks/[id]` — Delete a task

## 👥 Employee APIs

* `GET /api/employees` — Get all employees
* `POST /api/employees` — Create an employee
* `PATCH /api/employees/[id]` — Update employee information
* `DELETE /api/employees/[id]` — Delete an employee

## 📝 Activity APIs

* `GET /api/activities` — Get system activity history

---

# 📁 Project Structure

```text
Smart Task Prioritization System/
│
├── app/
│   ├── page.tsx                 # Dashboard
│   ├── tasks/page.tsx           # Task management
│   ├── employees/page.tsx       # Team management
│   ├── analytics/page.tsx       # Admin analytics
│   │
│   └── api/
│       ├── auth/                # Authentication APIs
│       ├── tasks/               # Task APIs
│       ├── employees/           # Employee APIs
│       └── activities/          # Activity APIs
│
├── components/
│   ├── dashboard/
│   ├── tasks/
│   ├── employees/
│   └── layout/
│
├── lib/
│   ├── mongodb.ts               # MongoDB connection
│   └── priority-calculator.ts  # SmartScore algorithm
│
├── store/
│   ├── task-store.ts            # Task state management
│   └── employee-store.ts        # Employee state management
│
├── types/
│   ├── task.ts
│   ├── employee.ts
│   └── user.ts
│
├── .env                         # Environment variables (not committed)
└── package.json
```

---

# 🚀 Installation and Setup

## 1. Clone the Repository

```bash
git clone <your-repository-url>
cd <your-project-folder>
```

## 2. Install Dependencies

```bash
npm install
```

## 3. Configure Environment Variables

Create a `.env` file in the root directory:

```env
MONGODB_URI=your_mongodb_connection_string
MONGODB_DB=taskflow
AUTH_SECRET=your_secure_random_secret
```

⚠️ **Never upload `.env` or database credentials to GitHub.**

## 4. Start the Development Server

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

---

# 🌱 Sample Tasks for Demonstration

| Task                           | Priority | Status      | Estimated Hours |
| ------------------------------ | -------- | ----------- | --------------: |
| Prepare Client Presentation    | HIGH     | IN_PROGRESS |               2 |
| Complete Authentication Module | HIGH     | TODO        |               4 |
| Verify MongoDB Integration     | HIGH     | TODO        |               2 |
| Review Team Workload           | MEDIUM   | TODO        |               3 |
| Update Project Documentation   | LOW      | TODO        |               1 |

Use different deadlines to demonstrate how the **SmartScore changes based on urgency**.

---

# 🎯 Project Problem Statement

Teams often work on multiple tasks simultaneously and may find it difficult to determine **which task should be completed first**.

Traditional task management applications allow users to create and track tasks but may not intelligently prioritize them based on urgency and importance.

### 💡 TaskFlow Solution

TaskFlow solves this problem by:

1. Evaluating task priority
2. Checking deadline urgency
3. Considering estimated effort
4. Calculating a SmartScore
5. Recommending the most important task

---

# 🔮 Future Enhancements

Potential future improvements include:

* 🔔 Real-time notifications
* 📧 Email deadline reminders
* 📊 Advanced charts and reporting
* 🤖 AI-based task recommendations
* 👥 Team collaboration and comments
* 📎 File attachments for tasks
* 📱 Mobile application support

---

# 🏆 Conclusion

**TaskFlow is more than a basic task management application.** It combines intelligent task prioritization, full-stack development, cloud database storage, authentication, and role-based access control into a practical team productivity solution.

The project demonstrates important modern software development concepts including:

* Full-Stack Web Development
* REST API Design
* MongoDB Database Integration
* Authentication and Authorization
* Role-Based Access Control
* State Management
* Intelligent Rule-Based Decision Making

---

## 🎤 One-Line Presentation Introduction

> **"TaskFlow is an intelligent team task management system that uses a SmartScore algorithm to automatically prioritize work while providing secure collaboration, task assignment, and administrative workload analytics."**
