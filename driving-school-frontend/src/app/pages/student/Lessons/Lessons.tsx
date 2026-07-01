import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { RootState } from '@/store'
import { fetchMyLessons } from '@/store/slices/bookingSlice'
import { getSlotTimeRange } from '@/utils/slotTimes'
import './Lessons.scss'

const Lessons = () => {
  const dispatch = useAppDispatch()
  const { lessons, loading } = useAppSelector((state: RootState) => state.booking)

  useEffect(() => {
    dispatch(fetchMyLessons())
  }, [dispatch])

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner" />
      </div>
    )
  }

  if (!lessons || lessons.length === 0) {
    return (
      <div className="lessons-page">
        <div className="empty-state card">
          <h3>No lessons yet</h3>
          <p>Once the admin generates a schedule, your lessons will appear here.</p>
          <Link to="/booking" className="btn btn-primary">
            Book a Lesson First
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="lessons-page">
      <div className="lessons-grid">
        {lessons.map((lesson) => (
          <div key={lesson.id} className="lesson-card card">
            <div className="lesson-header">
              <span className={`badge badge-${lesson.status.toLowerCase()}`}>{lesson.status}</span>
              {lesson.scheduledDate && (
                <span className="lesson-date">{lesson.scheduledDate}</span>
              )}
            </div>

            <div className="lesson-details">
              <div className="detail-item">
                <span className="label">Time Slot</span>
                <span className="value">{lesson.slot} ({getSlotTimeRange(lesson.slot)})</span>
              </div>
              <div className="detail-item">
                <span className="label">Duration</span>
                <span className="value">{lesson.trainingDuration} min</span>
              </div>
              <div className="detail-item">
                <span className="label">Instructor</span>
                <span className="value">{lesson.instructor?.name || 'To be assigned'}</span>
              </div>
              <div className="detail-item">
                <span className="label">Vehicle</span>
                <span className="value">
                  {lesson.vehicle
                    ? `${lesson.vehicle.name} (${lesson.vehicle.vehicleNumber}) - ${lesson.vehicle.type}`
                    : 'To be assigned'}
                </span>
              </div>
            </div>

            {lesson.notes && (
              <div className="lesson-notes">
                <span className="label">Notes:</span>
                <p>{lesson.notes}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default Lessons
