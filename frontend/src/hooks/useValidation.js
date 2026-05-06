// frontend/src/hooks/useValidation.js
import { useState, useCallback } from 'react'

export function useValidation(rules) {
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})

  const validate = useCallback((values) => {
    const newErrors = {}
    for (const [field, ruleFns] of Object.entries(rules)) {
      for (const rule of ruleFns) {
        const msg = rule(values[field], values)
        if (msg) { newErrors[field] = msg; break }
      }
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [rules])

  const touch = useCallback((field) => {
    setTouched(t => ({ ...t, [field]: true }))
  }, [])

  const touchAll = useCallback((values) => {
    const all = {}
    Object.keys(values).forEach(k => { all[k] = true })
    setTouched(all)
  }, [])

  const getFieldError = (field) => touched[field] ? errors[field] : undefined

  return { errors, touched, validate, touch, touchAll, getFieldError, setErrors }
}

// Reglas reutilizables
export const rules = {
  required: msg => v => (!v && v !== 0) ? (msg || 'Este campo es obligatorio') : undefined,
  email: () => v => v && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? 'Ingresa un correo válido' : undefined,
  minLen: (n, msg) => v => v && v.length < n ? (msg || `Mínimo ${n} caracteres`) : undefined,
  min: (n, msg) => v => v !== '' && Number(v) < n ? (msg || `Mínimo ${n}`) : undefined,
  max: (n, msg) => v => v !== '' && Number(v) > n ? (msg || `Máximo ${n}`) : undefined,
  numeric: msg => v => v !== '' && isNaN(Number(v)) ? (msg || 'Debe ser un número') : undefined,
  positive: msg => v => v !== '' && Number(v) <= 0 ? (msg || 'Debe ser mayor a 0') : undefined,
}