import { useState, useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { RootState } from '@/store'
import { fetchVehicles, createVehicle, toggleVehicleActive } from '@/store/slices/adminSlice'
import toast from 'react-hot-toast'
import './Vehicles.scss'

const Vehicles = () => {
  const dispatch = useAppDispatch()
  const { vehicles, loading } = useAppSelector((state: RootState) => state.admin)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    type: 'CAR' as 'CAR' | 'BIKE' | 'SCOOTER',
    availableSlots: ['MORNING', 'AFTERNOON', 'EVENING'] as string[],
  })

  useEffect(() => {
    dispatch(fetchVehicles())
  }, [dispatch])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await dispatch(createVehicle(formData))
    toast.success('Vehicle added successfully')
    setFormData({ type: 'CAR', availableSlots: ['MORNING', 'AFTERNOON', 'EVENING'] })
    setShowForm(false)
  }

  const handleToggle = async (id: number) => {
    await dispatch(toggleVehicleActive(id))
    toast.success('Vehicle status updated')
  }

  const handleSlotChange = (slot: string) => {
    const slots = formData.availableSlots.includes(slot)
      ? formData.availableSlots.filter((s) => s !== slot)
      : [...formData.availableSlots, slot]
    setFormData({ ...formData, availableSlots: slots })
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
                <h3>{vehicle.type}</h3>
                <button
                  className={`toggle-btn ${vehicle.active ? 'active' : ''}`}
                  onClick={() => handleToggle(vehicle.id)}
                >
                  {vehicle.active ? 'Active' : 'Inactive'}
                </button>
              </div>
              <div className="vehicle-details">
                <span className="label">Available Slots:</span>
                <span className="value">{vehicle.availableSlots?.join(', ') || 'Not set'}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Vehicles