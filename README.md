# Student Management System

Full-stack student management platform with role-based access for admin, instructor, and student users.

## Tech Stack
- Frontend: React + Vite + React Router
- Backend: Node.js + Express
- Database: MongoDB (Mongoose)
- Auth: JWT + role-based middleware
- Deployment: Render (backend) + Vercel (frontend)

## Repository Structure
```text
student-ms/
|- backend/
|  |- src/
|  |- .env.example
|  |- package.json
|- frontend/
|  |- src/
|  |- .env.example
|  |- package.json
|- DEPLOYMENT.md
|- render.yaml
```

## Features
- Admin:
  - Manage teachers and students
  - Manage classes, subjects, class-subject mappings, and exams
  - Shift students between classes
- Instructor:
  - View assigned class-subject mappings
  - View students and exams by class
  - Submit results
- Student:
  - View own results
- Common:
  - JWT login
  - Protected routes by role
  - Health endpoint: `GET /health`

## Prerequisites
- Node.js 18+
- npm 9+
- MongoDB connection string

## Environment Variables

### Backend (`backend/.env`)
Copy `backend/.env.example` to `backend/.env` and set values:

```env
PORT=3050
MONGO_URI=mongodb+srv://<username>:<password>@<cluster-url>/<database>
JWT_SECRET=replace-with-a-strong-secret
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=replace-with-a-strong-password
ADMIN_USERNAME=Admin
CORS_ORIGIN=http://localhost:5173
```

Note: `CORS_ORIGIN` can be a comma-separated list.

### Frontend (`frontend/.env`)
Copy `frontend/.env.example` to `frontend/.env`:

```env
VITE_API_URL=http://localhost:3050
```

## Local Development

### 1) Install dependencies
```bash
cd backend && npm install
cd ../frontend && npm install
```

### 2) Start backend
```bash
cd backend
npm run dev
```
Backend runs on `http://localhost:3050` by default.

### 3) (Optional) Seed initial admin user
```bash
cd backend
npm run seed:admin
```
You can also override values with CLI flags:
```bash
npm run seed:admin -- --email admin@example.com --password strongpass --username Admin
```

### 4) Start frontend
```bash
cd frontend
npm run dev
```
Frontend runs on `http://localhost:5173` by default.

## Scripts

### Backend
- `npm run dev`: start backend with nodemon
- `npm start`: start backend with node
- `npm run seed:admin`: create admin user

### Frontend
- `npm run dev`: start Vite dev server
- `npm run build`: production build
- `npm run preview`: preview production build
- `npm run lint`: run ESLint

## API Route Overview
Base URL (local): `http://localhost:3050`

- Auth:
  - `POST /auth/login`
  - `POST /auth/signup` (admin token required)
- Admin (admin token required):
  - `POST /admin/create-teachers`
  - `GET /admin/teachers`
  - `POST /admin/create-students`
  - `GET /admin/students`
  - `PUT /admin/students/:studentId`
  - `DELETE /admin/students/:studentId`
  - `PUT /admin/students/:studentId/shift-class`
  - `POST /admin/classes`
  - `GET /admin/classes`
  - `PUT /admin/classes/:classId/incharge`
  - `POST /admin/subjects`
  - `GET /admin/subjects`
  - `POST /admin/class-subjects`
  - `PUT /admin/class-subjects/:classSubjectId`
  - `GET /admin/class-subjects`
  - `POST /admin/exams`
  - `GET /admin/exams`
- Teacher (instructor token required):
  - `GET /teacher/class-subjects`
  - `GET /teacher/students`
  - `GET /teacher/exams`
  - `POST /teacher/results`
- Student (student token required):
  - `GET /student/results`

## Deployment
Use `DEPLOYMENT.md` for full hosting steps.

Summary:
- Backend deploy target: Render (Blueprint using `render.yaml`)
- Frontend deploy target: Vercel (root directory `frontend`)
- Required production env vars:
  - Backend: `MONGO_URI`, `JWT_SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ADMIN_USERNAME`, `CORS_ORIGIN`
  - Frontend: `VITE_API_URL`
