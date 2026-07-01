import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { RootState } from '@/store'
import { register, clearError } from '@/store/slices/authSlice'
import { useFormValidation } from '@/hooks/useFormValidation'
import { registerSchema } from '@/utils/validation'
import FieldError from '@/components/FieldError/FieldError'
import toast from 'react-hot-toast'
import './Register.scss'

const Register = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { loading, error } = useAppSelector((state: RootState) => state.auth)
  const { errors, validate, validateField, clearErrors } = useFormValidation(registerSchema)

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    address: '',
    dob: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    clearErrors(name)
    if (error) dispatch(clearError())
  }

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    validateField(formData, e.target.name)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate(formData)) return

    const result = await dispatch(register(formData))
    if (register.fulfilled.match(result)) {
      toast.success('Registration successful! Please login.')
      navigate('/login')
    }
  }

  return (
    <div className="register-page">
      <div className="register-container">
        <div className="register-header">
          <h1>Create Account</h1>
          <p>Join DriveSmart to start your driving journey</p>
        </div>

        <form onSubmit={handleSubmit} className="register-form" noValidate>
          <div className="form-group">
            <label>Full Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`form-input ${errors.name ? 'input-error' : ''}`}
              placeholder="Enter your full name"
            />
            <FieldError message={errors.name} />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`form-input ${errors.email ? 'input-error' : ''}`}
              placeholder="Enter your email"
            />
            <FieldError message={errors.email} />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`form-input ${errors.password ? 'input-error' : ''}`}
              placeholder="Create a password"
            />
            <FieldError message={errors.password} />
          </div>

          <div className="form-group">
            <label>Phone Number</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`form-input ${errors.phone ? 'input-error' : ''}`}
              placeholder="Enter your phone number"
            />
            <FieldError message={errors.phone} />
          </div>

          <div className="form-group">
            <label>Address</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`form-input ${errors.address ? 'input-error' : ''}`}
              placeholder="Enter your address"
            />
            <FieldError message={errors.address} />
          </div>

          <div className="form-group">
            <label>Date of Birth</label>
            <input
              type="date"
              name="dob"
              value={formData.dob}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`form-input ${errors.dob ? 'input-error' : ''}`}
            />
            <FieldError message={errors.dob} />
          </div>

          {error && <div className="form-error">{error}</div>}

          <button type="submit" className="btn btn-primary register-btn" disabled={loading}>
            {loading ? <span className="loading-spinner" /> : 'Create Account'}
          </button>
        </form>

        <div className="register-footer">
          <p>
            Already have an account? <Link to="/login">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Register