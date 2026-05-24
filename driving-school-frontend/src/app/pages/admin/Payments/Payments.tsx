import { useEffect, useState } from 'react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { RootState } from '@/store'
import { fetchPayments, refundPayment } from '@/store/slices/adminSlice'
import { useSort } from '@/hooks/useSort'
import SortableHeader from '@/components/SortableHeader/SortableHeader'
import toast from 'react-hot-toast'
import './Payments.scss'

const Payments = () => {
  const dispatch = useAppDispatch()
  const { payments, loading } = useAppSelector((state: RootState) => state.admin)
  const [filter, setFilter] = useState<'all' | 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED'>('all')

  useEffect(() => {
    dispatch(fetchPayments())
  }, [dispatch])

  const handleRefund = async (id: number) => {
    if (confirm('Are you sure you want to refund this payment?')) {
      await dispatch(refundPayment(id))
      toast.success('Payment refunded successfully')
    }
  }

  const filteredPayments = filter === 'all' ? payments : payments?.filter((p) => p.status === filter)
  const { sortedData, sortConfig, requestSort } = useSort(filteredPayments || [], 'id', 'desc')

  return (
    <div className="payments-page">
      <div className="page-header">
        <h2>Payments</h2>
        <div className="filter-tabs">
          {(['all', 'PENDING', 'COMPLETED', 'FAILED', 'REFUNDED'] as const).map((f) => (
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
      ) : sortedData?.length === 0 ? (
        <div className="empty-state card">
          <h3>No payments found</h3>
        </div>
      ) : (
        <div className="payments-table-container card">
          <table className="payments-table">
            <thead>
              <tr>
                <SortableHeader label="ID" sortKey="id" sortConfig={sortConfig} onSort={requestSort} />
                <SortableHeader label="Student" sortKey="student.user.name" sortConfig={sortConfig} onSort={requestSort} />
                <SortableHeader label="Booking" sortKey="bookingId" sortConfig={sortConfig} onSort={requestSort} />
                <SortableHeader label="Amount" sortKey="amount" sortConfig={sortConfig} onSort={requestSort} />
                <SortableHeader label="Method" sortKey="paymentMethod" sortConfig={sortConfig} onSort={requestSort} />
                <SortableHeader label="Status" sortKey="status" sortConfig={sortConfig} onSort={requestSort} />
                <SortableHeader label="Transaction ID" sortKey="transactionId" sortConfig={sortConfig} onSort={requestSort} />
                <SortableHeader label="Date" sortKey="createdAt" sortConfig={sortConfig} onSort={requestSort} />
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedData?.map((payment) => (
                <tr key={payment.id}>
                  <td>#{payment.id}</td>
                  <td>{payment.student?.user?.name || 'Student'}</td>
                  <td>{payment.bookingId ? `#${payment.bookingId}` : '-'}</td>
                  <td>{payment.currency} {payment.amount.toFixed(2)}</td>
                  <td>{payment.paymentMethod}</td>
                  <td>
                    <span className={`status-badge status-${payment.status.toLowerCase()}`}>
                      {payment.status}
                    </span>
                  </td>
                  <td>{payment.transactionId || '-'}</td>
                  <td>{new Date(payment.createdAt).toLocaleDateString()}</td>
                  <td>
                    {payment.status === 'COMPLETED' && (
                      <button className="refund-btn" onClick={() => handleRefund(payment.id)}>
                        Refund
                      </button>
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

export default Payments
