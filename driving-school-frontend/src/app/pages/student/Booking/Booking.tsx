import { useState, useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { RootState } from '@/store'
import { createBooking } from '@/store/slices/bookingSlice'
import { instance } from '@/api/apiClient'
import { useFormValidation } from '@/hooks/useFormValidation'
import { createBookingSchema } from '@/utils/validation'
import FieldError from '@/components/FieldError/FieldError'
import { SLOT_TIMES } from '@/utils/slotTimes'
import toast from 'react-hot-toast'
import './Booking.scss'

const VEHICLE_TYPES = ['CAR', 'BIKE', 'SCOOTER'] as const
type VehicleType = (typeof VEHICLE_TYPES)[number]

interface TypeCount {
  count: number
  isFull: boolean
  max: number
}

interface DailyCounts {
  CAR: TypeCount
  BIKE: TypeCount
  SCOOTER: TypeCount
}

const VEHICLE_LABELS: Record<VehicleType, string> = { CAR: 'Car', BIKE: 'Bike', SCOOTER: 'Scooter' }
const VEHICLE_ICONS: Record<VehicleType, string> = { CAR: '🚗', BIKE: '🏍️', SCOOTER: '🛵' }

const Booking = () => {
  const dispatch = useAppDispatch()
  const { loading, error } = useAppSelector((state: RootState) => state.booking)
  const { errors, validate, clearErrors } = useFormValidation(createBookingSchema)

  const [formData, setFormData] = useState({
    preferredSlot: 'SLOT_1' as 'SLOT_1' | 'SLOT_2' | 'SLOT_3' | 'SLOT_4' | 'SLOT_5' | 'SLOT_6' | 'SLOT_7' | 'SLOT_8' | 'SLOT_9' | 'SLOT_10' | 'SLOT_11' | 'SLOT_12',
    preferredDate: '',
    vehicleType: 'CAR' as 'CAR' | 'BIKE' | 'SCOOTER',
    trainingDuration: 60 as 30 | 60,
    experienceLevel: 'BEGINNER' as 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED',
    examDate: '',
  })

  const [dailyCounts, setDailyCounts] = useState<Record<string, DailyCounts>>({})
  const [loadingCounts, setLoadingCounts] = useState(true)

  useEffect(() => {
    fetchDailyCounts()
  }, [])

  const fetchDailyCounts = async () => {
    try {
      setLoadingCounts(true)
      const response = await instance.get<{ dailyCounts: Record<string, DailyCounts>; maxPerType: Record<VehicleType, number> }>(
        '/students/daily-booking-counts'
      )
      setDailyCounts(response.data.dailyCounts)
    } catch (err) {
      console.error('Failed to fetch booking counts', err)
    } finally {
      setLoadingCounts(false)
    }
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    clearErrors(name)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate(formData)) return

    const countInfo = dailyCounts[formData.preferredDate]
    const typeInfo = countInfo?.[formData.vehicleType]
    if (typeInfo?.isFull) {
      toast.error(`${VEHICLE_LABELS[formData.vehicleType]} slots are fully booked for this date (${typeInfo.max} max). Please select another date or vehicle type.`)
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
        preferredSlot: 'SLOT_1',
        preferredDate: '',
        vehicleType: 'CAR',
        trainingDuration: 60,
        experienceLevel: 'BEGINNER',
        examDate: '',
      })
      clearErrors()
      // Refresh daily counts after successful booking
      fetchDailyCounts()
    }
  }

  const getToday = () => {
    const today = new Date()
    const day = String(today.getDate()).padStart(2, '0')
    const month = String(today.getMonth() + 1).padStart(2, '0')
    const year = today.getFullYear()
    return `${year}-${month}-${day}`
  }

  // Generate date options for the custom date grid
  const getDateOptions = () => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const options: Array<{
      dateStr: string
      dayName: string
      month: string
      dayNum: number
      isTomorrow: boolean
    }> = []
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

    for (let i = 1; i <= 7; i++) {
      const d = new Date(today)
      d.setDate(today.getDate() + i)
      const day = String(d.getDate()).padStart(2, '0')
      const month = String(d.getMonth() + 1).padStart(2, '0')
      const year = d.getFullYear()
      const dateStr = `${year}-${month}-${day}`

      options.push({
        dateStr,
        dayName: dayNames[d.getDay()],
        month: monthNames[d.getMonth()],
        dayNum: d.getDate(),
        isTomorrow: i === 1,
      })
    }
    return options
  }

  const dateOptions = getDateOptions()

  return (
    <div className="booking-page">
      <div className="booking-form-container card">
        <h2>Book a New Lesson</h2>
        <p>Select your preferred slot and vehicle type</p>

        <form onSubmit={handleSubmit} className="booking-form" noValidate>
          <div className="form-group">
            <label>Preferred Date *</label>
            {loadingCounts ? (
              <div className="date-grid-loading">Loading availability...</div>
            ) : (
              <>
                <div className="date-grid">
                  {dateOptions.map((opt) => {
                    const typeCounts = dailyCounts[opt.dateStr]
                    const selectedTypeInfo = typeCounts?.[formData.vehicleType]
                    const isSelectedTypeFull = selectedTypeInfo?.isFull ?? false
                    const isSelected = formData.preferredDate === opt.dateStr
                    const anyFull = typeCounts ? VEHICLE_TYPES.some((vt) => typeCounts[vt]?.isFull) : false

                    return (
                      <button
                        key={opt.dateStr}
                        type="button"
                        className={`date-card ${isSelected ? 'selected' : ''} ${isSelectedTypeFull ? 'full' : ''} ${opt.isTomorrow ? 'tomorrow' : ''}`}
                        disabled={isSelectedTypeFull}
                        onClick={() => setFormData({ ...formData, preferredDate: opt.dateStr })}
                      >
                        <span className="date-card-day">{opt.dayName}</span>
                        <span className="date-card-num">{opt.dayNum}</span>
                        <span className="date-card-month">{opt.month}</span>
                        {typeCounts && (
                          <div className="date-card-types">
                            {VEHICLE_TYPES.map((vt) => {
                              const tc = typeCounts[vt]
                              const vtFull = tc?.isFull ?? false
                              return (
                                <span
                                  key={vt}
                                  className={`date-card-type ${vtFull ? 'full' : ''} ${formData.vehicleType === vt ? 'active-type' : ''}`}
                                >
                                  <span className="type-icon">{VEHICLE_ICONS[vt]}</span>
                                  <span className="type-count">{tc?.count ?? 0}/{tc?.max ?? '?'}</span>
                                </span>
                              )
                            })}
                          </div>
                        )}
                        {anyFull && !isSelectedTypeFull && <span className="date-card-partial">Partial</span>}
                        {opt.isTomorrow && <span className="date-card-badge">Tomorrow</span>}
                      </button>
                    )
                  })}
                </div>
                <span className="form-hint">
                  Book within 7 days &middot; Each vehicle type has its own daily slot limit
                </span>
              </>
            )}
            <FieldError message={errors.preferredDate} />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Preferred Time Slot *</label>
              <select
                name="preferredSlot"
                value={formData.preferredSlot}
                onChange={handleChange}
                className={`form-select ${errors.preferredSlot ? 'input-error' : ''}`}
              >
                {Object.entries(SLOT_TIMES).map(([key, times]) => (
                  <option key={key} value={key}>{key.charAt(0) + key.slice(1).toLowerCase()} ({times.start} - {times.end})</option>
                ))}
              </select>
              <FieldError message={errors.preferredSlot} />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Vehicle Type *</label>
              <select
                name="vehicleType"
                value={formData.vehicleType}
                onChange={handleChange}
                className={`form-select ${errors.vehicleType ? 'input-error' : ''}`}
              >
                <option value="CAR">Car</option>
                <option value="BIKE">Bike</option>
                <option value="SCOOTER">Scooter</option>
              </select>
              <FieldError message={errors.vehicleType} />
            </div>

            <div className="form-group">
              <label>Duration *</label>
              <select
                name="trainingDuration"
                value={formData.trainingDuration}
                onChange={handleChange}
                className={`form-select ${errors.trainingDuration ? 'input-error' : ''}`}
              >
                <option value={30}>30 Minutes</option>
                <option value={60}>60 Minutes</option>
              </select>
              <FieldError message={errors.trainingDuration} />
            </div>
          </div>

          <div className="form-group">
            <label>Experience Level *</label>
            <select
              name="experienceLevel"
              value={formData.experienceLevel}
              onChange={handleChange}
              className={`form-select ${errors.experienceLevel ? 'input-error' : ''}`}
            >
              <option value="BEGINNER">Beginner</option>
              <option value="INTERMEDIATE">Intermediate</option>
              <option value="ADVANCED">Advanced</option>
            </select>
            <FieldError message={errors.experienceLevel} />
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
