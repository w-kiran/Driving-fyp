import { useEffect, useCallback, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { RootState } from '@/store'
import { fetchMyBookings, fetchMyLessons, editBooking, deleteBooking } from '@/store/slices/bookingSlice'
import { useServerSort } from '@/hooks/useServerSort'
import { useFormValidation } from '@/hooks/useFormValidation'
import { editBookingSchema } from '@/utils/validation'
import FieldError from '@/components/FieldError/FieldError'
import SortableHeader from '@/components/SortableHeader/SortableHeader'
import { SLOT_TIMES } from '@/utils/slotTimes'
import toast from 'react-hot-toast'
import type { VehicleType, Booking } from '@/types'
import './Dashboard.scss'

const VEHICLE_TYPES: VehicleType[] = ['CAR', 'BIKE', 'SCOOTER']
const VEHICLE_LABELS: Record<VehicleType, string> = { CAR: 'Car', BIKE: 'Bike', SCOOTER: 'Scooter' }
const VEHICLE_ICONS: Record<VehicleType, string> = { CAR: '🚗', BIKE: '🏍️', SCOOTER: '🛵' }

const Dashboard = () => {
  const dispatch = useAppDispatch()
  const { user } = useAppSelector((state: RootState) => state.auth)
  const { bookings, lessons, loading } = useAppSelector((state: RootState) => state.booking)
  const [activeType, setActiveType] = useState<VehicleType>('CAR')
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null)
  const [savingEdit, setSavingEdit] = useState(false)
  const { errors: editErrors, validate: validateEdit, clearErrors: clearEditErrors } = useFormValidation(editBookingSchema)
  const [editForm, setEditForm] = useState({
    preferredSlot: 'SLOT_1' as 'SLOT_1' | 'SLOT_2' | 'SLOT_3' | 'SLOT_4' | 'SLOT_5' | 'SLOT_6' | 'SLOT_7' | 'SLOT_8' | 'SLOT_9' | 'SLOT_10' | 'SLOT_11' | 'SLOT_12',
    preferredDate: '',
    vehicleType: 'CAR' as 'CAR' | 'BIKE' | 'SCOOTER',
    trainingDuration: 60 as 30 | 60,
    experienceLevel: 'BEGINNER' as 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED',
    examDate: '',
  })

  const fetchSortedBookings = useCallback(
    (sortBy: string, sortOrder: 'asc' | 'desc') => {
      dispatch(fetchMyBookings({ sortBy, sortOrder }))
    },
    [dispatch],
  )

  const { sortConfig, requestSort } = useServerSort(fetchSortedBookings, 'preferredDate', 'desc')

  // Fetch bookings and lessons on mount
  useEffect(() => {
    dispatch(fetchMyBookings())
    dispatch(fetchMyLessons())
  }, [dispatch])

  const handleEdit = (booking: Booking) => {
    setEditingBooking(booking)
    setEditForm({
      preferredSlot: booking.preferredSlot,
      preferredDate: booking.preferredDate,
      vehicleType: booking.vehicleType,
      trainingDuration: booking.trainingDuration as 30 | 60,
      experienceLevel: booking.experienceLevel,
      examDate: booking.examDate ? booking.examDate.split('T')[0] : '',
    })
    clearEditErrors()
  }

  const handleSaveEdit = async () => {
    if (!editingBooking) return
    if (!validateEdit(editForm)) return
    setSavingEdit(true)
    const result = await dispatch(editBooking({ id: editingBooking.id, data: editForm }))
    setSavingEdit(false)
    if (editBooking.fulfilled.match(result)) {
      toast.success('Booking updated successfully!')
      setEditingBooking(null)
    } else {
      toast.error(result.payload as string || 'Failed to update booking')
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this booking?')) return
    const result = await dispatch(deleteBooking(id))
    if (deleteBooking.fulfilled.match(result)) {
      toast.success('Booking deleted successfully!')
    } else {
      toast.error(result.payload as string || 'Failed to delete booking')
    }
  }

  const getToday = () => {
    const today = new Date()
    const day = String(today.getDate()).padStart(2, '0')
    const month = String(today.getMonth() + 1).padStart(2, '0')
    const year = today.getFullYear()
    return `${year}-${month}-${day}`
  }

  const getMaxDate = () => {
    const date = new Date()
    date.setDate(date.getDate() + 7)
    const day = String(date.getDate()).padStart(2, '0')
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const year = date.getFullYear()
    return `${year}-${month}-${day}`
  }

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
              <span className="value">{upcomingLesson.vehicle ? `${upcomingLesson.vehicle.name} (${upcomingLesson.vehicle.vehicleNumber})` : 'Assigned'}</span>
            </div>
          </div>
        </div>
      )}

      {bookings?.length === 0 && (
        <div className="empty-state card">
          <h3>No bookings yet</h3>
          <p>Book your first driving lesson to get started!</p>
          <Link to="/booking" className="btn btn-primary">
            Book Now
          </Link>
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
                <th>Actions</th>
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
                  <td>
                    {booking.status === 'PENDING' ? (
                      <div className="action-btns">
                        <button className="edit-btn" onClick={() => handleEdit(booking)}>Edit</button>
                        <button className="delete-btn" onClick={() => handleDelete(booking.id)}>Delete</button>
                      </div>
                    ) : (
                      <span className="no-action">-</span>
                    )}
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

      {editingBooking && (
        <div className="modal-overlay" onClick={() => setEditingBooking(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Edit Booking #{editingBooking.id}</h3>
            <div className="form-group">
              <label>Preferred Date</label>
              <input
                type="date"
                value={editForm.preferredDate}
                onChange={(e) => {
                  setEditForm({ ...editForm, preferredDate: e.target.value })
                  clearEditErrors('preferredDate')
                }}
                className={`form-input ${editErrors.preferredDate ? 'input-error' : ''}`}
                min={getToday()}
                max={getMaxDate()}
              />
              <FieldError message={editErrors.preferredDate} />
            </div>
            <div className="form-group">
              <label>Time Slot</label>
              <select
                value={editForm.preferredSlot}
                onChange={(e) => {
                  setEditForm({ ...editForm, preferredSlot: e.target.value as 'SLOT_1' | 'SLOT_2' | 'SLOT_3' | 'SLOT_4' | 'SLOT_5' | 'SLOT_6' | 'SLOT_7' | 'SLOT_8' | 'SLOT_9' | 'SLOT_10' | 'SLOT_11' | 'SLOT_12' })
                  clearEditErrors('preferredSlot')
                }}
                className={`form-select ${editErrors.preferredSlot ? 'input-error' : ''}`}
              >
                {Object.entries(SLOT_TIMES).map(([key, times]) => (
                  <option key={key} value={key}>{key.charAt(0) + key.slice(1).toLowerCase()} ({times.start} - {times.end})</option>
                ))}
              </select>
              <FieldError message={editErrors.preferredSlot} />
            </div>
            <div className="form-group">
              <label>Vehicle Type</label>
              <select
                value={editForm.vehicleType}
                onChange={(e) => {
                  setEditForm({ ...editForm, vehicleType: e.target.value as 'CAR' | 'BIKE' | 'SCOOTER' })
                  clearEditErrors('vehicleType')
                }}
                className={`form-select ${editErrors.vehicleType ? 'input-error' : ''}`}
              >
                <option value="CAR">Car</option>
                <option value="BIKE">Bike</option>
                <option value="SCOOTER">Scooter</option>
              </select>
              <FieldError message={editErrors.vehicleType} />
            </div>
            <div className="form-group">
              <label>Duration</label>
              <select
                value={editForm.trainingDuration}
                onChange={(e) => {
                  setEditForm({ ...editForm, trainingDuration: Number(e.target.value) as 30 | 60 })
                  clearEditErrors('trainingDuration')
                }}
                className={`form-select ${editErrors.trainingDuration ? 'input-error' : ''}`}
              >
                <option value={30}>30 Minutes</option>
                <option value={60}>60 Minutes</option>
              </select>
              <FieldError message={editErrors.trainingDuration} />
            </div>
            <div className="form-group">
              <label>Experience Level</label>
              <select
                value={editForm.experienceLevel}
                onChange={(e) => {
                  setEditForm({ ...editForm, experienceLevel: e.target.value as 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' })
                  clearEditErrors('experienceLevel')
                }}
                className={`form-select ${editErrors.experienceLevel ? 'input-error' : ''}`}
              >
                <option value="BEGINNER">Beginner</option>
                <option value="INTERMEDIATE">Intermediate</option>
                <option value="ADVANCED">Advanced</option>
              </select>
              <FieldError message={editErrors.experienceLevel} />
            </div>
            <div className="form-group">
              <label>Exam Date (Optional)</label>
              <input
                type="date"
                value={editForm.examDate}
                onChange={(e) => setEditForm({ ...editForm, examDate: e.target.value })}
                min={getToday()}
              />
            </div>
            <div className="modal-actions">
              <button className="btn btn-primary" onClick={handleSaveEdit} disabled={savingEdit}>
                {savingEdit ? <span className="loading-spinner" /> : 'Save'}
              </button>
              <button className="btn btn-secondary" onClick={() => setEditingBooking(null)} disabled={savingEdit}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Dashboard
