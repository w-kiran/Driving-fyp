import { useState, useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { RootState } from '@/store'
import { fetchVehicles, createVehicle, updateVehicle, toggleVehicleActive, deleteVehicle } from '@/store/slices/adminSlice'
import toast from 'react-hot-toast'
import './Vehicles.scss'

const Vehicles = () => {
  const dispatch = useAppDispatch()
  const { vehicles, loading } = useAppSelector((state: RootState) => state.admin)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    type: 'CAR' as 'CAR' | 'BIKE' | 'SCOOTER',
  })
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editType, setEditType] = useState<'CAR' | 'BIKE' | 'SCOOTER'>('CAR')

  useEffect(() => {
    dispatch(fetchVehicles())
  }, [dispatch])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await dispatch(createVehicle(formData))
    toast.success('Vehicle added successfully')
    setFormData({ type: 'CAR' })
    setShowForm(false)
  }

  const handleToggle = async (id: number) => {
    await dispatch(toggleVehicleActive(id))
    toast.success('Vehicle status updated')
  }

  const handleDelete = async (id: number, type: string) => {
    if (window.confirm(`Are you sure you want to delete the ${type} vehicle?`)) {
      await dispatch(deleteVehicle(id))
      toast.success('Vehicle deleted')
    }
  }

  const handleEdit = (id: number, currentType: 'CAR' | 'BIKE' | 'SCOOTER') => {
    setEditingId(id)
    setEditType(currentType)
  }

  const handleEditSubmit = async (id: number) => {
    await dispatch(updateVehicle({ id, type: editType }))
    toast.success('Vehicle updated')
    setEditingId(null)
  }

  return (
    <div className="vehicles-page">
      <div className="page-header">
        <h2>Vehicles</h2>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : 'Add Vehicle'}
        </button>
      </div>

      {showForm && (
        <div className="add-form card">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Vehicle Type</label>
              <select
                className="form-select"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as 'CAR' | 'BIKE' | 'SCOOTER' })}
              >
                <option value="CAR">Car</option>
                <option value="BIKE">Bike</option>
                <option value="SCOOTER">Scooter</option>
              </select>
            </div>
            <button type="submit" className="btn btn-primary">Add Vehicle</button>
          </form>
        </div>
      )}

      {loading ? (
        <div className="loading-container"><div className="spinner" /></div>
      ) : vehicles?.length === 0 ? (
        <div className="empty-state card">
          <h3>No vehicles</h3>
          <p>Add vehicles to start scheduling lessons.</p>
        </div>
      ) : (
        <div className="vehicles-grid">
          {vehicles.map((vehicle) => (
            <div key={vehicle.id} className="vehicle-card card">
              <div className="vehicle-header">
                {editingId === vehicle.id ? (
                  <div className="edit-inline">
                    <select
                      className="form-select"
                      value={editType}
                      onChange={(e) => setEditType(e.target.value as 'CAR' | 'BIKE' | 'SCOOTER')}
                    >
                      <option value="CAR">Car</option>
                      <option value="BIKE">Bike</option>
                      <option value="SCOOTER">Scooter</option>
                    </select>
                    <button className="btn btn-primary btn-sm" onClick={() => handleEditSubmit(vehicle.id)}>
                      Save
                    </button>
                    <button className="btn btn-secondary btn-sm" onClick={() => setEditingId(null)}>
                      Cancel
                    </button>
                  </div>
                ) : (
                  <h3>{vehicle.type}</h3>
                )}
                <div className="vehicle-actions">
                  <button
                    className={`toggle-btn ${vehicle.active ? 'active' : ''}`}
                    onClick={() => handleToggle(vehicle.id)}
                  >
                    {vehicle.active ? 'Active' : 'Inactive'}
                  </button>
                  <button
                    className="edit-btn"
                    onClick={() => handleEdit(vehicle.id, vehicle.type)}
                    title="Edit vehicle"
                  >
                    ✏️
                  </button>
                  <button
                    className="delete-btn"
                    onClick={() => handleDelete(vehicle.id, vehicle.type)}
                    title="Delete vehicle"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Vehicles