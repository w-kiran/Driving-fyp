import { useEffect, useState } from 'react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { RootState } from '@/store'
import { fetchBookings, updateBookingStatus, fetchLessons, completeLesson } from '@/store/slices/adminSlice'
import toast from 'react-hot-toast'
import './Bookings.scss'

const Bookings = () => {
  const dispatch = useAppDispatch()
  const { bookings, lessons, loading } = useAppSelector((state: RootState) => state.admin)
  const [filter, setFilter] = useState<'all' | 'PENDING' | 'SCHEDULED' | 'COMPLETED'>('all')

  useEffect(() => {
    dispatch(fetchBookings())
    dispatch(fetchLessons())
  }, [dispatch])

  const handleStatusChange = async (id: number, status: string) => {
    await dispatch(updateBookingStatus({ id, status }))
    toast.success('Booking status updated')
  }

  const handleComplete = async (id: number, passed: boolean) => {
    await dispatch(completeLesson({ id, passed }))
    toast.success(passed ? 'Lesson marked as passed' : 'Lesson marked as failed')
  }

  const filteredBookings = filter === 'all' ? bookings : bookings?.filter((b) => b.status === filter)

  return (
    <div className="bookings-page">
      <div className="page-header">
        <h2>Bookings Management</h2>
        <div className="filter-tabs">
          {(['all', 'PENDING', 'SCHEDULED', 'COMPLETED'] as const).map((f) => (
            <button
              key={f}
              className={`filter-btn ${filter === f ? 'active' : ''}`}
              onClick={() => setFilter(f)}
            >
              {f === 'all' ? 'All' : f}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="loading-container"><div className="spinner" /></div>
      ) : filteredBookings?.length === 0 ? (
        <div className="empty-state card">
          <h3>No bookings found</h3>
        </div>
      ) : (
        <div className="bookings-table-container card">
          <table className="bookings-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Student</th>
                <th>Date</th>
                <th>Slot</th>
                <th>Vehicle</th>
                <th>Duration</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings?.map((booking) => (
                <tr key={booking.id}>
                  <td>#{booking.id}</td>
                  <td>{booking.student?.user?.name || 'Student'}</td>
                  <td>{booking.preferredDate}</td>
                  <td>{booking.preferredSlot}</td>
                  <td>{booking.vehicleType}</td>
                  <td>{booking.trainingDuration} min</td>
                  <td>
                    <select
                      className="status-select"
                      value={booking.status}
                      onChange={(e) => handleStatusChange(booking.id, e.target.value)}
                    >
                      <option value="PENDING">Pending</option>
                      <option value="SCHEDULED">Scheduled</option>
                      <option value="COMPLETED">Completed</option>
                    </select>
                  </td>
                  <td>
                    {booking.status === 'SCHEDULED' && (
                      <div className="action-btns">
                        <button className="pass-btn" onClick={() => {
                          const lesson = lessons?.find((l) => l.studentId === booking.studentId && l.status === 'SCHEDULED')
                          if (lesson) handleComplete(lesson.id, true)
                        }}>Pass</button>
                        <button className="fail-btn" onClick={() => {
                          const lesson = lessons?.find((l) => l.studentId === booking.studentId && l.status === 'SCHEDULED')
                          if (lesson) handleComplete(lesson.id, false)
                        }}>Fail</button>
                      </div>
                    )}
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

export default Bookings