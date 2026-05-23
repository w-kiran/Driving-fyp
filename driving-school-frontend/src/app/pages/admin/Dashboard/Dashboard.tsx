import { useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { RootState } from '@/store'
import { fetchDashboardStats } from '@/store/slices/adminSlice'
import './Dashboard.scss'

const AdminDashboard = () => {
  const dispatch = useAppDispatch()
  const { stats, loading } = useAppSelector((state: RootState) => state.admin)

  useEffect(() => {
    dispatch(fetchDashboardStats())
  }, [dispatch])

  if (loading || !stats) {
    return (
      <div className="loading-container">
        <div className="spinner" />
      </div>
    )
  }

  return (
    <div className="admin-dashboard">
      <div className="welcome-section">
        <h2>Admin Dashboard</h2>
        <p>Overview of your driving school system</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">👨‍🎓</div>
          <div className="stat-content">
            <span className="stat-value">{stats.students}</span>
            <span className="stat-label">Total Students</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">👨‍🏫</div>
          <div className="stat-content">
            <span className="stat-value">{stats.instructors}</span>
            <span className="stat-label">Instructors</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🚗</div>
          <div className="stat-content">
            <span className="stat-value">{stats.vehicles}</span>
            <span className="stat-label">Vehicles</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📋</div>
          <div className="stat-content">
            <span className="stat-value">{stats.bookings.pending}</span>
            <span className="stat-label">Pending Bookings</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📅</div>
          <div className="stat-content">
            <span className="stat-value">{stats.lessons.scheduled}</span>
            <span className="stat-label">Scheduled Lessons</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <span className="stat-value">{stats.lessons.completed}</span>
            <span className="stat-label">Completed Lessons</span>
          </div>
        </div>
      </div>

      {stats.instructorLoad && stats.instructorLoad.length > 0 && (
        <div className="instructor-load card">
          <h3>Instructor Workload</h3>
          <table className="load-table">
            <thead>
              <tr>
                <th>Instructor</th>
                <th>Daily Lessons</th>
                <th>Total Lessons</th>
              </tr>
            </thead>
            <tbody>
              {stats.instructorLoad.map((instructor) => (
                <tr key={instructor.id}>
                  <td>{instructor.name}</td>
                  <td>{instructor.dailyLessonCount}</td>
                  <td>{instructor.totalLessons}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default AdminDashboard