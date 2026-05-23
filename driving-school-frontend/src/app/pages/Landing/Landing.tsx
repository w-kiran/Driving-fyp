import { Link, useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { logout } from '@/store/slices/authSlice'

const Landing = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { user, isAuthenticated, role } = useAppSelector((state) => state.auth)
  const token = localStorage.getItem('token')
  const savedRole = localStorage.getItem('role')
  const savedUser = localStorage.getItem('user')

  const isLoggedIn = isAuthenticated || token
  const currentRole = role || savedRole
  const currentUser = user || (savedUser ? JSON.parse(savedUser) : null)

  const handleLogout = () => {
    dispatch(logout())
    navigate('/login')
  }

  return (
    <div className="landing">
      <header className="landing-header">
        <div className="logo">DriveSmart</div>
        <nav className="nav-links">
          {isLoggedIn ? (
            <>
              <span className="user-greeting">Welcome, {currentUser?.name || 'User'}</span>
              <Link
                to={currentRole === 'ADMIN' ? '/admin' : '/dashboard'}
                className="nav-link"
              >
                Dashboard
              </Link>
              <button onClick={handleLogout} className="btn btn-outline">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link">Login</Link>
              <Link to="/register" className="btn btn-primary">Get Started</Link>
            </>
          )}
        </nav>
      </header>

      <section className="hero">
        <div className="hero-content">
          <h1>Smart Driving School Scheduling System</h1>
          <p>
            Experience seamless booking management with our intelligent scheduling algorithm.
            Book your driving lessons, get matched with the best instructors, and track your progress effortlessly.
          </p>
          <div className="hero-buttons">
            {isLoggedIn ? (
              <Link
                to={currentRole === 'ADMIN' ? '/admin' : '/dashboard'}
                className="btn btn-primary"
              >
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link to="/login" className="btn btn-primary">Login</Link>
                <Link to="/register" className="btn btn-outline">Register</Link>
              </>
            )}
          </div>
        </div>
      </section>

      <section className="features">
        <h2>Why Choose Us?</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">📅</div>
            <h3>Smart Scheduling</h3>
            <p>Our intelligent algorithm automatically assigns lessons based on instructor availability and student preferences.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">⚡</div>
            <h3>Conflict-Free Booking</h3>
            <p>Say goodbye to scheduling conflicts. Our system ensures no double bookings or overlapping sessions.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">👥</div>
            <h3>Fair Instructor Allocation</h3>
            <p>Equitable distribution of lessons among instructors ensures consistent quality and availability.</p>
          </div>
        </div>
      </section>

      <section className="how-it-works">
        <h2>How It Works</h2>
        <div className="steps">
          <div className="step">
            <div className="step-number">1</div>
            <h3>Register</h3>
            <p>Create your student account with basic details</p>
          </div>
          <div className="step">
            <div className="step-number">2</div>
            <h3>Book a Lesson</h3>
            <p>Select your preferred slot, vehicle type, and schedule</p>
          </div>
          <div className="step">
            <div className="step-number">3</div>
            <h3>Admin Schedules</h3>
            <p>Our system assigns the best instructor and vehicle</p>
          </div>
          <div className="step">
            <div className="step-number">4</div>
            <h3>Learn & Progress</h3>
            <p>Attend your scheduled lessons and track progress</p>
          </div>
        </div>
      </section>

      <footer className="landing-footer">
        <p>&copy; 2024 DriveSmart. All rights reserved.</p>
      </footer>
    </div>
  )
}

export default Landing