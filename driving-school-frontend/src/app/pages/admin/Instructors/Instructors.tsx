import { useState, useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { RootState } from '@/store'
import { fetchInstructors, createInstructor, updateInstructor, deleteInstructor, toggleInstructorAvailable } from '@/store/slices/adminSlice'
import { useFormValidation } from '@/hooks/useFormValidation'
import { instructorSchema } from '@/utils/validation'
import FieldError from '@/components/FieldError/FieldError'
import type { Instructor } from '@/types'
import toast from 'react-hot-toast'
import './Instructors.scss'

const Instructors = () => {
  const dispatch = useAppDispatch()
  const { instructors, loading } = useAppSelector((state: RootState) => state.admin)
  const [showForm, setShowForm] = useState(false)
  const [editingInstructor, setEditingInstructor] = useState<Instructor | null>(null)
  const { errors: addErrors, validate: validateAdd, clearErrors: clearAddErrors } = useFormValidation(instructorSchema)
  const { errors: editErrors, validate: validateEdit, clearErrors: clearEditErrors } = useFormValidation(instructorSchema)
  const [editForm, setEditForm] = useState<{ name: string; instructorLevel: 'JUNIOR' | 'INTERMEDIATE' | 'SENIOR' }>({
    name: '',
    instructorLevel: 'INTERMEDIATE',
  })
  const [formData, setFormData] = useState<{ name: string; instructorLevel: 'JUNIOR' | 'INTERMEDIATE' | 'SENIOR' }>({
    name: '',
    instructorLevel: 'INTERMEDIATE',
  })

  useEffect(() => {
    dispatch(fetchInstructors())
  }, [dispatch])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateAdd(formData)) return

    await dispatch(createInstructor(formData))
    toast.success('Instructor created successfully')
    setFormData({ name: '', instructorLevel: 'INTERMEDIATE' })
    clearAddErrors()
    setShowForm(false)
  }

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this instructor?')) {
      await dispatch(deleteInstructor(id))
      toast.success('Instructor deleted successfully')
    }
  }

  const handleToggle = async (instructor: Instructor) => {
    const result = await dispatch(toggleInstructorAvailable(instructor.id))
    if (toggleInstructorAvailable.fulfilled.match(result)) {
      toast.success('Instructor availability toggled successfully')
    } else {
      toast.error((result.payload as string) || 'Failed to toggle instructor availability')
    }
  }

  const handleEdit = (instructor: Instructor) => {
    setEditingInstructor(instructor)
    setEditForm({
      name: instructor.name,
      instructorLevel: instructor.instructorLevel || 'INTERMEDIATE',
    })
    clearEditErrors()
  }

  const handleSaveEdit = async () => {
    if (!editingInstructor) return
    if (!validateEdit(editForm)) return
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
          <form onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label>Name</label>
              <input
                type="text"
                className={`form-input ${addErrors.name ? 'input-error' : ''}`}
                value={formData.name}
                onChange={(e) => {
                  setFormData({ ...formData, name: e.target.value })
                  clearAddErrors('name')
                }}
                placeholder="Enter instructor name"
              />
              <FieldError message={addErrors.name} />
            </div>
            <div className="form-group">
              <label>Instructor Level</label>
              <select
                className="form-input"
                value={formData.instructorLevel}
                onChange={(e) => setFormData({ ...formData, instructorLevel: e.target.value as 'JUNIOR' | 'INTERMEDIATE' | 'SENIOR' })}
              >
                <option value="JUNIOR">Junior</option>
                <option value="INTERMEDIATE">Intermediate</option>
                <option value="SENIOR">Senior</option>
              </select>
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
            <div key={instructor.id} className={'instructor-card card' + (!instructor.available ? ' inactive' : '')}>
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
                  <span className="label">Status</span>
                  <span className={'value status-' + (instructor.available ? 'active' : 'inactive')}>
                    {instructor.available ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
              <div className="instructor-actions">
                <button
                  className={'btn toggle-btn ' + (instructor.available ? 'btn-danger' : 'btn-success')}
                  onClick={() => handleToggle(instructor)}
                >
                  {instructor.available ? 'Mark Inactive' : 'Mark Active'}
                </button>
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
                className={`form-input ${editErrors.name ? 'input-error' : ''}`}
                value={editForm.name}
                onChange={(e) => {
                  setEditForm({ ...editForm, name: e.target.value })
                  clearEditErrors('name')
                }}
                placeholder="Enter instructor name"
              />
              <FieldError message={editErrors.name} />
            </div>
            <div className="form-group">
              <label>Instructor Level</label>
              <select
                className="form-input"
                value={editForm.instructorLevel}
                onChange={(e) => setEditForm({ ...editForm, instructorLevel: e.target.value as 'JUNIOR' | 'INTERMEDIATE' | 'SENIOR' })}
              >
                <option value="JUNIOR">Junior</option>
                <option value="INTERMEDIATE">Intermediate</option>
                <option value="SENIOR">Senior</option>
              </select>
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