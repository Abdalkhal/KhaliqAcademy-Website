import React, { createContext, useState, useContext, useEffect } from 'react'
import api from '../utils/api'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      verifyToken()
    } else {
      setLoading(false)
    }
  }, [])

  const verifyToken = async () => {
    try {
      const res = await api.post('/auth/verify')
      if (res.data.success) {
        setUser(res.data.user)
        setIsAuthenticated(true)
        localStorage.setItem('user', JSON.stringify(res.data.user))
      }
    } catch (error) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    } finally {
      setLoading(false)
    }
  }

  const activate = async (code, courseId) => {
    try {
      const res = await api.post('/auth/activate', { code, courseId })
      if (res.data.success) {
        localStorage.setItem('token', res.data.token)
        setUser(res.data.user)
        setIsAuthenticated(true)
        localStorage.setItem('user', JSON.stringify(res.data.user))
        return { success: true }
      }
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Activation failed',
        code: error.response?.data?.code
      }
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
    setIsAuthenticated(false)
    window.location.href = '/'
  }

  const hasCourseAccess = (courseId) => {
    if (!user?.enrolledCourses) return false
    return user.enrolledCourses.some(e => e.courseId === courseId || e.course === courseId)
  }

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated, 
      loading, 
      activate, 
      logout, 
      hasCourseAccess,
      verifyToken 
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
