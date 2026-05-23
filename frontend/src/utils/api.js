import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
})

// Request interceptor - add auth token and device fingerprint
api.interceptors.request.use(
  (config) => {
    const isAdminRoute = config.url.startsWith('/admin')
    const token = isAdminRoute ? localStorage.getItem('adminToken') : localStorage.getItem('token')
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    // Add device fingerprint for security
    const fingerprint = localStorage.getItem('deviceFingerprint') || generateFingerprint()
    config.headers['x-device-fingerprint'] = fingerprint

    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor - handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const isAdminRoute = error.config?.url?.startsWith('/admin')
      
      if (isAdminRoute) {
        localStorage.removeItem('adminToken')
        window.location.href = '/admin/login'
      } else {
        if (error.response?.data?.code === 'TOKEN_EXPIRED' || 
            error.response?.data?.code === 'DEVICE_LIMIT') {
          // Don't auto-logout for device limit, show message
          if (error.response?.data?.code === 'DEVICE_LIMIT') {
            return Promise.reject(error)
          }
        }
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        window.location.href = '/activate'
      }
    }
    return Promise.reject(error)
  }
)

function generateFingerprint() {
  const fp = [
    navigator.userAgent,
    navigator.language,
    screen.width + 'x' + screen.height,
    new Date().getTimezoneOffset()
  ].join('|')

  const hash = btoa(fp).substring(0, 32)
  localStorage.setItem('deviceFingerprint', hash)
  return hash
}

export default api
