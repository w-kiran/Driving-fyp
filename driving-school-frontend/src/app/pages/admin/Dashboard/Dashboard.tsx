import { useEffect, useMemo, useState } from 'react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { RootState } from '@/store'
import { fetchDashboardStats } from '@/store/slices/adminSlice'
import { useDebounce } from '@/hooks/useDebounce'
import { useSort } from '@/hooks/useSort'
import SortableHeader from '@/components/SortableHeader/SortableHeader'
import './Dashboard.scss'

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
            <span className="stat-label">Vehicles</span>
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
