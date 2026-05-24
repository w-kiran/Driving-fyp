import { ReactNode, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import {
  fetchInstructors,
  fetchVehicles,
  fetchDashboardStats,
  fetchBookings,
  fetchStudents,
  fetchPayments,
} from '@/store/slices/adminSlice'
import { logout } from '@/store/slices/authSlice'
import toast from 'react-hot-toast'
import './AdminLayout.scss'

interface LayoutProps {
  children: ReactNode
}

const navItems = [
  { path: '/admin', label: 'Dashboard', icon: '📊' },
  { path: '/admin/bookings', label: 'Bookings', icon: '📋' },
  { path: '/admin/schedule', label: 'Schedule', icon: '📅' },
  { path: '/admin/lessons', label: 'Lessons', icon: '🎓' },
  { path: '/admin/students', label: 'Students', icon: '👨‍🎓' },
  { path: '/admin/instructors', label: 'Instructors', icon: '👨‍🏫' },
  { path: '/admin/vehicles', label: 'Vehicles', icon: '🚗' },
  { path: '/admin/payments', label: 'Payments', icon: '💳' },
]

const AdminLayout = ({ children }: LayoutProps) => {
  const dispatch = useAppDispatch()
  const location = useLocation()
  const navigate = useNavigate()
  const { user } = useAppSelector((state) => state.auth)

  useEffect(() => {
    dispatch(fetchInstructors())
    dispatch(fetchVehicles())
    dispatch(fetchDashboardStats())
    dispatch(fetchBookings())
    dispatch(fetchStudents())
    dispatch(fetchPayments())
  }, [dispatch])

  const handleLogout = () => {
    dispatch(logout())
    toast.success('Logged out successfully')
    navigate('/login')
  }

  return (
    <div className="admin-layout">
      <aside className="sidebar">
        <div className="sidebar-header">
          <Link to="/admin" className="logo">
            DriveSmart
          </Link>
          <span className="admin-badge">Admin</span>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
            >
              <span className="nav-icon">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">{user?.name?.charAt(0) || 'A'}</div>
            <div className="user-details">
              <span className="user-name">{user?.name || 'Admin'}</span>
              <span className="user-role">Administrator</span>
            </div>
          </div>
          <button onClick={handleLogout} className="logout-btn">
            Logout
          </button>
        </div>
      </aside>

      <main className="main-content">
        <header className="content-header">
          <div className="header-left">
            <h1 className="page-title">
              {navItems.find((item) => item.path === location.pathname)?.label || 'Dashboard'}
            </h1>
          </div>
          <div className="header-right">
            <span className="header-date">
              {new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </span>
          </div>
        </header>

        <div className="content-body">{children}</div>
      </main>
    </div>
  )
}

export default AdminLayout