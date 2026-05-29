import { useEffect, useState } from 'react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { RootState } from '@/store'
import { fetchBookings, generateSchedule, fetchLessons } from '@/store/slices/adminSlice'
import { getSlotTimeRange } from '@/utils/slotTimes'
import { useSort } from '@/hooks/useSort'
import SortableHeader from '@/components/SortableHeader/SortableHeader'
import type { VehicleType } from '@/types'
import toast from 'react-hot-toast'
import './Schedule.scss'

const VEHICLE_TYPES: VehicleType[] = ['CAR', 'BIKE', 'SCOOTER']
const VEHICLE_LABELS: Record<VehicleType, string> = { CAR: 'Car', BIKE: 'Bike', SCOOTER: 'Scooter' }
const VEHICLE_ICONS: Record<VehicleType, string> = { CAR: '🚗', BIKE: '🏍️', SCOOTER: '🛵' }

const Schedule = () => {
  const dispatch = useAppDispatch()
  const { bookings, lessons, scheduleGenerating, scheduleResults, error } = useAppSelector((state: RootState) => state.admin)
  const [activeType, setActiveType] = useState<VehicleType>('CAR')

  useEffect(() => {
    dispatch(fetchBookings())
    dispatch(fetchLessons())
  }, [dispatch])

  const pendingBookings = bookings?.filter((b) => b.status === 'PENDING') || []
  const scheduledLessons = lessons?.filter((l) => l.status === 'SCHEDULED') || []

  // Filter by active vehicle type
  const pendingByType = pendingBookings.filter((b) => b.vehicleType === activeType)
  const resultsByType = scheduleResults.filter((r) => r.vehicleType === activeType)

  const pendingSort = useSort(pendingByType, 'id', 'asc')
  const resultsSort = useSort(resultsByType, 'priorityRank', 'asc')

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

  const countsByType = VEHICLE_TYPES.reduce(
    (acc, t) => {
      acc[t] = pendingBookings.filter((b) => b.vehicleType === t).length
      return acc
    },
    {} as Record<VehicleType, number>,
  )

  const resultsCountByType = VEHICLE_TYPES.reduce(
    (acc, t) => {
      acc[t] = scheduleResults.filter((r) => r.vehicleType === t).length
      return acc
    },
    {} as Record<VehicleType, number>,
  )

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

      {/* Vehicle Type Tabs */}
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
              <span className="vehicle-tab__count">{countsByType[type]} pending</span>
            )}
            {resultsCountByType[type] > 0 && (
              <span className="vehicle-tab__result-count">{resultsCountByType[type]} scheduled</span>
            )}
          </button>
        ))}
      </div>

      {resultsByType.length > 0 && (
        <div className="schedule-results card">
          <div className="results-header">
            <h3>{VEHICLE_LABELS[activeType]} Scheduling Results</h3>
          </div>
          <table className="bookings-table">
            <thead>
              <tr>
                <SortableHeader label="Priority" sortKey="priorityRank" sortConfig={resultsSort.sortConfig} onSort={resultsSort.requestSort} />
                <SortableHeader label="Booking" sortKey="bookingId" sortConfig={resultsSort.sortConfig} onSort={resultsSort.requestSort} />
                <SortableHeader label="Exam Date" sortKey="examDate" sortConfig={resultsSort.sortConfig} onSort={resultsSort.requestSort} />
                <SortableHeader label="Failures" sortKey="failures" sortConfig={resultsSort.sortConfig} onSort={resultsSort.requestSort} />
                <SortableHeader label="Lessons" sortKey="lessonsCompleted" sortConfig={resultsSort.sortConfig} onSort={resultsSort.requestSort} />
                <SortableHeader label="Requested" sortKey="preferredDate" sortConfig={resultsSort.sortConfig} onSort={resultsSort.requestSort} />
                <SortableHeader label="Assigned" sortKey="assignedDate" sortConfig={resultsSort.sortConfig} onSort={resultsSort.requestSort} />
                <SortableHeader label="Status" sortKey="shifted" sortConfig={resultsSort.sortConfig} onSort={resultsSort.requestSort} />
                <SortableHeader label="Instructor" sortKey="instructorName" sortConfig={resultsSort.sortConfig} onSort={resultsSort.requestSort} />
              </tr>
            </thead>
            <tbody>
              {resultsSort.sortedData.map((r, i) => (
                <tr key={i} className={r.shifted ? 'shifted-row' : ''}>
                  <td>
                    <span className={`priority-token priority-token--${r.priorityRank <= 3 ? 'high' : r.priorityRank <= 6 ? 'mid' : 'low'}`}>
                      <span className="priority-token__rank">{r.priorityRank}</span>
                      <span className="priority-token__label">PRIORITY</span>
                    </span>
                  </td>
                  <td>#{r.bookingId}</td>
                  <td>{r.examDate ? new Date(r.examDate).toLocaleDateString() : <span className="no-exam">None</span>}</td>
                  <td>{r.failures}</td>
                  <td>{r.lessonsCompleted}</td>
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {pendingByType.length > 0 && (
        <div className="pending-bookings card">
          <div className="results-header">
            <h3>Pending {VEHICLE_LABELS[activeType]} Bookings</h3>
          </div>
          <table className="bookings-table">
            <thead>
              <tr>
                <SortableHeader label="ID" sortKey="id" sortConfig={pendingSort.sortConfig} onSort={pendingSort.requestSort} />
                <SortableHeader label="Preferred Date" sortKey="preferredDate" sortConfig={pendingSort.sortConfig} onSort={pendingSort.requestSort} />
                <SortableHeader label="Exam Date" sortKey="examDate" sortConfig={pendingSort.sortConfig} onSort={pendingSort.requestSort} />
                <SortableHeader label="Slot" sortKey="preferredSlot" sortConfig={pendingSort.sortConfig} onSort={pendingSort.requestSort} />
                <SortableHeader label="Level" sortKey="experienceLevel" sortConfig={pendingSort.sortConfig} onSort={pendingSort.requestSort} />
                <SortableHeader label="Failures" sortKey="failures" sortConfig={pendingSort.sortConfig} onSort={pendingSort.requestSort} />
              </tr>
            </thead>
            <tbody>
              {pendingSort.sortedData.map((booking) => (
                <tr key={booking.id}>
                  <td>#{booking.id}</td>
                  <td>{booking.preferredDate}</td>
                  <td>{booking.examDate ? new Date(booking.examDate).toLocaleDateString() : <span className="no-exam">None</span>}</td>
                  <td>{booking.preferredSlot} ({getSlotTimeRange(booking.preferredSlot)})</td>
                  <td>{booking.experienceLevel}</td>
                  <td>{booking.failures}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeType && pendingByType.length === 0 && resultsByType.length === 0 && (
        <div className="empty-state card">
          <h3>No {VEHICLE_LABELS[activeType]} bookings</h3>
          <p>All {VEHICLE_LABELS[activeType].toLowerCase()} bookings have been scheduled.</p>
        </div>
      )}
    </div>
  )
}

export default Schedule
