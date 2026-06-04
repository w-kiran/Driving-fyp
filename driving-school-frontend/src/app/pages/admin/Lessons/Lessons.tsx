import { useEffect, useState, useCallback } from 'react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { RootState } from '@/store'
import { fetchLessons, updateLesson, deleteLesson, completeLesson, fetchInstructors, fetchVehicles } from '@/store/slices/adminSlice'
import { getSlotTimeRange } from '@/utils/slotTimes'
import { useServerSort } from '@/hooks/useServerSort'
import SortableHeader from '@/components/SortableHeader/SortableHeader'
import toast from 'react-hot-toast'
import { Lesson, Slot, VehicleType } from '@/types'
import './Lessons.scss'

const VEHICLE_TYPES: VehicleType[] = ['CAR', 'BIKE', 'SCOOTER']
const VEHICLE_LABELS: Record<VehicleType, string> = { CAR: 'Car', BIKE: 'Bike', SCOOTER: 'Scooter' }
const VEHICLE_ICONS: Record<VehicleType, string> = { CAR: '🚗', BIKE: '🏍️', SCOOTER: '🛵' }

const Lessons = () => {
  const dispatch = useAppDispatch()
  const { lessons, instructors, vehicles, loading } = useAppSelector((state: RootState) => state.admin)
  const [filter, setFilter] = useState<'all' | 'SCHEDULED' | 'COMPLETED'>('all')
  const [activeType, setActiveType] = useState<VehicleType>('CAR')
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null)
  const [editForm, setEditForm] = useState({
    slot: '',
    instructorId: 0,
    vehicleId: 0,
    trainingDuration: 60
  })

  const fetchSortedLessons = useCallback(
    (sortBy: string, sortOrder: 'asc' | 'desc') => {
      dispatch(fetchLessons({ sortBy, sortOrder }))
    },
    [dispatch],
  )

  const { sortConfig, requestSort } = useServerSort(fetchSortedLessons, 'id', 'desc')

  // Fetch instructors/vehicles on mount (always needed for edit modal)
  useEffect(() => {
    dispatch(fetchInstructors())
    dispatch(fetchVehicles())
  }, [dispatch])

  const filteredByStatus = filter === 'all'
    ? lessons
    : lessons?.filter((l) => l.status === filter)

  const displayedLessons = filteredByStatus?.filter((l) => l.vehicle?.type === activeType)

  const handleEdit = (lesson: Lesson) => {
    setEditingLesson(lesson)
    setEditForm({
      slot: lesson.slot,
      instructorId: lesson.instructorId,
      vehicleId: lesson.vehicleId,
      trainingDuration: lesson.trainingDuration
    })
  }

  const handleSaveEdit = async () => {
    if (!editingLesson) return
    await dispatch(updateLesson({
      id: editingLesson.id,
      slot: editForm.slot as Slot,
      instructorId: editForm.instructorId,
      vehicleId: editForm.vehicleId,
      trainingDuration: editForm.trainingDuration
    }))
    toast.success('Lesson updated')
    setEditingLesson(null)
    dispatch(fetchLessons({ sortBy: sortConfig.key, sortOrder: sortConfig.direction }))
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this lesson?')) return
    await dispatch(deleteLesson(id))
    toast.success('Lesson deleted')
  }

  const handleComplete = async (id: number, passed: boolean) => {
    await dispatch(completeLesson({ id, passed }))
    toast.success(passed ? 'Lesson marked as passed' : 'Lesson marked as failed')
    dispatch(fetchLessons({ sortBy: sortConfig.key, sortOrder: sortConfig.direction }))
  }

  const countsByType = VEHICLE_TYPES.reduce(
    (acc, t) => {
      const filtered = filter === 'all' ? lessons : lessons?.filter((l) => l.status === filter)
      acc[t] = (filtered || []).filter((l) => l.vehicle?.type === t).length
      return acc
    },
    {} as Record<VehicleType, number>,
  )

  return (
    <div className="lessons-page">
      <div className="page-header">
        <h2>Lessons Management</h2>
        <div className="filter-tabs">
          {(['all', 'SCHEDULED', 'COMPLETED'] as const).map((f) => (
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
        <div className="loading-container"><div className="spinner" /></div>
      ) : displayedLessons?.length === 0 ? (
        <div className="empty-state card">
          <h3>No {VEHICLE_LABELS[activeType]} lessons found</h3>
        </div>
      ) : (
        <div className="lessons-table-container card">
          <table className="lessons-table">
            <thead>
              <tr>
                <SortableHeader label="Priority" sortKey="priorityRank" sortConfig={sortConfig} onSort={requestSort} />
                <SortableHeader label="ID" sortKey="id" sortConfig={sortConfig} onSort={requestSort} />
                <SortableHeader label="Student" sortKey="student.user.name" sortConfig={sortConfig} onSort={requestSort} />
                <SortableHeader label="Instructor" sortKey="instructor.name" sortConfig={sortConfig} onSort={requestSort} />
                <SortableHeader label="Date" sortKey="scheduledDate" sortConfig={sortConfig} onSort={requestSort} />
                <SortableHeader label="Slot" sortKey="slot" sortConfig={sortConfig} onSort={requestSort} />
                <SortableHeader label="Duration" sortKey="trainingDuration" sortConfig={sortConfig} onSort={requestSort} />
                <SortableHeader label="Status" sortKey="status" sortConfig={sortConfig} onSort={requestSort} />
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {displayedLessons?.map((lesson) => (
                <tr key={lesson.id}>
                  <td>
                    {lesson.priorityRank ? (
                      <span className={`priority-token priority-token--${lesson.priorityRank <= 3 ? 'high' : lesson.priorityRank <= 6 ? 'mid' : 'low'}`}>
                        <span className="priority-token__rank">{lesson.priorityRank}</span>
                        <span className="priority-token__label">PRIORITY</span>
                      </span>
                    ) : (
                      <span className="priority-token priority-token--na">
                        <span className="priority-token__rank">—</span>
                        <span className="priority-token__label">N/A</span>
                      </span>
                    )}
                  </td>
                  <td>#{lesson.id}</td>
                  <td>{lesson.student?.user?.name || 'Student'}</td>
                  <td>{lesson.instructor?.name || 'N/A'}</td>
                  <td>{lesson.scheduledDate || '-'}</td>
                  <td>{lesson.slot} ({getSlotTimeRange(lesson.slot)})</td>
                  <td>{lesson.trainingDuration} min</td>
                  <td>
                    <span className={`badge badge-${lesson.status.toLowerCase()}`}>
                      {lesson.status}
                    </span>
                  </td>
                  <td>
                    <div className="action-btns">
                      {lesson.status === 'SCHEDULED' && (
                        <>
                          <button className="edit-btn" onClick={() => handleEdit(lesson)}>Edit</button>
                          <button className="pass-btn" onClick={() => handleComplete(lesson.id, true)}>Pass</button>
                          <button className="fail-btn" onClick={() => handleComplete(lesson.id, false)}>Fail</button>
                          <button className="delete-btn" onClick={() => handleDelete(lesson.id)}>Delete</button>
                        </>
                      )}
                      {lesson.status === 'COMPLETED' && (
                        <span className="completed-text">
                          {lesson.notes || 'Completed'}
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editingLesson && (
        <div className="modal-overlay" onClick={() => setEditingLesson(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Edit Lesson #{editingLesson.id}</h3>
            <div className="form-group">
              <label>Slot</label>
              <select
                value={editForm.slot}
                onChange={(e) => setEditForm({ ...editForm, slot: e.target.value })}
              >
                <option value="MORNING">Morning</option>
                <option value="AFTERNOON">Afternoon</option>
                <option value="EVENING">Evening</option>
              </select>
            </div>
            <div className="form-group">
              <label>Instructor</label>
              <select
                value={editForm.instructorId}
                onChange={(e) => setEditForm({ ...editForm, instructorId: Number(e.target.value) })}
              >
                {instructors?.map((inst) => (
                  <option key={inst.id} value={inst.id}>{inst.name}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Vehicle</label>
              <select
                value={editForm.vehicleId}
                onChange={(e) => setEditForm({ ...editForm, vehicleId: Number(e.target.value) })}
              >
                {vehicles?.filter(v => v.active).map((v) => (
                  <option key={v.id} value={v.id}>{v.name} ({v.vehicleNumber})</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Duration (min)</label>
              <input
                type="number"
                value={editForm.trainingDuration}
                onChange={(e) => setEditForm({ ...editForm, trainingDuration: Number(e.target.value) })}
                min={30}
                max={120}
              />
            </div>
            <div className="modal-actions">
              <button className="btn btn-primary" onClick={handleSaveEdit}>Save</button>
              <button className="btn btn-secondary" onClick={() => setEditingLesson(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Lessons
