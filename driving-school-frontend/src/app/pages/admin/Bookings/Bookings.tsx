import { useCallback, useMemo, useState } from 'react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { RootState } from '@/store'
import { fetchBookings, updateBookingStatus, deleteBooking } from '@/store/slices/adminSlice'
import { useDebounce } from '@/hooks/useDebounce'
import { useServerSort } from '@/hooks/useServerSort'
import SortableHeader from '@/components/SortableHeader/SortableHeader'
import type { VehicleType } from '@/types'
import toast from 'react-hot-toast'
import './Bookings.scss'

const VEHICLE_TYPES: VehicleType[] = ['CAR', 'BIKE', 'SCOOTER']
const VEHICLE_LABELS: Record<VehicleType, string> = { CAR: 'Car', BIKE: 'Bike', SCOOTER: 'Scooter' }
const VEHICLE_ICONS: Record<VehicleType, string> = { CAR: '🚗', BIKE: '🏍️', SCOOTER: '🛵' }

const Bookings = () => {
  const dispatch = useAppDispatch()
  const { bookings, loading } = useAppSelector((state: RootState) => state.admin)
  const [filter, setFilter] = useState<'all' | 'PENDING' | 'SCHEDULED' | 'COMPLETED' | 'CANCELLED'>('all')
  const [activeType, setActiveType] = useState<VehicleType>('CAR')
  const [searchTerm, setSearchTerm] = useState('')
  const debouncedSearch = useDebounce(searchTerm, 300)

  const fetchSortedBookings = useCallback(
    (sortBy: string, sortOrder: 'asc' | 'desc') => {
      dispatch(fetchBookings({ sortBy, sortOrder }))
    },
    [dispatch],
  )

  const { sortConfig, requestSort } = useServerSort(fetchSortedBookings, 'id', 'desc')

  const filteredByStatus =
    filter === 'all' ? bookings : bookings?.filter((b) => b.status === filter)

  const byVehicle = filteredByStatus?.filter((b) => b.vehicleType === activeType)

  const displayedBookings = useMemo(() => {
    if (!debouncedSearch) return byVehicle
    const q = debouncedSearch.toLowerCase()
    return byVehicle?.filter((b) =>
      b.student?.user?.name?.toLowerCase().includes(q) ||
      String(b.id).includes(q) ||
      b.preferredDate?.includes(q)
    )
  }, [byVehicle, debouncedSearch])

  const handleUpdateStatus = async (bookingId: number, newStatus: 'PENDING' | 'SCHEDULED' | 'COMPLETED' | 'CANCELLED') => {
    try {
      await dispatch(updateBookingStatus({ id: bookingId, status: newStatus })).unwrap()
      toast.success(`Booking status updated to ${newStatus}`)
    } catch (err: unknown) {
      const errorMessage = err as { response?: { data?: { message?: string } } }
      toast.error(errorMessage?.response?.data?.message || 'Failed to update booking status')
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this booking?')) return
    try {
      await dispatch(deleteBooking(id)).unwrap()
      toast.success('Booking deleted successfully!')
    } catch (err: unknown) {
      const errorMessage = err as string
      toast.error(errorMessage || 'Failed to delete booking')
    }
  }

  const countsByType = VEHICLE_TYPES.reduce(
    (acc, t) => {
      const filtered = filter === 'all' ? bookings : bookings?.filter((b) => b.status === filter)
      acc[t] = (filtered || []).filter((b) => b.vehicleType === t).length
      return acc
    },
    {} as Record<VehicleType, number>,
  )

  return (
    <div className="bookings-page">
      <div className="page-header">
        <div className="page-header__top">
          <h2>Bookings</h2>
          <input
            type="text"
            placeholder="Search bookings..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        <div className="filter-tabs">
          {(['all', 'PENDING', 'SCHEDULED', 'COMPLETED', 'CANCELLED'] as const).map((f) => (
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
              <span className="vehicle-tab__count">{countsByType[type]}</span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="loading-container">
          <div className="spinner" />
        </div>
      ) : (searchTerm && displayedBookings?.length === 0) ? (
        <div className="empty-state card">
          <h3>No bookings match your search</h3>
        </div>
      ) : displayedBookings?.length === 0 ? (
        <div className="empty-state card">
          <h3>No {VEHICLE_LABELS[activeType]} bookings found</h3>
        </div>
      ) : (
        <div className="bookings-table-container card">
          <table className="bookings-table">
            <thead>
              <tr>
                <SortableHeader label="ID" sortKey="id" sortConfig={sortConfig} onSort={requestSort} />
                <SortableHeader label="Student" sortKey="student.user.name" sortConfig={sortConfig} onSort={requestSort} />
                <SortableHeader label="Date" sortKey="preferredDate" sortConfig={sortConfig} onSort={requestSort} />
                <SortableHeader label="Slot" sortKey="preferredSlot" sortConfig={sortConfig} onSort={requestSort} />
                <SortableHeader label="Duration" sortKey="trainingDuration" sortConfig={sortConfig} onSort={requestSort} />
                <SortableHeader label="Exam Date" sortKey="examDate" sortConfig={sortConfig} onSort={requestSort} />
                <SortableHeader label="Level" sortKey="experienceLevel" sortConfig={sortConfig} onSort={requestSort} />
                <SortableHeader label="Failures" sortKey="failures" sortConfig={sortConfig} onSort={requestSort} />
                <SortableHeader label="Lessons" sortKey="lessonsCompleted" sortConfig={sortConfig} onSort={requestSort} />
                <SortableHeader label="Status" sortKey="status" sortConfig={sortConfig} onSort={requestSort} />
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {displayedBookings?.map((booking) => (
                <tr key={booking.id}>
                  <td>#{booking.id}</td>
                  <td>{booking.student?.user?.name || 'Student'}</td>
                  <td>{booking.preferredDate}</td>
                  <td>{booking.preferredSlot}</td>
                  <td>{booking.trainingDuration} min</td>
                  <td>{booking.examDate ? new Date(booking.examDate).toLocaleDateString() : <span className="no-exam">None</span>}</td>
                  <td>{booking.experienceLevel || '-'}</td>
                  <td>{booking.failures}</td>
                  <td>{booking.lessonsCompleted}</td>
                  <td>
                    <select
                      value={booking.status}
                      onChange={(e) => handleUpdateStatus(booking.id, e.target.value as 'PENDING' | 'SCHEDULED' | 'COMPLETED' | 'CANCELLED')}
                      className={`status-select status-${booking.status.toLowerCase()}`}
                    >
                      <option value="PENDING">PENDING</option>
                      <option value="SCHEDULED">SCHEDULED</option>
                      <option value="COMPLETED">COMPLETED</option>
                      <option value="CANCELLED">CANCELLED</option>
                    </select>
                  </td>
                  <td>
                  {booking.status === 'PENDING' ? (
                    <div className="action-btns">
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
      )}
    </div>
  )
}

export default Bookings
