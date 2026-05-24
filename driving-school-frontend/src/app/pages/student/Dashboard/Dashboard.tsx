import { useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { RootState } from '@/store'
import { fetchMyBookings, fetchMyLessons } from '@/store/slices/bookingSlice'
import { useSort } from '@/hooks/useSort'
import SortableHeader from '@/components/SortableHeader/SortableHeader'
import './Dashboard.scss'

const Dashboard = () => {
  const dispatch = useAppDispatch()
  const { user } = useAppSelector((state: RootState) => state.auth)
  const { bookings, lessons, loading } = useAppSelector((state: RootState) => state.booking)

  useEffect(() => {
    dispatch(fetchMyBookings())
    dispatch(fetchMyLessons())
  }, [dispatch])

  const pendingBookings = bookings?.filter((b) => b.status === 'PENDING') || []
  const scheduledBookings = bookings?.filter((b) => b.status === 'SCHEDULED') || []
  const upcomingLesson = lessons?.find((l) => l.status === 'SCHEDULED')

  const recentBookings = bookings?.slice(0, 5) || []
  const { sortedData, sortConfig, requestSort } = useSort(recentBookings, 'preferredDate', 'desc')

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner" />
      </div>
    )
  }

  return (
    <div className="student-dashboard">
      <div className="welcome-section">
        <h2>Welcome back, {user?.name || 'Student'}!</h2>
        <p>Here's an overview of your driving school progress</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📋</div>
          <div className="stat-content">
            <span className="stat-value">{pendingBookings.length}</span>
            <span className="stat-label">Pending Bookings</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📅</div>
          <div className="stat-content">
            <span className="stat-value">{scheduledBookings.length}</span>
            <span className="stat-label">Scheduled</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🚗</div>
          <div className="stat-content">
            <span className="stat-value">{lessons?.length || 0}</span>
            <span className="stat-label">Total Lessons</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <span className="stat-value">
              {lessons?.filter((l) => l.status === 'COMPLETED').length || 0}
            </span>
            <span className="stat-label">Completed</span>
          </div>
        </div>
      </div>

      {upcomingLesson && (
        <div className="upcoming-lesson-card card">
          <h3>Upcoming Lesson</h3>
          <div className="lesson-details">
            <div className="detail">
              <span className="label">Slot:</span>
              <span className="value">{upcomingLesson.slot}</span>
            </div>
            <div className="detail">
              <span className="label">Duration:</span>
              <span className="value">{upcomingLesson.trainingDuration} minutes</span>
            </div>
            <div className="detail">
              <span className="label">Instructor:</span>
              <span className="value">{upcomingLesson.instructor?.name || 'Assigned'}</span>
            </div>
            <div className="detail">
              <span className="label">Vehicle:</span>
              <span className="value">{upcomingLesson.vehicle?.type || 'Assigned'}</span>
            </div>
          </div>
        </div>
      )}

      {bookings?.length === 0 && (
        <div className="empty-state card">
          <h3>No bookings yet</h3>
          <p>Book your first driving lesson to get started!</p>
          <a href="/booking" className="btn btn-primary">
            Book Now
          </a>
        </div>
      )}

      {sortedData.length > 0 && (
        <div className="recent-bookings card">
          <h3>Recent Bookings</h3>
          <table className="bookings-table">
            <thead>
              <tr>
                <SortableHeader label="Date" sortKey="preferredDate" sortConfig={sortConfig} onSort={requestSort} />
                <SortableHeader label="Slot" sortKey="preferredSlot" sortConfig={sortConfig} onSort={requestSort} />
                <SortableHeader label="Vehicle" sortKey="vehicleType" sortConfig={sortConfig} onSort={requestSort} />
                <SortableHeader label="Status" sortKey="status" sortConfig={sortConfig} onSort={requestSort} />
              </tr>
            </thead>
            <tbody>
              {sortedData.map((booking) => (
                <tr key={booking.id}>
                  <td>{booking.preferredDate}</td>
                  <td>{booking.preferredSlot}</td>
                  <td>{booking.vehicleType}</td>
                  <td>
                    <span className={`badge badge-${booking.status.toLowerCase()}`}>
                      {booking.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default Dashboard
