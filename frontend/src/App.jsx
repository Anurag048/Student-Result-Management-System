import './App.css'
import LoginPage from './pages/LoginPage'
import TeacherPage from './pages/TeacherPage.jsx'
import Teacher from './pages/Teacher.jsx'
import StudentPage from './pages/StudentPage.jsx'
import SubjectPage from './pages/SubjectPage.jsx'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext.jsx'
import RoleRoute from './components/RoleRoute.jsx'
import ClassPage from './pages/ClassPage.jsx'
import Admin from './pages/Admin.jsx'

function App() {
  const { token, role } = useAuth()
  const RoleRedirect = () => {
    if (!token) return <Navigate to="/login" />
    if (role === 'admin') return <Navigate to="/admin" />
    if (role === 'instructor') return <Navigate to="/teacher" />
    if (role === 'student') return <Navigate to="/student" />
    return <Navigate to="/login" />
  }
  return (
    <div>
      <Routes>
        <Route path="/" element={<RoleRedirect />} />
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/admin"
          element={<RoleRoute allow={['admin']} element={<Admin />} />}
        />
        <Route
          path="/admin/class-section"
          element={<RoleRoute allow={['admin']} element={<ClassPage />} />}
        />
        <Route
          path="/admin/subject-section"
          element={<RoleRoute allow={['admin']} element={<SubjectPage />} />}
        />
        <Route
          path="/admin/teacher-section"
          element={<RoleRoute allow={['admin']} element={<Teacher />} />}
        />
        <Route
          path="/teacher"
          element={<RoleRoute allow={['instructor']} element={<TeacherPage />} />}
        />
        <Route
          path="/student"
          element={<RoleRoute allow={['student']} element={<StudentPage />} />}
        />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </div>
  )
}

export default App
