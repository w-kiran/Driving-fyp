import { useEffect } from 'react'
import { useAppSelector, useAppDispatch } from '@/store/hooks'
import { RootState } from '@/store'
import { fetchMyLessons, fetchMyBookings } from '@/store/slices/bookingSlice'
import { getSlotTimeRange } from '@/utils/slotTimes'
import {
  PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend
} from 'recharts'
import './Progress.scss'

const COLORS = {
  SCHEDULED: '#2563eb',
  COMPLETED: '#10b981',
  CANCELLED: '#ef4444',
}

const VEHICLE_COLORS: Record<string, string> = {
  CAR: '#2563eb',
  BIKE: '#10b981',
  SCOOTER: '#f59e0b',
}

const StatusBadge = ({ status }: { status: string }) => (
  <span className={`badge badge-${status.toLowerCase()}`}>{status}</span>
)

const Progress = () => {
  const dispatch = useAppDispatch()
  const { lessons, bookings, loading } = useAppSelector((state: RootState) => state.booking)
  const { user } = useAppSelector((state: RootState) => state.auth)

  useEffect(() => {
    dispatch(fetchMyLessons())
    dispatch(fetchMyBookings())
  }, [dispatch])

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner" />
      </div>
    )
  }

  // ─── Compute progress stats from local data ───────────────
  const totalLessons = lessons?.length || 0
  const completedLessons = lessons?.filter(l => l.status === 'COMPLETED') || []
  const scheduledLessons = lessons?.filter(l => l.status === 'SCHEDULED') || []
  const cancelledLessons = lessons?.filter(l => l.status === 'CANCELLED') || []

  const totalMinutes = completedLessons.reduce((sum, l) => sum + (l.trainingDuration || 0), 0)
  const totalHours = Math.round((totalMinutes / 60) * 10) / 10
  const completionRate = totalLessons > 0 ? Math.round((completedLessons.length / totalLessons) * 100) : 0

  // Status distribution for pie chart
  const statusDistribution = [
    { status: 'SCHEDULED', count: scheduledLessons.length },
    { status: 'COMPLETED', count: completedLessons.length },
    { status: 'CANCELLED', count: cancelledLessons.length },
  ].filter(d => d.count > 0)

  // Vehicle type distribution from bookings
  const vehicleTypeCounts: Record<string, number> = {}
  bookings?.forEach(b => {
    vehicleTypeCounts[b.vehicleType] = (vehicleTypeCounts[b.vehicleType] || 0) + 1
  })
  const vehicleData = Object.entries(vehicleTypeCounts).map(([type, count]) => ({ type, count }))

  // Instructors from lessons
  const instructorCounts: Record<number, { name: string; count: number }> = {}
  lessons?.forEach(l => {
    if (l.instructor) {
      if (!instructorCounts[l.instructorId]) {
        instructorCounts[l.instructorId] = { name: l.instructor.name, count: 0 }
      }
      instructorCounts[l.instructorId].count++
    }
  })
  const instructors = Object.values(instructorCounts).sort((a, b) => b.count - a.count)

  // Recent lessons
  const recentLessons = [...(lessons || [])]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 10)

  const noData = totalLessons === 0

  return (
    <div className="progress-page">
      <div className="welcome-section">
        <h2>My Progress Report</h2>
        <p>{user?.name || 'Student'} · Track your driving lesson progress</p>
      </div>

      {noData ? (
        <div className="empty-state card">
          <h3>No lesson data yet</h3>
          <p>Book a lesson and once the admin generates a schedule, your progress will appear here.</p>
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="progress-stats">
            <div className="stat-card">
              <div className="stat-icon">📚</div>
              <div className="stat-content">
                <span className="stat-value">{totalLessons}</span>
                <span className="stat-label">Total Lessons</span>
              </div>
            </div>
            <div className="stat-card stat-card--success">
              <div className="stat-icon">✅</div>
              <div className="stat-content">
                <span className="stat-value">{completedLessons.length}</span>
                <span className="stat-label">Completed</span>
              </div>
            </div>
            <div className="stat-card stat-card--info">
              <div className="stat-icon">📅</div>
              <div className="stat-content">
                <span className="stat-value">{scheduledLessons.length}</span>
                <span className="stat-label">Scheduled</span>
              </div>
            </div>
            <div className="stat-card stat-card--warning">
              <div className="stat-icon">⏱️</div>
              <div className="stat-content">
                <span className="stat-value">{totalHours}h</span>
                <span className="stat-label">Training Hours</span>
              </div>
            </div>
          </div>

          {/* Charts Row */}
          <div className="charts-row">
            {/* Lesson Status Distribution */}
            <div className="chart-card card">
              <div className="chart-card__header">
                <h3>📊 Lesson Breakdown</h3>
              </div>
              <div className="chart-card__body">
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={statusDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={85}
                      dataKey="count"
                      nameKey="status"
                      paddingAngle={3}
                    >
                      {statusDistribution.map((entry) => (
                        <Cell key={entry.status} fill={COLORS[entry.status as keyof typeof COLORS] || '#94a3b8'} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="pie-center-label">
                  <span className="pie-center-label__value">{completionRate}%</span>
                  <span className="pie-center-label__label">Completed</span>
                </div>
              </div>
            </div>

            {/* Vehicle Type Distribution */}
            {vehicleData.length > 0 && (
              <div className="chart-card card">
                <div className="chart-card__header">
                  <h3>🚗 Vehicle Type</h3>
                </div>
                <div className="chart-card__body">
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={vehicleData} barSize={50}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="type" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                      <Tooltip />
                      <Bar dataKey="count" name="Bookings" radius={[6, 6, 0, 0]}>
                        {vehicleData.map((entry) => (
                          <Cell key={entry.type} fill={VEHICLE_COLORS[entry.type] || '#94a3b8'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* Top Instructors */}
            {instructors.length > 0 && (
              <div className="chart-card card">
                <div className="chart-card__header">
                  <h3>👨‍🏫 Instructors</h3>
                </div>
                <div className="chart-card__body">
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart
                      data={instructors}
                      layout="vertical"
                      barSize={20}
                      margin={{ left: 20, right: 20 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
                      <XAxis type="number" tick={{ fontSize: 11 }} allowDecimals={false} />
                      <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={80} />
                      <Tooltip />
                      <Bar dataKey="count" name="Lessons" fill="#8b5cf6" radius={[0, 6, 6, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </div>

          {/* Recent Lessons Table */}
          {recentLessons.length > 0 && (
            <div className="recent-lessons card">
              <h3>📋 Recent Lessons</h3>
              <div className="table-wrapper">
                <table className="lessons-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Slot</th>
                      <th>Duration</th>
                      <th>Instructor</th>
                      <th>Status</th>
                      <th>Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentLessons.map(lesson => (
                      <tr key={lesson.id}>
                        <td>{lesson.scheduledDate || lesson.createdAt?.split('T')[0]}</td>
                        <td>{lesson.slot} ({getSlotTimeRange(lesson.slot)})</td>
                        <td>{lesson.trainingDuration} min</td>
                        <td>{lesson.instructor?.name || '—'}</td>
                        <td><StatusBadge status={lesson.status} /></td>
                        <td className="notes-cell">{lesson.notes || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Completion Progress Bar */}
          <div className="completion-bar card">
            <div className="completion-bar__header">
              <h3>🎯 Overall Progress</h3>
              <span className="completion-bar__percentage">{completionRate}% Complete</span>
            </div>
            <div className="completion-bar__track">
              <div
                className="completion-bar__fill"
                style={{ width: `${Math.min(completionRate, 100)}%` }}
              />
            </div>
            <div className="completion-bar__details">
              <span>✅ {completedLessons.length} completed</span>
              <span>📅 {scheduledLessons.length} scheduled</span>
              <span>⏱️ {totalHours} hours trained</span>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default Progress
