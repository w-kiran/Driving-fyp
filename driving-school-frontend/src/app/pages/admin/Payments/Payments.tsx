import { useEffect, useState } from 'react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { RootState } from '@/store'
import { fetchPayments, refundPayment } from '@/store/slices/adminSlice'
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
      ) : filteredPayments?.length === 0 ? (
        <div className="empty-state card">
          <h3>No payments found</h3>
        </div>
      ) : (
        <div className="payments-table-container card">
          <table className="payments-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Student</th>
                <th>Booking</th>
                <th>Amount</th>
                <th>Method</th>
                <th>Status</th>
                <th>Transaction ID</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPayments?.map((payment) => (
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
