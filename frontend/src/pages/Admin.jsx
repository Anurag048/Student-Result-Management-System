import React from "react";
import '../css/Admin.css'
import Layout from "../components/Layout";
import { API_BASE , buildAuthHeaders, getJson } from "../utils/api";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { useNavigate } from "react-router-dom";

export default function Admin(){
    const { token } = useAuth()
    const { showToast } = useToast()
    const [classes, setClasses] = React.useState([])
    const navigate = useNavigate();
    //student api
    const [studentForm, setStudentForm] = React.useState({
        username: '',
        email: '',
        password: '',
        enrollmentNumber: '',
        classId: ''
    })
    //Teacher Api
    const [teacherForm ,setTeacherForm] = React.useState({
        username:'',
        email:'',
        password:''
    })
    
    const loadAll = React.useCallback(async () => {
        try {
          const headers = buildAuthHeaders(token)
          const [classesRes] = await Promise.all([
            fetch(`${API_BASE}/admin/classes`, { headers }),
          ])
    
          const classesData = await getJson(classesRes)
    
          setClasses(classesData.classes || [])
        } catch (error) {
          showToast(error.message || 'Failed to load admin data', 'error')
        }
      }, [showToast, token])
    
      React.useEffect(() => {
        loadAll()
      }, [loadAll])

    const handleSubmit = async (path, body, reset) => {
        try {
          if (
            (path === '/admin/create-teachers' && (!body.username || !body.email || !body.password)) ||
            (path === '/admin/create-students' &&
              (!body.username || !body.email || !body.password || !body.enrollmentNumber || !body.classId))
          ) {
            showToast('Please fill all required fields', 'error')
            return
          }

          const response = await fetch(`${API_BASE}${path}`, {
            method: 'POST',
            headers: buildAuthHeaders(token),
            body: JSON.stringify(body)
          })
          await getJson(response)
          showToast('Saved successfully', 'success')
          reset()
          await loadAll()
        } catch (error) {
          showToast(error.message || 'Save failed', 'error')
        }
      }
    return(
        <Layout title="Admin Panel">
            <div className="main-admin">
                <div className="teacher-tab-card">
                    <h3>Create New Teacher</h3>
                    <div className="teacher-form-grid">
                        <input
                        type="text"
                        value={teacherForm.username}
                        placeholder="Enter name"
                        onChange={(e)=>setTeacherForm({...teacherForm, username:e.target.value})}
                        />
                        <input type="email"
                        value={teacherForm.email}
                        placeholder="Enter email"
                        onChange={(e)=>setTeacherForm({...teacherForm, email:e.target.value})}
                        />
                        <input type="password"
                        value={teacherForm.password}
                        placeholder="Enter password"
                        onChange={(e)=>setTeacherForm({...teacherForm, password:e.target.value})}
                        />
                        <button onClick={() =>
                            handleSubmit('/admin/create-teachers', teacherForm, () =>
                                setTeacherForm({ username: '', email: '', password: '' })
                            )}>
                            Create Teacher
                        </button>
                    </div>
                </div>
                <div className="teacher-tab-card" >
                    <h3>Create New Student</h3>
                    <div className="teacher-form-grid">
                        <div className="input-part">
                        <input
                        placeholder="Username"
                        value={studentForm.username}
                        onChange={(e) => setStudentForm({ ...studentForm, username: e.target.value })}
                        />
                        <input
                        placeholder="Email"
                        value={studentForm.email}
                        onChange={(e) => setStudentForm({ ...studentForm, email: e.target.value })}
                        />
                        </div>
                        <div className="input-part">
                        <input
                        placeholder="Password"
                        type="password"
                        value={studentForm.password}
                        onChange={(e) => setStudentForm({ ...studentForm, password: e.target.value })}
                        />
                        <input
                        placeholder="Enrollment Number"
                        value={studentForm.enrollmentNumber}
                        onChange={(e) => setStudentForm({ ...studentForm, enrollmentNumber: e.target.value })}
                        />
                        </div>
                        <select
                        value={studentForm.classId}
                        onChange={(e) => setStudentForm({ ...studentForm, classId: e.target.value })}
                        >
                        <option value="">Select Class</option>
                        {classes.map((c) => (
                        <option key={c._id} value={c._id}>
                        {c.name}-{c.section}
                        </option>
                        ))}
                        </select>
                        <button
                            onClick={() =>
                                handleSubmit('/admin/create-students', studentForm, () =>
                                setStudentForm({
                                    username: '',
                                    email: '',
                                    password: '',
                                    enrollmentNumber: '',
                                    classId: ''
                                })
                            )}>
                        Add Student
                        </button>
                    </div>
                </div>
                <button className="tab-card" onClick={()=>navigate('/admin/class-section')}>
                    Open Classes
                </button>
                <button className="tab-card" onClick={()=>navigate('/admin/subject-section')}>
                    Open Subjects
                </button>
            </div>
        </Layout>
    )
}
