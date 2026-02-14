import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import '../css/dashboard.css'

const HOME_BY_ROLE = {
  admin: '/admin',
  instructor: '/teacher',
  student: '/student'
}

export default function Layout({ title, children }) {
  const navigate = useNavigate()
  const { username, role, logout } = useAuth()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const homeRoute = HOME_BY_ROLE[role] || '/'

  return (
    <div className="app-shell">
      <nav className="sidebar">
        <h2>SRMS</h2>
        <div className="sidebar-meta">
          <div className="sidebar-user">{username || 'User'}</div>
          <div className="role">{role}</div>
          <button onClick={handleLogout}>Logout</button>
        </div>
      </nav>
      <main className="content">
        <header className="page-header">
          <h1>{title}</h1>
          <button onClick={() => navigate(homeRoute)}>Home</button>
        </header>
        {children}
      </main>
    </div>
  )
}
