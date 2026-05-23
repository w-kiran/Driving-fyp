import { useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { RootState } from '@/store'
import { fetchStudents, deleteStudent } from '@/store/slices/adminSlice'
import toast from 'react-hot-toast'
import './Students.scss'

const Students = () => {
  const dispatch = useAppDispatch()
  const { students, loading } = useAppSelector((state: RootState) => state.admin)

  useEffect(() => {
    dispatch(fetchStudents())
  }, [dispatch])

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this student? This will also delete all their bookings and lessons.')) {
      await dispatch(deleteStudent(id))
      toast.success('Student deleted successfully')
    }
  }

  return (
    <div className="students-page">
      <div className="page-header">
        <h2>Students Management</h2>
      </div>

      {loading ? (
        <div className="loading-container"><div className="spinner" /></div>
      ) : students?.length === 0 ? (
        <div className="empty-state card">
          <h3>No students</h3>
          <p>Students will appear here after registration.</p>
        </div>
      ) : (
        <div className="students-table-container card">
          <table className="students-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Address</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {students?.map((student) => (
                <tr key={student.id}>
                  <td>#{student.id}</td>
                  <td>{student.user?.name || student.name}</td>
                  <td>{student.user?.email}</td>
                  <td>{student.phone}</td>
                  <td>{student.address}</td>
                  <td>
                    <button className="delete-btn" onClick={() => handleDelete(student.id)}>
                      Delete
                    </button>
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

export default Students