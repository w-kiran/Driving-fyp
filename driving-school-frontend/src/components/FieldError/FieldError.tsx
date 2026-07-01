import './FieldError.scss'

interface FieldErrorProps {
  message?: string
  touched?: boolean
}

const FieldError = ({ message, touched = true }: FieldErrorProps) => {
  if (!message || !touched) return null

  return (
    <span className="field-error" role="alert">
      {message}
    </span>
  )
}

export default FieldError
