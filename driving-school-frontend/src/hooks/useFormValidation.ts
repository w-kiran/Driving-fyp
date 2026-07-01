import { useState, useCallback } from 'react'
import { z } from 'zod'

type ValidationErrors = Record<string, string>

/**
 * Hook that validates form data against a Zod schema.
 * Returns errors object keyed by field name, a validate function for submit,
 * a validateField function for blur/change, and a clearErrors function.
 */
export function useFormValidation<T extends Record<string, unknown>>(schema: z.ZodSchema<T>) {
  const [errors, setErrors] = useState<ValidationErrors>({})

  /**
   * Validate all fields. Returns true if valid, false otherwise.
   * Sets per-field error messages on failure.
   */
  const validate = useCallback(
    (data: T): data is T => {
      const result = schema.safeParse(data)
      if (result.success) {
        setErrors({})
        return true
      }

      const fieldErrors: ValidationErrors = {}
      for (const issue of result.error.issues) {
        const field = issue.path.join('.')
        // Keep the first error per field
        if (!fieldErrors[field]) {
          fieldErrors[field] = issue.message
        }
      }
      setErrors(fieldErrors)
      return false
    },
    [schema],
  )

  /**
   * Validate a single field. Useful for onBlur validation.
   */
  const validateField = useCallback(
    (data: T, fieldName: string) => {
      const objectSchema = (schema as unknown) as { shape?: Record<string, z.ZodTypeAny> }
      const fieldSchema = objectSchema.shape?.[fieldName]
      if (!fieldSchema) return

      const fieldValue = data[fieldName]
      const result = fieldSchema.safeParse(fieldValue)

      setErrors((prev) => {
        const next = { ...prev }
        if (!result.success) {
          next[fieldName] = result.error.issues[0]?.message || 'Invalid value'
        } else {
          delete next[fieldName]
        }
        return next
      })
    },
    [schema],
  )

  /**
   * Clear all errors or a specific field error.
   */
  const clearErrors = useCallback((fieldName?: string) => {
    if (fieldName) {
      setErrors((prev) => {
        const next = { ...prev }
        delete next[fieldName]
        return next
      })
    } else {
      setErrors({})
    }
  }, [])

  return { errors, validate, validateField, clearErrors }
}
