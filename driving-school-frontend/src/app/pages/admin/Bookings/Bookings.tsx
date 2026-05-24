import { useEffect, useState } from 'react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { RootState } from '@/store'
import { fetchBookings, updateBookingStatus } from '@/store/slices/adminSlice'
import { useSort } from '@/hooks/useSort'
import SortableHeader from '@/components/SortableHeader/SortableHeader'
import toast from 'react-hot-toast'
import './Bookings.scss'

const Bookings = () => {
  const dispatch = useAppDispatch()
  const { bookings, loading } = useAppSelector((state: RootState) => state.admin)
  const [filter, setFilter] = useState<'all' | 'PENDING' | 'SCHEDULED' | 'COMPLETED' | 'CANCELLED'>('all')

  useEffect(() => {
    dispatch(fetchBookings())
  }, [dispatch])

  const filteredBookings = filter === 'all' ? bookings : bookings?.filter((b) => b.status === filter)

  const { sortedData, sortConfig, requestSort } = useSort(filteredBookings || [], 'id', 'desc')

  const handleUpdateStatus = async (bookingId: number, newStatus: 'PENDING' | 'SCHEDULED' | 'COMPLETED' | 'CANCELLED') => {
    try {
      await dispatch(updateBookingStatus({ id: bookingId, status: newStatus })).unwrap()
      toast.success(`Booking status updated to ${newStatus}`)
    } catch (err: unknown) {
      const errorMessage = err as { response?: { data?: { message?: string } } }
      toast.error(errorMessage?.response?.data?.message || 'Failed to update booking status')
    }
  }

  return (
    <div className="bookings-page">
      <div className="page-header">
        <h2>Bookings</h2>
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

      {loading ? (
        <div className="loading-container">
          <div className="spinner" />
        </div>
      ) : sortedData?.length === 0 ? (
        <div className="empty-state card">
          <h3>No bookings found</h3>
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
                <SortableHeader label="Vehicle" sortKey="vehicleType" sortConfig={sortConfig} onSort={requestSort} />
                <SortableHeader label="Duration" sortKey="trainingDuration" sortConfig={sortConfig} onSort={requestSort} />
                <SortableHeader label="Status" sortKey="status" sortConfig={sortConfig} onSort={requestSort} />
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedData?.map((booking) => (
                <tr key={booking.id}>
                  <td>#{booking.id}</td>
                  <td>{booking.student?.user?.name || 'Student'}</td>
                  <td>{booking.preferredDate}</td>
                  <td>{booking.preferredSlot}</td>
                  <td>{booking.vehicleType}</td>
                  <td>{booking.trainingDuration} min</td>
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
                  <td>-</td>
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
