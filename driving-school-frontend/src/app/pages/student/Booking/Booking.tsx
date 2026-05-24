import { useState } from 'react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { RootState } from '@/store'
import { createBooking } from '@/store/slices/bookingSlice'
import { SLOT_TIMES } from '@/utils/slotTimes'
import toast from 'react-hot-toast'
import './Booking.scss'

const Booking = () => {
  const dispatch = useAppDispatch()
  const { loading, error } = useAppSelector((state: RootState) => state.booking)

  const [formData, setFormData] = useState({
    preferredSlot: 'MORNING' as 'MORNING' | 'AFTERNOON' | 'EVENING',
    preferredDate: '',
    vehicleType: 'CAR' as 'CAR' | 'BIKE' | 'SCOOTER',
    trainingDuration: 60 as 30 | 60,
    experienceLevel: 'BEGINNER' as 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED',
    examDate: '',
  })

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.preferredDate) {
      toast.error('Please select a date')
      return
    }

    const payload = {
      preferredSlot: formData.preferredSlot,
      preferredDate: formData.preferredDate,
      vehicleType: formData.vehicleType,
      trainingDuration: formData.trainingDuration,
      experienceLevel: formData.experienceLevel,
      ...(formData.examDate && { examDate: formData.examDate }),
    }

    const result = await dispatch(createBooking(payload))
    if (createBooking.fulfilled.match(result)) {
      toast.success('Booking created successfully!')
      setFormData({
        preferredSlot: 'MORNING',
        preferredDate: '',
        vehicleType: 'CAR',
        trainingDuration: 60,
        experienceLevel: 'BEGINNER',
        examDate: '',
      })
    }
  }

  const getToday = () => {
    const today = new Date()
    const day = String(today.getDate()).padStart(2, '0')
    const month = String(today.getMonth() + 1).padStart(2, '0')
    const year = today.getFullYear()
    return `${year}-${month}-${day}`
  }

  const getMaxDate = () => {
    const date = new Date()
    date.setDate(date.getDate() + 7)
    const day = String(date.getDate()).padStart(2, '0')
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const year = date.getFullYear()
    return `${year}-${month}-${day}`
  }

  return (
    <div className="booking-page">
      <div className="booking-form-container card">
        <h2>Book a New Lesson</h2>
        <p>Select your preferred slot and vehicle type</p>

        <form onSubmit={handleSubmit} className="booking-form">
          <div className="form-row">
            <div className="form-group">
              <label>Preferred Date *</label>
              <input
                type="date"
                name="preferredDate"
                value={formData.preferredDate}
                onChange={handleChange}
                className="form-input"
                min={getToday()}
                max={getMaxDate()}
                required
              />
              <span className="form-hint">Book within 7 days</span>
            </div>

            <div className="form-group">
              <label>Preferred Time Slot *</label>
              <select
                name="preferredSlot"
                value={formData.preferredSlot}
                onChange={handleChange}
                className="form-select"
              >
                {Object.entries(SLOT_TIMES).map(([key, times]) => (
                  <option key={key} value={key}>{key.charAt(0) + key.slice(1).toLowerCase()} ({times.start} - {times.end})</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Vehicle Type *</label>
              <select
                name="vehicleType"
                value={formData.vehicleType}
                onChange={handleChange}
                className="form-select"
              >
                <option value="CAR">Car</option>
                <option value="BIKE">Bike</option>
                <option value="SCOOTER">Scooter</option>
              </select>
            </div>

            <div className="form-group">
              <label>Duration *</label>
              <select
                name="trainingDuration"
                value={formData.trainingDuration}
                onChange={handleChange}
                className="form-select"
              >
                <option value={30}>30 Minutes</option>
                <option value={60}>60 Minutes</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Experience Level *</label>
            <select
              name="experienceLevel"
              value={formData.experienceLevel}
              onChange={handleChange}
              className="form-select"
            >
              <option value="BEGINNER">Beginner</option>
              <option value="INTERMEDIATE">Intermediate</option>
              <option value="ADVANCED">Advanced</option>
            </select>
          </div>

          <div className="form-group">
            <label>Exam Date (Optional)</label>
            <input
              type="date"
              name="examDate"
              value={formData.examDate}
              onChange={handleChange}
              className="form-input"
              min={getToday()}
            />
          </div>

          {error && <div className="form-error">{error}</div>}

          <button type="submit" className="btn btn-primary submit-btn" disabled={loading}>
            {loading ? <span className="loading-spinner" /> : 'Submit Booking Request'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default Booking