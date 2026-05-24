import { useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { RootState } from '@/store'
import { fetchNotifications, markNotificationRead, markAllNotificationsRead, deleteNotification } from '@/store/slices/bookingSlice'
import toast from 'react-hot-toast'
import './Notifications.scss'

const Notifications = () => {
  const dispatch = useAppDispatch()
  const { notifications, loading } = useAppSelector((state: RootState) => state.booking)

  useEffect(() => {
    dispatch(fetchNotifications())
  }, [dispatch])

  const handleMarkRead = async (id: number) => {
    await dispatch(markNotificationRead(id))
  }

  const handleMarkAllRead = async () => {
    await dispatch(markAllNotificationsRead())
    toast.success('All notifications marked as read')
  }

  const handleDelete = async (id: number) => {
    await dispatch(deleteNotification(id))
    toast.success('Notification deleted')
  }

  const unreadCount = notifications?.filter((n) => !n.read).length || 0

  return (
    <div className="notifications-page">
      <div className="page-header">
        <h2>Notifications</h2>
        {unreadCount > 0 && (
          <button className="mark-all-btn" onClick={handleMarkAllRead}>
            Mark all as read ({unreadCount})
          </button>
        )}
      </div>

      {loading ? (
        <div className="loading-container"><div className="spinner" /></div>
      ) : notifications?.length === 0 ? (
        <div className="empty-state card">
          <h3>No notifications</h3>
          <p>You'll see notifications here when there are updates.</p>
        </div>
      ) : (
        <div className="notification-list">
          {notifications?.map((notification) => (
            <div
              key={notification.id}
              className={`notification-item card ${!notification.read ? 'unread' : ''}`}
            >
              <div className="notification-content">
                <div className="notification-header">
                  <h4>{notification.title}</h4>
                  <span className="notification-date">
                    {new Date(notification.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="notification-message">{notification.message}</p>
                <span className="notification-type">{notification.type}</span>
              </div>
              <div className="notification-actions">
                {!notification.read && (
                  <button className="read-btn" onClick={() => handleMarkRead(notification.id)}>
                    Mark read
                  </button>
                )}
                <button className="delete-btn" onClick={() => handleDelete(notification.id)}>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Notifications
