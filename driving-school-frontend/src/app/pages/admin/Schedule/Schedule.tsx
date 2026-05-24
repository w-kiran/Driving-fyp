import { useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { RootState } from '@/store'
import { fetchBookings, generateSchedule, fetchLessons } from '@/store/slices/adminSlice'
import { getSlotTimeRange } from '@/utils/slotTimes'
import { useSort } from '@/hooks/useSort'
import SortableHeader from '@/components/SortableHeader/SortableHeader'
import toast from 'react-hot-toast'
import './Schedule.scss'

const Schedule = () => {
  const dispatch = useAppDispatch()
  const { bookings, lessons, scheduleGenerating, scheduleResults, error } = useAppSelector((state: RootState) => state.admin)

  useEffect(() => {
    dispatch(fetchBookings())
    dispatch(fetchLessons())
  }, [dispatch])

  const pendingBookings = bookings?.filter((b) => b.status === 'PENDING') || []
  const scheduledLessons = lessons?.filter((l) => l.status === 'SCHEDULED') || []

  const pendingSort = useSort(pendingBookings, 'preferredDate', 'asc')
  const resultsSort = useSort(scheduleResults, 'bookingId', 'asc')

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
          <p className="schedule-hint">
            Each student is first matched to their preferred date and slot.
            If unavailable, the student with the closer exam date (or more failures) wins,
            and others are shifted to the next available slot or date.
          </p>
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

      {resultsSort.sortedData.length > 0 && (
        <div className="schedule-results card">
          <h3>Latest Scheduling Results</h3>
          <table className="bookings-table">
            <thead>
              <tr>
                <SortableHeader label="Booking" sortKey="bookingId" sortConfig={resultsSort.sortConfig} onSort={resultsSort.requestSort} />
                <SortableHeader label="Requested" sortKey="preferredDate" sortConfig={resultsSort.sortConfig} onSort={resultsSort.requestSort} />
                <SortableHeader label="Assigned" sortKey="assignedDate" sortConfig={resultsSort.sortConfig} onSort={resultsSort.requestSort} />
                <SortableHeader label="Status" sortKey="shifted" sortConfig={resultsSort.sortConfig} onSort={resultsSort.requestSort} />
                <SortableHeader label="Instructor" sortKey="instructorName" sortConfig={resultsSort.sortConfig} onSort={resultsSort.requestSort} />
                <SortableHeader label="Vehicle" sortKey="vehicleType" sortConfig={resultsSort.sortConfig} onSort={resultsSort.requestSort} />
              </tr>
            </thead>
            <tbody>
              {resultsSort.sortedData.map((r, i) => (
                <tr key={i} className={r.shifted ? 'shifted-row' : ''}>
                  <td>#{r.bookingId}</td>
                  <td>{r.preferredDate} ({getSlotTimeRange(r.preferredSlot)})</td>
                  <td>{r.assignedDate} ({r.timeRange})</td>
                  <td>
                    {r.shifted ? (
                      <span className="status-badge status-shifted">Shifted</span>
                    ) : (
                      <span className="status-badge status-exact">Exact Match</span>
                    )}
                  </td>
                  <td>{r.instructorName}</td>
                  <td>{r.vehicleType}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {pendingSort.sortedData.length > 0 && (
        <div className="pending-bookings card">
          <h3>Pending Bookings</h3>
          <table className="bookings-table">
            <thead>
              <tr>
                <SortableHeader label="ID" sortKey="id" sortConfig={pendingSort.sortConfig} onSort={pendingSort.requestSort} />
                <SortableHeader label="Preferred Date" sortKey="preferredDate" sortConfig={pendingSort.sortConfig} onSort={pendingSort.requestSort} />
                <SortableHeader label="Exam Date" sortKey="examDate" sortConfig={pendingSort.sortConfig} onSort={pendingSort.requestSort} />
                <SortableHeader label="Slot" sortKey="preferredSlot" sortConfig={pendingSort.sortConfig} onSort={pendingSort.requestSort} />
                <SortableHeader label="Vehicle" sortKey="vehicleType" sortConfig={pendingSort.sortConfig} onSort={pendingSort.requestSort} />
                <SortableHeader label="Level" sortKey="experienceLevel" sortConfig={pendingSort.sortConfig} onSort={pendingSort.requestSort} />
                <SortableHeader label="Failures" sortKey="failures" sortConfig={pendingSort.sortConfig} onSort={pendingSort.requestSort} />
              </tr>
            </thead>
            <tbody>
              {pendingSort.sortedData.map((booking) => (
                <tr key={booking.id}>
                  <td>#{booking.id}</td>
                  <td>{booking.preferredDate}</td>
                  <td>{booking.examDate ? new Date(booking.examDate).toLocaleDateString() : 'None'}</td>
                  <td>{booking.preferredSlot} ({getSlotTimeRange(booking.preferredSlot)})</td>
                  <td>{booking.vehicleType}</td>
                  <td>{booking.experienceLevel}</td>
                  <td>{booking.failures}</td>
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
