import axios from 'axios'

const api = axios.create({
  // 1. Checks Vercel for VITE_API_URL. 
  // 2. If it's not found (like when running on your laptop), it falls back to your localhost port.
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  headers: { 
    'Content-Type': 'application/json' 
  }
})

// Request Interceptor: Automatically attaches JWT Token to headers
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('wms_token')
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`
  }
  return config
})

// Response Interceptor: Handles automatic logout if the token expires (401 error)
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('wms_token')
      localStorage.removeItem('wms_user')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export default api