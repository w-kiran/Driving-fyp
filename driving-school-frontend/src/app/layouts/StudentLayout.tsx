import { ReactNode, useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { fetchMyBookings, fetchMyLessons } from '@/store/slices/bookingSlice'
import { fetchNotifications } from '@/store/slices/notificationSlice'
import { logout } from '@/store/slices/authSlice'
import toast from 'react-hot-toast'
import './StudentLayout.scss'

interface LayoutProps {
  children: ReactNode
}

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: '📊' },
  { path: '/booking', label: 'Book Lesson', icon: '📅' },
  { path: '/lessons', label: 'My Lessons', icon: '🚗' },
  { path: '/progress', label: 'My Progress', icon: '📈' },
  { path: '/notifications', label: 'Notifications', icon: '🔔' },
]

const StudentLayout = ({ children }: LayoutProps) => {
  const dispatch = useAppDispatch()
  const location = useLocation()
  const navigate = useNavigate()
  const { user } = useAppSelector((state) => state.auth)
  const { notifications } = useAppSelector((state) => state.notifications)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setSidebarOpen(false)
  }, [location.pathname])

  useEffect(() => {
    dispatch(fetchMyBookings())
    dispatch(fetchMyLessons())
    dispatch(fetchNotifications())
  }, [dispatch])

  const handleLogout = () => {
    dispatch(logout())
    toast.success('Logged out successfully')
    navigate('/login')
  }

  const unreadCount = notifications?.filter((n) => !n.read)?.length || 0

  return (
    <div className="student-layout">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />}

      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <Link to="/dashboard" className="logo">
            DriveSmart
          </Link>
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
            <div className="user-avatar">{user?.name?.charAt(0) || 'S'}</div>
            <div className="user-details">
              <span className="user-name">{user?.name || 'Student'}</span>
              <span className="user-role">Student</span>
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
            <button className="sidebar-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
              <span className="hamburger-line" />
              <span className="hamburger-line" />
              <span className="hamburger-line" />
            </button>
            <h1 className="page-title">
              {navItems.find((item) => item.path === location.pathname)?.label || 'Dashboard'}
            </h1>
          </div>
          <div className="header-right">
            {unreadCount > 0 && (
              <span className="notification-badge">{unreadCount} new</span>
            )}
          </div>
        </header>

        <div className="content-body">{children}</div>
      </main>
    </div>
  )
}

export default StudentLayout