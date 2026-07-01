import { useCallback, useEffect, useMemo, useState } from 'react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { RootState } from '@/store'
import { fetchBookings, generateSchedule, cancelSchedule, fetchLessons } from '@/store/slices/adminSlice'
import { getSlotTimeRange } from '@/utils/slotTimes'
import { useDebounce } from '@/hooks/useDebounce'
import { useServerSort } from '@/hooks/useServerSort'
import { useSort } from '@/hooks/useSort'
import SortableHeader from '@/components/SortableHeader/SortableHeader'
import type { VehicleType } from '@/types'
import toast from 'react-hot-toast'
import './Schedule.scss'

const VEHICLE_TYPES: VehicleType[] = ['CAR', 'BIKE', 'SCOOTER']
const VEHICLE_LABELS: Record<VehicleType, string> = { CAR: 'Car', BIKE: 'Bike', SCOOTER: 'Scooter' }
const VEHICLE_ICONS: Record<VehicleType, string> = { CAR: '\u{1F697}', BIKE: '\u{1F3CD}\uFE0F', SCOOTER: '\u{1F6F5}' }

const Schedule = () => {
  const dispatch = useAppDispatch()
  const { bookings, lessons, scheduleGenerating, scheduleResults, error } = useAppSelector((state: RootState) => state.admin)
  const [activeType, setActiveType] = useState<VehicleType>('CAR')

  // Search state
  const [pendingSearch, setPendingSearch] = useState('')
  const [resultsSearch, setResultsSearch] = useState('')
  const debouncedPendingSearch = useDebounce(pendingSearch, 300)
  const debouncedResultsSearch = useDebounce(resultsSearch, 300)

  // Server-side sort for pending bookings
  const fetchSortedBookings = useCallback(
    (sortBy: string, sortOrder: 'asc' | 'desc') => {
      dispatch(fetchBookings({ sortBy, sortOrder }))
    },
    [dispatch],
  )

  const { sortConfig: pendingSortConfig, requestSort: pendingRequestSort } = useServerSort(
    fetchSortedBookings,
    'id',
    'asc',
  )

  useEffect(() => {
    dispatch(fetchLessons())
  }, [dispatch])

  const pendingBookings = bookings?.filter((b) => b.status === 'PENDING') || []
  const scheduledLessons = lessons?.filter((l) => l.status === 'SCHEDULED') || []

  // Filter by active vehicle type
  const pendingByType = pendingBookings.filter((b) => b.vehicleType === activeType)
  const resultsByType = scheduleResults.filter((r) => r.vehicleType === activeType)

  // Search filter for pending bookings
  const filteredPending = useMemo(() => {
    if (!debouncedPendingSearch) return pendingByType
    const q = debouncedPendingSearch.toLowerCase()
    return pendingByType.filter((b) =>
      String(b.id).includes(q) ||
      b.preferredDate?.includes(q) ||
      b.preferredSlot?.toLowerCase().includes(q) ||
      b.experienceLevel?.toLowerCase().includes(q)
    )
  }, [pendingByType, debouncedPendingSearch])

  // Search filter for results
  const filteredResults = useMemo(() => {
    if (!debouncedResultsSearch) return resultsByType
    const q = debouncedResultsSearch.toLowerCase()
    return resultsByType.filter((r) =>
      String(r.bookingId).includes(q) ||
      r.instructorName?.toLowerCase().includes(q) ||
      r.assignedDate?.includes(q) ||
      r.preferredDate?.includes(q)
    )
  }, [resultsByType, debouncedResultsSearch])

  // Client-side sort for results (in-memory data from generate API)
  const resultsSort = useSort(filteredResults, 'priorityRank', 'asc')

  // Compute tomorrow's date (same logic as backend getTomorrow)
  const getTomorrowStr = () => {
    const d = new Date()
    d.setDate(d.getDate() + 1)
    return d.toISOString().split('T')[0]
  }

  const tomorrowStr = getTomorrowStr()

  // Check if a schedule already exists for tomorrow (to control button states)
  const hasScheduleForTomorrow = lessons?.some(
    (l) => l.status === 'SCHEDULED' && l.scheduledDate === tomorrowStr
  ) || false

  const handleGenerate = async () => {
    const result = await dispatch(generateSchedule())
    if (generateSchedule.fulfilled.match(result)) {
      toast.success(`Schedule generated! ${result.payload.scheduled} scheduled, ${result.payload.failed} failed`)
      fetchSortedBookings(pendingSortConfig.key, pendingSortConfig.direction)
      dispatch(fetchLessons())
    } else {
      toast.error(error || 'Schedule generation failed')
    }
  }

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel today\'s schedule? All scheduled lessons will be removed and bookings will revert to pending.')) {
      return
    }
    const result = await dispatch(cancelSchedule())
    if (cancelSchedule.fulfilled.match(result)) {
      toast.success(result.payload.message)
      fetchSortedBookings(pendingSortConfig.key, pendingSortConfig.direction)
      dispatch(fetchLessons())
    } else {
      toast.error((result.payload as string) || 'Schedule cancellation failed')
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
        <div className="schedule-actions">
          <button
            className="btn btn-primary generate-btn"
            onClick={handleGenerate}
            disabled={scheduleGenerating || hasScheduleForTomorrow || pendingBookings.length === 0}
          >
            {scheduleGenerating ? (
              <>
                <span className="loading-spinner" /> Generating...
              </>
            ) : (
              'Generate Schedule'
            )}
          </button>
          <button
            className="btn btn-danger cancel-schedule-btn"
            onClick={handleCancel}
            disabled={!hasScheduleForTomorrow}
          >
            Cancel Today's Schedule
          </button>
        </div>
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
            <input
              type="text"
              placeholder="Search results..."
              value={resultsSearch}
              onChange={(e) => setResultsSearch(e.target.value)}
              className="search-input"
            />
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
              {resultsSort.sortedData.length === 0 ? (
                <tr>
                  <td colSpan={9} className="no-results">No results match your search</td>
                </tr>
              ) : (
                resultsSort.sortedData.map((r, i) => (
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
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {pendingByType.length > 0 && (
        <div className="pending-bookings card">
          <div className="results-header">
            <h3>Pending {VEHICLE_LABELS[activeType]} Bookings</h3>
            <input
              type="text"
              placeholder="Search pending bookings..."
              value={pendingSearch}
              onChange={(e) => setPendingSearch(e.target.value)}
              className="search-input"
            />
          </div>
          <table className="bookings-table">
            <thead>
              <tr>
                <SortableHeader label="ID" sortKey="id" sortConfig={pendingSortConfig} onSort={pendingRequestSort} />
                <SortableHeader label="Preferred Date" sortKey="preferredDate" sortConfig={pendingSortConfig} onSort={pendingRequestSort} />
                <SortableHeader label="Exam Date" sortKey="examDate" sortConfig={pendingSortConfig} onSort={pendingRequestSort} />
                <SortableHeader label="Slot" sortKey="preferredSlot" sortConfig={pendingSortConfig} onSort={pendingRequestSort} />
                <SortableHeader label="Level" sortKey="experienceLevel" sortConfig={pendingSortConfig} onSort={pendingRequestSort} />
                <SortableHeader label="Failures" sortKey="failures" sortConfig={pendingSortConfig} onSort={pendingRequestSort} />
              </tr>
            </thead>
            <tbody>
              {filteredPending.length === 0 ? (
                <tr>
                  <td colSpan={6} className="no-results">No bookings match your search</td>
                </tr>
              ) : (
                filteredPending.map((booking) => (
                  <tr key={booking.id}>
                    <td>#{booking.id}</td>
                    <td>{booking.preferredDate}</td>
                    <td>{booking.examDate ? new Date(booking.examDate).toLocaleDateString() : <span className="no-exam">None</span>}</td>
                    <td>{booking.preferredSlot} ({getSlotTimeRange(booking.preferredSlot)})</td>
                    <td>{booking.experienceLevel}</td>
                    <td>{booking.failures}</td>
                  </tr>
                ))
              )}
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
