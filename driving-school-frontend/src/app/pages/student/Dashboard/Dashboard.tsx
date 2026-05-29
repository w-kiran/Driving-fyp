import { useEffect, useCallback, useState } from 'react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { RootState } from '@/store'
import { fetchMyBookings, fetchMyLessons } from '@/store/slices/bookingSlice'
import { useServerSort } from '@/hooks/useServerSort'
import SortableHeader from '@/components/SortableHeader/SortableHeader'
import type { VehicleType } from '@/types'
import './Dashboard.scss'

const VEHICLE_TYPES: VehicleType[] = ['CAR', 'BIKE', 'SCOOTER']
const VEHICLE_LABELS: Record<VehicleType, string> = { CAR: 'Car', BIKE: 'Bike', SCOOTER: 'Scooter' }
const VEHICLE_ICONS: Record<VehicleType, string> = { CAR: '🚗', BIKE: '🏍️', SCOOTER: '🛵' }

const Dashboard = () => {
  const dispatch = useAppDispatch()
  const { user } = useAppSelector((state: RootState) => state.auth)
  const { bookings, lessons, loading } = useAppSelector((state: RootState) => state.booking)
  const [activeType, setActiveType] = useState<VehicleType>('CAR')

  const fetchSortedBookings = useCallback(
    (sortBy: string, sortOrder: 'asc' | 'desc') => {
      dispatch(fetchMyBookings({ sortBy, sortOrder }))
    },
    [dispatch],
  )

  const { sortConfig, requestSort } = useServerSort(fetchSortedBookings, 'preferredDate', 'desc')

  // Fetch lessons once on mount (not sortable)
  useEffect(() => {
    dispatch(fetchMyLessons())
  }, [dispatch])

  const pendingBookings = bookings?.filter((b) => b.status === 'PENDING') || []
  const scheduledBookings = bookings?.filter((b) => b.status === 'SCHEDULED') || []
  const upcomingLesson = lessons?.find((l) => l.status === 'SCHEDULED')

  const recentBookingsByType = (bookings?.filter((b) => b.vehicleType === activeType) || []).slice(0, 5)
  const countsByType = VEHICLE_TYPES.reduce(
    (acc, t) => {
      acc[t] = (bookings || []).filter((b) => b.vehicleType === t).length
      return acc
    },
    {} as Record<VehicleType, number>,
  )

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

      {/* Vehicle Type Tabs */}
      {bookings && bookings.length > 0 && (
        <div className="vehicle-tabs">
          {VEHICLE_TYPES.map((type) => (
            <button
              key={type}
              className={`vehicle-tab ${activeType === type ? 'active' : ''}`}
              onClick={() => setActiveType(type)}
            >
              <span className="vehicle-tab__icon">{VEHICLE_ICONS[type]}</span>
              <span className="vehicle-tab__label">{VEHICLE_LABELS[type]}</span>
              {countsByType[type] > 0 && (
                <span className="vehicle-tab__count">{countsByType[type]}</span>
              )}
            </button>
          ))}
        </div>
      )}

      {recentBookingsByType.length > 0 ? (
        <div className="recent-bookings card">
          <h3>Recent {VEHICLE_LABELS[activeType]} Bookings</h3>
          <table className="bookings-table">
            <thead>
              <tr>
                <SortableHeader label="Date" sortKey="preferredDate" sortConfig={sortConfig} onSort={requestSort} />
                <SortableHeader label="Slot" sortKey="preferredSlot" sortConfig={sortConfig} onSort={requestSort} />
                <SortableHeader label="Status" sortKey="status" sortConfig={sortConfig} onSort={requestSort} />
              </tr>
            </thead>
            <tbody>
              {recentBookingsByType.map((booking) => (
                <tr key={booking.id}>
                  <td>{booking.preferredDate}</td>
                  <td>{booking.preferredSlot}</td>
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
      ) : bookings && bookings.length > 0 ? (
        <div className="recent-bookings card">
          <h3>No {VEHICLE_LABELS[activeType]} bookings</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
            You don't have any {VEHICLE_LABELS[activeType].toLowerCase()} bookings yet.
          </p>
        </div>
      ) : null}
    </div>
  )
}

export default Dashboard
