import { Navigate } from 'react-router-dom'

export function ManagerRoute({ children }) {
  if (typeof window === 'undefined') return null

  const token = localStorage.getItem('token')
  const userRaw = localStorage.getItem('user')
  const user = userRaw ? JSON.parse(userRaw) : null

  if (!token || !user) {
    return <Navigate to="/login" replace />
  }

  if (user.role !== 'manager') {
    return <Navigate to="/dashboard" replace />
  }

  return children
}


