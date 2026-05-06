// frontend/src/services/api.js
import axios from 'axios'

const api = axios.create({ baseURL: '/api' })

api.interceptors.request.use(cfg => {
  const token = localStorage.getItem('gym_token')
  if (token) cfg.headers.Authorization = `Bearer ${token}`
  return cfg
})

api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.clear()
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export const authAPI = {
  register: d => api.post('/register', d),
  login:    d => api.post('/login',    d),
  me:       () => api.get('/me'),
}

export const gymAPI = {
  generateRoutine: p => api.post('/generate-routine', p),
  getHistory:      () => api.get('/history'),
}

export default api