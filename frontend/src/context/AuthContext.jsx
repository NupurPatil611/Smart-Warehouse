import React, { createContext, useContext, useState, useEffect } from 'react'
import api from '../utils/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('wms_token')
    const savedUser = localStorage.getItem('wms_user')
    if (token && savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser)
        setUser(parsedUser)
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`
      } catch (e) {
        localStorage.removeItem('wms_token')
        localStorage.removeItem('wms_user')
      }
    }
    setLoading(false)
  }, [])

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password })
    const { access_token, user: userData } = res.data
    localStorage.setItem('wms_token', access_token)
    localStorage.setItem('wms_user', JSON.stringify(userData))
    api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`
    setUser(userData)
    return userData
  }

  const logout = () => {
    localStorage.removeItem('wms_token')
    localStorage.removeItem('wms_user')
    delete api.defaults.headers.common['Authorization']
    setUser(null)
  }

  const hasRole = (...roles) => user && roles.includes(user.role)
  const canManage = () => hasRole('super_admin', 'admin')
  const isSuperAdmin = () => hasRole('super_admin')

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, hasRole, canManage, isSuperAdmin }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}