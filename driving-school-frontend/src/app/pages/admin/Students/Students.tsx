import { useEffect, useState } from 'react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { RootState } from '@/store'
import { fetchStudents, deleteStudent } from '@/store/slices/adminSlice'
import { useSort } from '@/hooks/useSort'
import SortableHeader from '@/components/SortableHeader/SortableHeader'
import toast from 'react-hot-toast'
import './Students.scss'

const Students = () => {
  const dispatch = useAppDispatch()
  const { students, loading } = useAppSelector((state: RootState) => state.admin)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    dispatch(fetchStudents())
  }, [dispatch])

  const filteredStudents = students?.filter((student) =>
    student.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.user?.email?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || []

  const { sortedData, sortConfig, requestSort } = useSort(filteredStudents, 'id', 'desc')

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this student?')) {
      await dispatch(deleteStudent(id))
      toast.success('Student deleted successfully')
    }
  }

  return (
    <div className="students-page">
      <div className="page-header">
        <h2>Students</h2>
        <input
          type="text"
          placeholder="Search students..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>

      {loading ? (
        <div className="loading-container">
          <div className="spinner" />
        </div>
      ) : sortedData?.length === 0 ? (
        <div className="empty-state card">
          <h3>No students found</h3>
        </div>
      ) : (
        <div className="students-table-container card">
          <table className="students-table">
            <thead>
              <tr>
                <SortableHeader label="ID" sortKey="id" sortConfig={sortConfig} onSort={requestSort} />
                <SortableHeader label="Name" sortKey="user.name" sortConfig={sortConfig} onSort={requestSort} />
                <SortableHeader label="Email" sortKey="user.email" sortConfig={sortConfig} onSort={requestSort} />
                <SortableHeader label="Phone" sortKey="phone" sortConfig={sortConfig} onSort={requestSort} />
                <SortableHeader label="Address" sortKey="address" sortConfig={sortConfig} onSort={requestSort} />
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedData?.map((student) => (
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
