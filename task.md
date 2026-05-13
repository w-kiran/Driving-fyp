# Booking Module Implementation Plan

## Context
The student can already **request new lessons** (creates a booking). Admin can **generate schedule** from pending bookings. What's missing are the CRUD operations for managing bookings.

---

## Files to Create/Modify

### 1. Student Booking Views (`src/modules/student/student.controller.ts`)
- `getMyBookings` - View student's own bookings
- `cancelBooking` - Cancel a pending booking

### 2. Admin Booking Controller (`src/modules/admin/booking/booking.controller.ts`) - NEW
- `getAllBookings` - List all bookings with filters
- `updateBookingStatus` - Approve/reject/cancel a booking
- `deleteBooking` - Remove a booking

### 3. Admin Booking Routes (`src/modules/admin/booking/booking.route.ts`) - NEW
```
GET  /api/admin/bookings         - List all
GET  /api/admin/bookings/:id      - Get one
PUT  /api/admin/bookings/:id      - Update status
DEL  /api/admin/bookings/:id      - Delete
```

### 4. Student Routes (`src/modules/student/student.routes.ts`)
- Add GET /bookings (student's bookings)
- Add PUT /bookings/:id/cancel

### 5. App.ts (`src/app.ts`)
- Add admin booking route
- Add admin/schedule route

---

## Implementation Details

### student.controller.ts additions:
```typescript
export const getMyBookings = async (req: Request, res: Response) => {
  // Get student from JWT, return their bookings
}

export const cancelBooking = async (req: Request, res: Response) => {
  // Verify ownership, check status is PENDING, update to CANCELLED
}
```

### booking.controller.ts (new):
```typescript
export const getAllBookings = async (req: Request, res: Response) => {
  // Admin only - filter by status, date, student
}

export const updateBookingStatus = async (req: Request, res: Response) => {
  // Admin updates status (PENDING → SCHEDULED, CANCELLED, etc.)
}
```

---

## Verification
1. Run `npm run build` - should compile without errors
2. Test endpoints with curl/Postman
3. Check auth middleware protects routes correctly

---

## Reuse Existing
- Auth middleware: `src/middleware/auth.middleware.ts`
- Admin middleware: `src/middleware/admin.middleware.ts`
- Prisma client: already imported in other controllers


# Lesson Management CRUD Plan

## Context
Students need to view and manage their scheduled lessons. Admins need full CRUD operations on lessons.

---

## Files to Create/Modify

### 1. Student Lesson Routes (`src/modules/student/student.routes.ts`)
Add: `GET /lessons` - View student's scheduled lessons

### 2. Admin Lesson Controller (`src/modules/admin/lesson/lesson.controller.ts`) - NEW
- `getAllLessons` - List all lessons with filters
- `getLessonById` - Get single lesson
- `updateLesson` - Reschedule or change status
- `deleteLesson` - Cancel a lesson

### 3. Admin Lesson Routes (`src/modules/admin/lesson/lesson.route.ts`) - NEW
```
GET  /api/admin/lessons      - List all
GET  /api/admin/lessons/:id  - Get one
PUT  /api/admin/lessons/:id  - Update (reschedule)
DEL  /api/admin/lessons/:id  - Delete
```

### 4. App.ts (`src/app.ts`)
Add admin lesson route

---

## Reuse
- Auth middleware: `src/middleware/auth.middleware.ts`
- Admin middleware: `src/middleware/admin.middleware.ts`
- Prisma client: already imported in other controllers

---

## Verification
1. Run `npm run build` - should compile
2. Test endpoints with curl/Postman

# Testing Plan

## Context
Add unit tests for the scheduling algorithm and key backend functionality.

---

## Files to Create

### 1. Install Testing Dependencies
```bash
npm install --save-dev jest ts-jest @types/jest
```

### 2. Jest Config (`jest.config.js`)
- ts-jest preset for TypeScript
- Test match patterns

### 3. Test Files
- `src/algorithms/__tests__/scheduler.test.ts` - Test priorityScheduling
- `src/algorithms/__tests__/allocator.test.ts` - Test allocate function
- `src/algorithms/__tests__/conflictChecker.test.ts` - Test conflict detection

---

## Reuse
- Scheduler: `src/algorithms/scheduler.ts`
- Allocator: `src/algorithms/allocator.ts`
- ConflictChecker: `src/algorithms/conflictChecker.ts`

---

## Verification
1. Run `npm test`
2. Check all tests pass


# Dashboard API Plan

## Context
Admin needs a single endpoint to get overview stats: total students, pending bookings, scheduled lessons, instructor load.

---

## Files to Create/Modify

### 1. Admin Dashboard Controller (`src/modules/admin/dashboard/dashboard.controller.ts`) - NEW
```typescript
export const getDashboardStats = async (req: Request, res: Response) => {
  // Return: totalStudents, pendingBookings, scheduledLessons, completedLessons, instructorStats
}
```

### 2. Admin Dashboard Routes (`src/modules/admin/dashboard/dashboard.route.ts`) - NEW
```
GET /api/admin/dashboard - Get all stats
```

### 3. App.ts - Add route

---

## Reuse
- Prisma client from `src/config/db.ts`
- Auth & admin middleware already exists

---

## Verification
1. `npm run build`
2. Test endpoint with Postman/curl



# React Frontend Plan (Vite SPA)

## Context
User chose option 1: Build a React frontend app (plain React with Vite, NOT Next.js) to connect to the existing driving school backend. Backend is a fully implemented Express/Prisma API with auth (admin + student login/register), bookings, lessons, scheduling, dashboard, and CRUD for instructors/vehicles.

## API Endpoints Summary
**Auth:** `POST /api/auth/admin/login`, `/student/register`, `/student/login`
**Student:** `PUT /api/students/request-new-lesson`, `GET /api/students/bookings`, `PUT /api/students/bookings/:id/cancel`, `GET /api/students/lessons`
**Admin:** `GET /api/instructors`, `GET/POST/PUT /api/vehicles`, `GET/POST/PUT/DELETE /api/admin/bookings`, `GET/POST/PUT/DELETE /api/admin/lessons`, `POST /api/admin/schedule/allocate`, `GET /api/admin/dashboard`

## Files to Create

### 1. Setup Vite React App
- `npm create vite@latest driving-school-frontend -- --template react-ts`
- `npm install react-router-dom axios tailwindcss postcss autoprefixer`
- `npx tailwindcss init -p`
- Configure `vite.config.ts` for CORS proxy or set `VITE_API_URL` env var

### 2. Auth Context (`src/contexts/AuthContext.tsx`)
- Store user, role, token
- Provide `login(role, email, password)`, `logout`, `register` functions
- Persist to localStorage
- Axios instance with `Authorization: Bearer <token>` interceptor

### 3. Routing with React Router (`src/App.tsx`, `src/routes/`)
- Use `react-router-dom` with route groups via lazy loading
- Protected routes wrapper for admin/student guards

### 4. Auth Pages (`src/pages/auth/`)
- `Login.tsx` - email/password + role selector
- `Register.tsx` - student registration form

### 5. Student Pages (`src/pages/student/`)
- `StudentDashboard.tsx` - view my bookings & lessons
- `Bookings.tsx` - list bookings with cancel option
- `RequestLesson.tsx` - request new lesson form

### 6. Admin Pages (`src/pages/admin/`)
- `AdminDashboard.tsx` - stats cards
- `Bookings.tsx` - list + status update
- `Lessons.tsx` - CRUD table
- `Instructors.tsx` - list instructors
- `Vehicles.tsx` - list + CRUD vehicles

### 7. Layout Components
- `AdminLayout.tsx` - sidebar navigation
- `StudentLayout.tsx` - top navigation

### 8. API Service Layer (`src/lib/api.ts`)
- Axios instance configured with baseURL (`http://localhost:5000/api`)
- Typed API functions matching each route

## Key Design Decisions
- **Vite** + React 18 with TypeScript
- **React Router v6** for routing (SPA with client-side navigation)
- **Tailwind CSS** for styling
- **Axios** for HTTP calls
- Role-based routing with protected route wrappers
- JWT token stored in localStorage, sent via Axios interceptor

## Project Structure
```
driving-school-frontend/
├── src/
│   ├── pages/
│   │   ├── auth/Login.tsx, Register.tsx
│   │   ├── student/StudentDashboard.tsx, Bookings.tsx, RequestLesson.tsx
│   │   └── admin/AdminDashboard.tsx, Bookings.tsx, Lessons.tsx, Instructors.tsx, Vehicles.tsx
│   ├── components/layouts/AdminLayout.tsx, StudentLayout.tsx, Sidebar.tsx
│   ├── contexts/AuthContext.tsx
│   ├── lib/api.ts, types.ts
│   ├── routes/ProtectedRoute.tsx
│   ├── services/auth.service.ts, student.service.ts, admin.service.ts
│   ├── App.tsx
│   └── main.tsx
└── index.html
```

## Critical Files (implement these first)
1. `src/lib/types.ts` - TypeScript types matching backend enums (Role, Status, Slot, VehicleType, ExperienceLevel)
2. `src/lib/api.ts` - Axios instance with auth interceptor + 401 redirect
3. `src/contexts/AuthContext.tsx` - Auth state (user, token, role) with login/logout/register
4. `src/services/auth.service.ts` - adminLogin, studentLogin, studentRegister
5. `src/services/student.service.ts` - requestNewLesson, getBookings, cancelBooking, getLessons
6. `src/services/admin.service.ts` - getAllBookings, updateBooking, deleteBooking, getAllLessons, updateLesson, deleteLesson, getVehicles, addVehicle, updateVehicle, deleteVehicle, getInstructors, getDashboardStats

## Verification
1. Run backend: `npm run dev` (port 5000)
2. Run frontend: `npm run dev` (port 5173)
3. Register student, login, view bookings
4. Login as admin, view dashboard stats, approve bookings