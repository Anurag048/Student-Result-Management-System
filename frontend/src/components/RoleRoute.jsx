import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export default function RoleRoute({ allow, element }) {
  const { token, role } = useAuth()
  if (!token) return <Navigate to="/login" />
  if (!allow.includes(role)) return <Navigate to="/login" />
  return element
}
