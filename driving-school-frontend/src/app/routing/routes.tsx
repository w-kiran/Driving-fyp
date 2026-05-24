import { Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { RootState } from '@/store'

// Pages
import Landing from '@/app/pages/Landing/Landing'
import Login from '@/app/pages/Login/Login'
import Register from '@/app/pages/Register/Register'
import StudentLayout from '@/app/layouts/StudentLayout'
import StudentDashboard from '@/app/pages/student/Dashboard/Dashboard'
import StudentBooking from '@/app/pages/student/Booking/Booking'
import StudentLessons from '@/app/pages/student/Lessons/Lessons'
import StudentNotifications from '@/app/pages/student/Notifications/Notifications'
import AdminLayout from '@/app/layouts/AdminLayout'
import AdminDashboard from '@/app/pages/admin/Dashboard/Dashboard'
import AdminInstructors from '@/app/pages/admin/Instructors/Instructors'
import AdminVehicles from '@/app/pages/admin/Vehicles/Vehicles'
import AdminSchedule from '@/app/pages/admin/Schedule/Schedule'
import AdminBookings from '@/app/pages/admin/Bookings/Bookings'
import AdminStudents from '@/app/pages/admin/Students/Students'
import AdminLessons from '@/app/pages/admin/Lessons/Lessons'
import AdminPayments from '@/app/pages/admin/Payments/Payments'

// Check if user is logged in
const useAuth = () => {
  const { isAuthenticated, role } = useSelector((state: RootState) => state.auth)
  const token = localStorage.getItem('token')
  const savedRole = localStorage.getItem('role')
  return { isAuthenticated: isAuthenticated || !!token, role: role || savedRole }
}

// Protected route - requires login
const ProtectedRoute = ({ children, allowedRole }: { children: React.ReactNode; allowedRole: string }) => {
  const { isAuthenticated, role } = useAuth()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (role !== allowedRole) {
    return role === 'ADMIN' ? <Navigate to="/admin" replace /> : <Navigate to="/dashboard" replace />
  }

  return <>{children}</>
}

// Guest route - only for non-logged in users
const GuestRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, role } = useAuth()

  if (isAuthenticated) {
    return role === 'ADMIN' ? <Navigate to="/admin" replace /> : <Navigate to="/dashboard" replace />
  }

  return <>{children}</>
}

export const Routes = [
  {
    path: '/',
    element: <Landing />,
  },
  {
    path: '/login',
    element: (
      <GuestRoute>
        <Login />
      </GuestRoute>
    ),
  },
  {
    path: '/register',
    element: (
      <GuestRoute>
        <Register />
      </GuestRoute>
    ),
  },
  {
    path: '/dashboard',
    element: (
      <ProtectedRoute allowedRole="STUDENT">
        <StudentLayout>
          <StudentDashboard />
        </StudentLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/booking',
    element: (
      <ProtectedRoute allowedRole="STUDENT">
        <StudentLayout>
          <StudentBooking />
        </StudentLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/lessons',
    element: (
      <ProtectedRoute allowedRole="STUDENT">
        <StudentLayout>
          <StudentLessons />
        </StudentLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/notifications',
    element: (
      <ProtectedRoute allowedRole="STUDENT">
        <StudentLayout>
          <StudentNotifications />
        </StudentLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/admin',
    element: (
      <ProtectedRoute allowedRole="ADMIN">
        <AdminLayout>
          <AdminDashboard />
        </AdminLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/admin/instructors',
    element: (
      <ProtectedRoute allowedRole="ADMIN">
        <AdminLayout>
          <AdminInstructors />
        </AdminLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/admin/vehicles',
    element: (
      <ProtectedRoute allowedRole="ADMIN">
        <AdminLayout>
          <AdminVehicles />
        </AdminLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/admin/schedule',
    element: (
      <ProtectedRoute allowedRole="ADMIN">
        <AdminLayout>
          <AdminSchedule />
        </AdminLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/admin/bookings',
    element: (
      <ProtectedRoute allowedRole="ADMIN">
        <AdminLayout>
          <AdminBookings />
        </AdminLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/admin/students',
    element: (
      <ProtectedRoute allowedRole="ADMIN">
        <AdminLayout>
          <AdminStudents />
        </AdminLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/admin/lessons',
    element: (
      <ProtectedRoute allowedRole="ADMIN">
        <AdminLayout>
          <AdminLessons />
        </AdminLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/admin/payments',
    element: (
      <ProtectedRoute allowedRole="ADMIN">
        <AdminLayout>
          <AdminPayments />
        </AdminLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]