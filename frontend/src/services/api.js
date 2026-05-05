// frontend/src/services/api.js
import axios from 'axios'

const BASE = '/api'

const api = axios.create({ baseURL: BASE })

api.interceptors.request.use(cfg => {
  const token = localStorage.getItem('gym_token')
  if (token) cfg.headers.Authorization = `Bearer ${token}`
  return cfg
})

export const authAPI = {
  register: (data) => api.post('/register', data),
  login:    (data) => api.post('/login',    data),
  me:       ()     => api.get('/me'),
}

export const gymAPI = {
  generateRoutine: (perfil) => api.post('/generate-routine', perfil),
  getHistory:      ()       => api.get('/history'),
}

export default api