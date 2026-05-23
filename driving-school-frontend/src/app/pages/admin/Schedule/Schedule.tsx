import { useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { RootState } from '@/store'
import { fetchBookings, generateSchedule, fetchLessons } from '@/store/slices/adminSlice'
import toast from 'react-hot-toast'
import './Schedule.scss'

const Schedule = () => {
  const dispatch = useAppDispatch()
  const { bookings, lessons, scheduleGenerating, error } = useAppSelector((state: RootState) => state.admin)

  useEffect(() => {
    dispatch(fetchBookings())
    dispatch(fetchLessons())
  }, [dispatch])

  const pendingBookings = bookings?.filter((b) => b.status === 'PENDING') || []
  const scheduledLessons = lessons?.filter((l) => l.status === 'SCHEDULED') || []

  const handleGenerate = async () => {
    const result = await dispatch(generateSchedule())
    if (generateSchedule.fulfilled.match(result)) {
      toast.success(`Schedule generated! ${result.payload.scheduled} scheduled, ${result.payload.failed} failed`)
      dispatch(fetchBookings())
      dispatch(fetchLessons())
    } else {
      toast.error(error || 'Failed to generate schedule')
    }
  }

  return (
    <div className="schedule-page">
      <div className="schedule-header card">
        <div className="header-content">
          <h2>Schedule Generator</h2>
          <p>Automatically assign pending bookings to available instructors and vehicles</p>
        </div>
        <button
          className="btn btn-primary generate-btn"
          onClick={handleGenerate}
          disabled={scheduleGenerating || pendingBookings.length === 0}
        >
          {scheduleGenerating ? (
            <>
              <span className="loading-spinner" /> Generating...
            </>
          ) : (
            'Generate Schedule'
          )}
        </button>
      </div>

      <div className="schedule-stats">
        <div className="stat-card card">
          <span className="stat-value">{pendingBookings.length}</span>
          <span className="stat-label">Pending Bookings</span>
        </div>
        <div className="stat-card card">
          <span className="stat-value">{scheduledLessons.length}</span>
          <span className="stat-label">Scheduled Lessons</span>
        </div>
      </div>

      {pendingBookings.length > 0 && (
        <div className="pending-bookings card">
          <h3>Pending Bookings</h3>
          <table className="bookings-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Date</th>
                <th>Slot</th>
                <th>Vehicle</th>
                <th>Level</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {pendingBookings.slice(0, 10).map((booking) => (
                <tr key={booking.id}>
                  <td>#{booking.id}</td>
                  <td>{booking.preferredDate}</td>
                  <td>{booking.preferredSlot}</td>
                  <td>{booking.vehicleType}</td>
                  <td>{booking.experienceLevel}</td>
                  <td><span className="badge badge-pending">{booking.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {pendingBookings.length === 0 && (
        <div className="empty-state card">
          <h3>No pending bookings</h3>
          <p>All bookings have been scheduled.</p>
        </div>
      )}
    </div>
  )
}

export default Schedule