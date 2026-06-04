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
    name: '',
    vehicleNumber: '',
    type: 'CAR' as 'CAR' | 'BIKE' | 'SCOOTER',
  })
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editForm, setEditForm] = useState({
    name: '',
    vehicleNumber: '',
    type: 'CAR' as 'CAR' | 'BIKE' | 'SCOOTER',
  })

  useEffect(() => {
    dispatch(fetchVehicles())
  }, [dispatch])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await dispatch(createVehicle(formData))
    toast.success('Vehicle added successfully')
    setFormData({ name: '', vehicleNumber: '', type: 'CAR' })
    setShowForm(false)
  }

  const handleToggle = async (id: number) => {
    await dispatch(toggleVehicleActive(id))
    toast.success('Vehicle status updated')
  }

  const handleDelete = async (id: number, name: string) => {
    if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
      await dispatch(deleteVehicle(id))
      toast.success('Vehicle deleted')
    }
  }

  const handleEdit = (vehicle: { id: number; name: string; vehicleNumber: string; type: 'CAR' | 'BIKE' | 'SCOOTER' }) => {
    setEditingId(vehicle.id)
    setEditForm({
      name: vehicle.name,
      vehicleNumber: vehicle.vehicleNumber,
      type: vehicle.type,
    })
  }

  const handleEditSubmit = async (id: number) => {
    await dispatch(updateVehicle({ id, ...editForm }))
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
            <div className="form-row">
              <div className="form-group">
                <label>Vehicle Name</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Toyota Corolla"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Vehicle Number</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. BA 1 PA 1234"
                  value={formData.vehicleNumber}
                  onChange={(e) => setFormData({ ...formData, vehicleNumber: e.target.value })}
                  required
                />
              </div>
            </div>
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
                  <div className="edit-form-inline">
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Vehicle Name"
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    />
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Vehicle Number"
                      value={editForm.vehicleNumber}
                      onChange={(e) => setEditForm({ ...editForm, vehicleNumber: e.target.value })}
                    />
                    <select
                      className="form-select"
                      value={editForm.type}
                      onChange={(e) => setEditForm({ ...editForm, type: e.target.value as 'CAR' | 'BIKE' | 'SCOOTER' })}
                    >
                      <option value="CAR">Car</option>
                      <option value="BIKE">Bike</option>
                      <option value="SCOOTER">Scooter</option>
                    </select>
                    <div className="edit-actions">
                      <button className="btn btn-primary btn-sm" onClick={() => handleEditSubmit(vehicle.id)}>
                        Save
                      </button>
                      <button className="btn btn-secondary btn-sm" onClick={() => setEditingId(null)}>
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <h3>{vehicle.name}</h3>
                    <span className="vehicle-number">{vehicle.vehicleNumber}</span>
                    <span className="vehicle-type-badge">{vehicle.type}</span>
                  </>
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
                    onClick={() => handleEdit(vehicle)}
                    title="Edit vehicle"
                  >
                    ✏️
                  </button>
                  <button
                    className="delete-btn"
                    onClick={() => handleDelete(vehicle.id, vehicle.name)}
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
