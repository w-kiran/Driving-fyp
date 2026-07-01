import { useEffect, useMemo, useState } from 'react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { RootState } from '@/store'
import { fetchDashboardStats } from '@/store/slices/adminSlice'
import { useDebounce } from '@/hooks/useDebounce'
import { useSort } from '@/hooks/useSort'
import SortableHeader from '@/components/SortableHeader/SortableHeader'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line
} from 'recharts'
import './Dashboard.scss'

const COLORS = {
  primary: '#2563eb',
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  purple: '#8b5cf6',
  pink: '#ec4899',
  cyan: '#06b6d4',
  orange: '#f97316',
}

const STATUS_COLORS: Record<string, string> = {
  PENDING: COLORS.warning,
  SCHEDULED: COLORS.primary,
  COMPLETED: COLORS.success,
  CANCELLED: COLORS.error,
}

const VEHICLE_COLORS: Record<string, string> = {
  CAR: COLORS.primary,
  BIKE: COLORS.success,
  SCOOTER: COLORS.warning,
}

const PIE_COLORS = [COLORS.primary, COLORS.success, COLORS.warning, COLORS.error, COLORS.purple]

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="chart-tooltip">
        <p className="chart-tooltip__label">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="chart-tooltip__value" style={{ color: entry.color }}>
            {entry.name}: {entry.value}
          </p>
        ))}
      </div>
    )
  }
  return null
}

const AdminDashboard = () => {
  const dispatch = useAppDispatch()
  const { stats, loading } = useAppSelector((state: RootState) => state.admin)
  const [searchTerm, setSearchTerm] = useState('')
  const debouncedSearch = useDebounce(searchTerm, 300)

  useEffect(() => {
    dispatch(fetchDashboardStats())
  }, [dispatch])

  const instructorLoad = stats?.instructorLoad || []
  const { sortedData, sortConfig, requestSort } = useSort(instructorLoad, 'dailyLessonCount', 'desc')

  const filteredInstructors = useMemo(() => {
    if (!debouncedSearch) return sortedData
    const q = debouncedSearch.toLowerCase()
    return sortedData.filter((inst) =>
      inst.name?.toLowerCase().includes(q)
    )
  }, [sortedData, debouncedSearch])

  if (loading || !stats) {
    return (
      <div className="loading-container">
        <div className="spinner" />
      </div>
    )
  }

  const charts = stats.charts
  const bookingTrends = charts?.bookingTrends || []
  const lessonDistribution = charts?.lessonDistribution || []
  const bookingDistribution = charts?.bookingDistribution || []
  const bookingByType = charts?.bookingByType || []

  // Compute totals for pie charts
  const lessonTotal = lessonDistribution.reduce((sum, d) => sum + d.count, 0)
  const bookingTotal = bookingDistribution.reduce((sum, d) => sum + d.count, 0)
  const typeTotal = bookingByType.reduce((sum, d) => sum + d.count, 0)

  // Lesson completion rate
  const completedLessons = lessonDistribution.find(d => d.status === 'COMPLETED')?.count || 0
  const completionRate = lessonTotal > 0 ? Math.round((completedLessons / lessonTotal) * 100) : 0

  // Pending booking conversion rate
  const pendingBookings = stats.bookings.pending
  const totalBookings = bookingTotal
  const pendingRate = totalBookings > 0 ? Math.round((pendingBookings / totalBookings) * 100) : 0

  return (
    <div className="admin-dashboard">
      <div className="welcome-section">
        <h2>Admin Dashboard</h2>
        <p>Overview of your driving school system</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">👨‍🎓</div>
          <div className="stat-content">
            <span className="stat-value">{stats.students}</span>
            <span className="stat-label">Total Students</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">👨‍🏫</div>
          <div className="stat-content">
            <span className="stat-value">{stats.instructors}</span>
            <span className="stat-label">Instructors</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🚗</div>
          <div className="stat-content">
            <span className="stat-value">{stats.vehicles}</span>
            <span className="stat-label">Active Vehicles</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📋</div>
          <div className="stat-content">
            <span className="stat-value">{stats.bookings.pending}</span>
            <span className="stat-label">Pending Bookings</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📅</div>
          <div className="stat-content">
            <span className="stat-value">{stats.lessons.scheduled}</span>
            <span className="stat-label">Scheduled Lessons</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <span className="stat-value">{stats.lessons.completed}</span>
            <span className="stat-label">Completed Lessons</span>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="charts-grid">
        {/* Booking Trends */}
        <div className="chart-card card">
          <div className="chart-card__header">
            <h3>📈 Booking Trends (7 Days)</h3>
            <span className="chart-card__period">Daily bookings by vehicle type</span>
          </div>
          <div className="chart-card__body">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={bookingTrends} barSize={20} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={(val) => val.slice(5)} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
                <Bar dataKey="CAR" name="Car" fill={VEHICLE_COLORS.CAR} radius={[4, 4, 0, 0]} />
                <Bar dataKey="BIKE" name="Bike" fill={VEHICLE_COLORS.BIKE} radius={[4, 4, 0, 0]} />
                <Bar dataKey="SCOOTER" name="Scooter" fill={VEHICLE_COLORS.SCOOTER} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Lesson Status Distribution */}
        <div className="chart-card card">
          <div className="chart-card__header">
            <h3>🎯 Lesson Status</h3>
            <span className="chart-card__period">Distribution of lesson states</span>
          </div>
          <div className="chart-card__body chart-card__body--pie">
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={lessonDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  dataKey="count"
                  nameKey="status"
                  paddingAngle={3}
                >
                  {lessonDistribution.map((entry, index) => (
                    <Cell key={entry.status || index} fill={STATUS_COLORS[entry.status || ''] || PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="pie-center-label">
              <span className="pie-center-label__value">{completionRate}%</span>
              <span className="pie-center-label__label">Completed</span>
            </div>
          </div>
        </div>

        {/* Booking Status Distribution */}
        <div className="chart-card card">
          <div className="chart-card__header">
            <h3>📋 Booking Status</h3>
            <span className="chart-card__period">All booking states breakdown</span>
          </div>
          <div className="chart-card__body chart-card__body--pie">
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={bookingDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  dataKey="count"
                  nameKey="status"
                  paddingAngle={3}
                >
                  {bookingDistribution.map((entry, index) => (
                    <Cell key={entry.status || index} fill={STATUS_COLORS[entry.status || ''] || PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="pie-center-label">
              <span className="pie-center-label__value">{pendingRate}%</span>
              <span className="pie-center-label__label">Pending</span>
            </div>
          </div>
        </div>

        {/* Vehicle Type Booking Distribution */}
        <div className="chart-card card">
          <div className="chart-card__header">
            <h3>🚗 Vehicle Type</h3>
            <span className="chart-card__period">Bookings by vehicle type</span>
          </div>
          <div className="chart-card__body chart-card__body--pie">
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={bookingByType}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  dataKey="count"
                  nameKey="type"
                  paddingAngle={3}
                >
                  {bookingByType.map((entry, index) => (
                    <Cell key={entry.type || index} fill={VEHICLE_COLORS[entry.type] || PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="pie-center-label">
              <span className="pie-center-label__value">{typeTotal}</span>
              <span className="pie-center-label__label">Total</span>
            </div>
          </div>
        </div>
      </div>

      {/* Weekly Trend Line Chart */}
      {bookingTrends.length > 0 && (
        <div className="chart-card card chart-card--full">
          <div className="chart-card__header">
            <h3>📊 Weekly Booking Overview</h3>
            <span className="chart-card__period">Total daily booking trend</span>
          </div>
          <div className="chart-card__body">
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={bookingTrends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={(val) => val.slice(5)} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="total" name="Total Bookings" stroke={COLORS.primary} strokeWidth={3} dot={{ fill: COLORS.primary, r: 5 }} activeDot={{ r: 7 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {instructorLoad.length > 0 && (
        <div className="instructor-load card">
          <div className="instructor-load__header">
            <h3>Instructor Workload</h3>
            <input
              type="text"
              placeholder="Search instructors..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          <table className="load-table">
            <thead>
              <tr>
                <SortableHeader label="Instructor" sortKey="name" sortConfig={sortConfig} onSort={requestSort} />
                <SortableHeader label="Daily Lessons" sortKey="dailyLessonCount" sortConfig={sortConfig} onSort={requestSort} />
                <SortableHeader label="Total Lessons" sortKey="totalLessons" sortConfig={sortConfig} onSort={requestSort} />
              </tr>
            </thead>
            <tbody>
              {filteredInstructors.length === 0 ? (
                <tr>
                  <td colSpan={3} className="no-results">No instructors match your search</td>
                </tr>
              ) : (
                filteredInstructors.map((instructor) => (
                  <tr key={instructor.id}>
                    <td>{instructor.name}</td>
                    <td>{instructor.dailyLessonCount}</td>
                    <td>{instructor.totalLessons}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default AdminDashboard
