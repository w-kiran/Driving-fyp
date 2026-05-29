import { useState, useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { RootState } from '@/store'
import { fetchInstructors, createInstructor, updateInstructor, deleteInstructor } from '@/store/slices/adminSlice'
import type { Instructor } from '@/types'
import toast from 'react-hot-toast'
import './Instructors.scss'

const Instructors = () => {
  const dispatch = useAppDispatch()
  const { instructors, loading } = useAppSelector((state: RootState) => state.admin)
  const [showForm, setShowForm] = useState(false)
  const [editingInstructor, setEditingInstructor] = useState<Instructor | null>(null)
  const [editForm, setEditForm] = useState({
    name: '',
    instructorLevel: 'INTERMEDIATE',
    availableSlots: ['MORNING', 'AFTERNOON', 'EVENING'] as string[],
  })
  const [formData, setFormData] = useState({
    name: '',
    instructorLevel: 'INTERMEDIATE',
    availableSlots: ['MORNING', 'AFTERNOON', 'EVENING'] as string[],
  })

  useEffect(() => {
    dispatch(fetchInstructors())
  }, [dispatch])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name) {
      toast.error('Please enter instructor name')
      return
    }

    await dispatch(createInstructor(formData))
    toast.success('Instructor added successfully')
    setFormData({ name: '', instructorLevel: 'INTERMEDIATE', availableSlots: ['MORNING', 'AFTERNOON', 'EVENING'] })
    setShowForm(false)
  }

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this instructor?')) {
      await dispatch(deleteInstructor(id))
      toast.success('Instructor deleted')
    }
  }

  const handleSlotChange = (slot: string) => {
    const slots = formData.availableSlots.includes(slot)
      ? formData.availableSlots.filter((s) => s !== slot)
      : [...formData.availableSlots, slot]
    setFormData({ ...formData, availableSlots: slots })
  }

  const handleEditSlotChange = (slot: string) => {
    const slots = editForm.availableSlots.includes(slot)
      ? editForm.availableSlots.filter((s) => s !== slot)
      : [...editForm.availableSlots, slot]
    setEditForm({ ...editForm, availableSlots: slots })
  }

  const handleEdit = (instructor: Instructor) => {
    setEditingInstructor(instructor)
    setEditForm({
      name: instructor.name,
      instructorLevel: instructor.instructorLevel || 'INTERMEDIATE',
      availableSlots: instructor.availableSlots || [],
    })
  }

  const handleSaveEdit = async () => {
    if (!editingInstructor) return
    if (!editForm.name) {
      toast.error('Please enter instructor name')
      return
    }
    const result = await dispatch(updateInstructor({ id: editingInstructor.id, data: editForm }))
    if (updateInstructor.fulfilled.match(result)) {
      toast.success('Instructor updated successfully')
      setEditingInstructor(null)
    } else {
      toast.error(result.payload as string || 'Failed to update instructor')
    }
  }

  return (
    <div className="instructors-page">
      <div className="page-header">
        <h2>Instructors</h2>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : 'Add Instructor'}
        </button>
      </div>

      {showForm && (
        <div className="add-form card">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Name</label>
              <input
                type="text"
                className="form-input"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter instructor name"
              />
            </div>
            <div className="form-group">
              <label>Instructor Level</label>
              <select
                className="form-input"
                value={formData.instructorLevel}
                onChange={(e) => setFormData({ ...formData, instructorLevel: e.target.value })}
              >
                <option value="JUNIOR">Junior</option>
                <option value="INTERMEDIATE">Intermediate</option>
                <option value="SENIOR">Senior</option>
              </select>
            </div>
            <div className="form-group">
              <label>Available Slots</label>
              <div className="slot-options">
                {['MORNING', 'AFTERNOON', 'EVENING'].map((slot) => (
                  <label key={slot} className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={formData.availableSlots.includes(slot)}
                      onChange={() => handleSlotChange(slot)}
                    />
                    {slot}
                  </label>
                ))}
              </div>
            </div>
            <button type="submit" className="btn btn-primary">
              Add Instructor
            </button>
          </form>
        </div>
      )}

      {loading ? (
        <div className="loading-container">
          <div className="spinner" />
        </div>
      ) : instructors?.length === 0 ? (
        <div className="empty-state card">
          <h3>No instructors</h3>
          <p>Add instructors to start scheduling lessons.</p>
        </div>
      ) : (
        <div className="instructors-grid">
          {instructors.map((instructor) => (
            <div key={instructor.id} className="instructor-card card">
              <div className="instructor-header">
                <h3>{instructor.name}</h3>
                <div className="header-actions">
                  <button className="edit-btn" onClick={() => handleEdit(instructor)}>
                    Edit
                  </button>
                  <button className="delete-btn" onClick={() => handleDelete(instructor.id)}>
                    Delete
                  </button>
                </div>
              </div>
              <div className="instructor-details">
                <div className="detail">
                  <span className="label">Level</span>
                  <span className={`value level-${(instructor.instructorLevel || 'INTERMEDIATE').toLowerCase()}`}>
                    {instructor.instructorLevel || 'Intermediate'}
                  </span>
                </div>
                <div className="detail">
                  <span className="label">Daily Lessons</span>
                  <span className="value">{instructor.dailyLessonCount}</span>
                </div>
                <div className="detail">
                  <span className="label">Available Slots</span>
                  <span className="value">
                    {instructor.availableSlots?.join(', ') || 'Not set'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {editingInstructor && (
        <div className="modal-overlay" onClick={() => setEditingInstructor(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Edit Instructor #{editingInstructor.id}</h3>
            <div className="form-group">
              <label>Name</label>
              <input
                type="text"
                className="form-input"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                placeholder="Enter instructor name"
              />
            </div>
            <div className="form-group">
              <label>Instructor Level</label>
              <select
                className="form-input"
                value={editForm.instructorLevel}
                onChange={(e) => setEditForm({ ...editForm, instructorLevel: e.target.value })}
              >
                <option value="JUNIOR">Junior</option>
                <option value="INTERMEDIATE">Intermediate</option>
                <option value="SENIOR">Senior</option>
              </select>
            </div>
            <div className="form-group">
              <label>Available Slots</label>
              <div className="slot-options">
                {['MORNING', 'AFTERNOON', 'EVENING'].map((slot) => (
                  <label key={slot} className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={editForm.availableSlots.includes(slot)}
                      onChange={() => handleEditSlotChange(slot)}
                    />
                    {slot}
                  </label>
                ))}
              </div>
            </div>
            <div className="modal-actions">
              <button className="btn btn-primary" onClick={handleSaveEdit}>Save</button>
              <button className="btn btn-secondary" onClick={() => setEditingInstructor(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Instructors