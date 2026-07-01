import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { RootState } from '@/store'
import { login, clearError } from '@/store/slices/authSlice'
import { useFormValidation } from '@/hooks/useFormValidation'
import { loginSchema } from '@/utils/validation'
import FieldError from '@/components/FieldError/FieldError'
import toast from 'react-hot-toast'
import './Login.scss'

const Login = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { loading, error } = useAppSelector((state: RootState) => state.auth)
  const { errors, validate, validateField, clearErrors } = useFormValidation(loginSchema)

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'STUDENT' as 'STUDENT' | 'ADMIN',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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

    const result = await dispatch(login(formData))
    if (login.fulfilled.match(result)) {
      toast.success('Login successful!')
      if (formData.role === 'ADMIN') {
        navigate('/admin')
      } else {
        navigate('/dashboard')
      }
    }
  }

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-header">
          <h1>Welcome Back</h1>
          <p>Sign in to continue to DriveSmart</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form" noValidate>
          <div className="form-group">
            <label>Role</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="form-select"
            >
              <option value="STUDENT">Student</option>
              <option value="ADMIN">Admin</option>
            </select>
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
              placeholder="Enter your password"
            />
            <FieldError message={errors.password} />
          </div>

          {error && <div className="form-error">{error}</div>}

          <button type="submit" className="btn btn-primary login-btn" disabled={loading}>
            {loading ? <span className="loading-spinner" /> : 'Sign In'}
          </button>
        </form>

        <div className="login-footer">
          <p>
            Don't have an account? <Link to="/register">Register</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login