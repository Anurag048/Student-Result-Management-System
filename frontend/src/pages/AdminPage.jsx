import React from 'react'
import Layout from '../components/Layout.jsx'
import { API_BASE, buildAuthHeaders, getJson } from '../utils/api.js'
import { useAuth } from '../context/AuthContext.jsx'
import { useToast } from '../context/ToastContext.jsx'

export default function AdminPage() {
  const { token } = useAuth()
  const { showToast } = useToast()
  const [classes, setClasses] = React.useState([])
  const [subjects, setSubjects] = React.useState([])
  const [classSubjects, setClassSubjects] = React.useState([])
  const [exams, setExams] = React.useState([])
  const [teachers, setTeachers] = React.useState([])
  const [students, setStudents] = React.useState([])

  const [classForm, setClassForm] = React.useState({ name: '', section: '' })
  const [subjectForm, setSubjectForm] = React.useState({ name: '' })
  const [teacherForm, setTeacherForm] = React.useState({
    username: '',
    email: '',
    password: ''
  })
  const [studentForm, setStudentForm] = React.useState({
    username: '',
    email: '',
    password: '',
    enrollmentNumber: '',
    classId: ''
  })
  const [classSubjectForm, setClassSubjectForm] = React.useState({
    subjectId: '',
    classId: '',
    teacherId: '',
    maxMarks: 100
  })
  const [examForm, setExamForm] = React.useState({
    name: '',
    classId: '',
    academicYear: '',
    date: ''
  })

  const loadAll = React.useCallback(async () => {
    try {
      const headers = buildAuthHeaders(token)
      const [classesRes, subjectsRes, classSubjectsRes, examsRes, teachersRes, studentsRes] =
        await Promise.all([
          fetch(`${API_BASE}/admin/classes`, { headers }),
          fetch(`${API_BASE}/admin/subjects`, { headers }),
          fetch(`${API_BASE}/admin/class-subjects`, { headers }),
          fetch(`${API_BASE}/admin/exams`, { headers }),
          fetch(`${API_BASE}/admin/teachers`, { headers }),
          fetch(`${API_BASE}/admin/students`, { headers })
        ])

      const classesData = await getJson(classesRes)
      const subjectsData = await getJson(subjectsRes)
      const classSubjectsData = await getJson(classSubjectsRes)
      const examsData = await getJson(examsRes)
      const teachersData = await getJson(teachersRes)
      const studentsData = await getJson(studentsRes)

      setClasses(classesData.classes || [])
      setSubjects(subjectsData.subjects || [])
      setClassSubjects(classSubjectsData.classSubjects || [])
      setExams(examsData.exams || [])
      setTeachers(teachersData.teachers || [])
      setStudents(studentsData.students || [])
    } catch (error) {
      showToast(error.message || 'Failed to load admin data', 'error')
    }
  }, [token])

  React.useEffect(() => {
    loadAll()
  }, [loadAll])

  const handleSubmit = async (path, body, reset, reload = true) => {
    try {
      const response = await fetch(`${API_BASE}${path}`, {
        method: 'POST',
        headers: buildAuthHeaders(token),
        body: JSON.stringify(body)
      })
      await getJson(response)
      showToast('Saved successfully', 'success')
      reset()
      if (reload) await loadAll()
    } catch (error) {
      showToast(error.message || 'Save failed', 'error')
    }
  }

  return (
    <Layout title="Admin Dashboard">
      <div className="card">
        <h3>Create Class</h3>
        <div className="form-grid">
          <input
            placeholder="Class name"
            value={classForm.name}
            onChange={(e) => setClassForm({ ...classForm, name: e.target.value })}
          />
          <input
            placeholder="Section (A/B/C)"
            value={classForm.section}
            onChange={(e) => setClassForm({ ...classForm, section: e.target.value })}
          />
          <button
            onClick={() =>
              handleSubmit('/admin/classes', classForm, () =>
                setClassForm({ name: '', section: '' })
              )
            }
          >
            Add Class
          </button>
        </div>
      </div>

      <div className="card">
        <h3>Create Subject</h3>
        <div className="form-grid">
          <input
            placeholder="Subject name"
            value={subjectForm.name}
            onChange={(e) => setSubjectForm({ name: e.target.value })}
          />
          <button
            onClick={() =>
              handleSubmit('/admin/subjects', subjectForm, () => setSubjectForm({ name: '' }))
            }
          >
            Add Subject
          </button>
        </div>
      </div>

      <div className="card">
        <h3>Create Teacher</h3>
        <div className="form-grid">
          <input
            placeholder="Username"
            value={teacherForm.username}
            onChange={(e) => setTeacherForm({ ...teacherForm, username: e.target.value })}
          />
          <input
            placeholder="Email"
            value={teacherForm.email}
            onChange={(e) => setTeacherForm({ ...teacherForm, email: e.target.value })}
          />
          <input
            placeholder="Password"
            type="password"
            value={teacherForm.password}
            onChange={(e) => setTeacherForm({ ...teacherForm, password: e.target.value })}
          />
          <button
            onClick={() =>
              handleSubmit('/admin/create-teachers', teacherForm, () =>
                setTeacherForm({ username: '', email: '', password: '' })
              )
            }
          >
            Add Teacher
          </button>
        </div>
      </div>

      <div className="card">
        <h3>Create Student</h3>
        <div className="form-grid">
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
          <input
            placeholder="Password"
            type="password"
            value={studentForm.password}
            onChange={(e) => setStudentForm({ ...studentForm, password: e.target.value })}
          />
          <input
            placeholder="Enrollment Number"
            value={studentForm.enrollmentNumber}
            onChange={(e) =>
              setStudentForm({ ...studentForm, enrollmentNumber: e.target.value })
            }
          />
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
              )
            }
          >
            Add Student
          </button>
        </div>
      </div>

      <div className="card">
        <h3>Create Class Subject</h3>
        <div className="form-grid">
          <select
            value={classSubjectForm.subjectId}
            onChange={(e) =>
              setClassSubjectForm({ ...classSubjectForm, subjectId: e.target.value })
            }
          >
            <option value="">Select Subject</option>
            {subjects.map((s) => (
              <option key={s._id} value={s._id}>
                {s.name}
              </option>
            ))}
          </select>
          <select
            value={classSubjectForm.classId}
            onChange={(e) =>
              setClassSubjectForm({ ...classSubjectForm, classId: e.target.value })
            }
          >
            <option value="">Select Class</option>
            {classes.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}-{c.section}
              </option>
            ))}
          </select>
          <select
            value={classSubjectForm.teacherId}
            onChange={(e) =>
              setClassSubjectForm({ ...classSubjectForm, teacherId: e.target.value })
            }
          >
            <option value="">Select Teacher</option>
            {teachers.map((t) => (
              <option key={t._id} value={t._id}>
                {t.username}
              </option>
            ))}
          </select>
          <input
            type="number"
            placeholder="Max Marks"
            value={classSubjectForm.maxMarks}
            onChange={(e) =>
              setClassSubjectForm({ ...classSubjectForm, maxMarks: Number(e.target.value) })
            }
          />
          <button
            onClick={() =>
              handleSubmit('/admin/class-subjects', classSubjectForm, () =>
                setClassSubjectForm({
                  subjectId: '',
                  classId: '',
                  teacherId: '',
                  maxMarks: 100
                })
              )
            }
          >
            Add Class Subject
          </button>
        </div>
      </div>

      <div className="card">
        <h3>Create Exam</h3>
        <div className="form-grid">
          <input
            placeholder="Exam name"
            value={examForm.name}
            onChange={(e) => setExamForm({ ...examForm, name: e.target.value })}
          />
          <select
            value={examForm.classId}
            onChange={(e) => setExamForm({ ...examForm, classId: e.target.value })}
          >
            <option value="">Select Class</option>
            {classes.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}-{c.section}
              </option>
            ))}
          </select>
          <input
            placeholder="Academic Year"
            value={examForm.academicYear}
            onChange={(e) => setExamForm({ ...examForm, academicYear: e.target.value })}
          />
          <input
            type="date"
            value={examForm.date}
            onChange={(e) => setExamForm({ ...examForm, date: e.target.value })}
          />
          <button
            onClick={() =>
              handleSubmit('/admin/exams', examForm, () =>
                setExamForm({ name: '', classId: '', academicYear: '', date: '' })
              )
            }
          >
            Add Exam
          </button>
        </div>
      </div>

      <div className="card">
        <h3>Classes</h3>
        <div className="list">
          {classes.map((c) => (
            <div className="list-item" key={c._id}>
              {c.name}-{c.section}
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <h3>Subjects</h3>
        <div className="list">
          {subjects.map((s) => (
            <div className="list-item" key={s._id}>
              {s.name}
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <h3>Class Subjects</h3>
        <div className="list">
          {classSubjects.map((cs) => (
            <div className="list-item" key={cs._id}>
              {cs.subjectId?.name} • {cs.classId?.name}-{cs.classId?.section} •{' '}
              {cs.teacherId?.username}
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <h3>Exams</h3>
        <div className="list">
          {exams.map((e) => (
            <div className="list-item" key={e._id}>
              {e.name} • {e.classId?.name}-{e.classId?.section}
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <h3>Teachers</h3>
        <div className="list">
          {teachers.map((t) => (
            <div className="list-item" key={t._id}>
              {t.username} • {t.email}
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <h3>Students</h3>
        <div className="list">
          {students.map((s) => (
            <div className="list-item" key={s._id}>
              {s.userId?.username} • {s.enrollmentNumber} • {s.classId?.name}-
              {s.classId?.section}
            </div>
          ))}
        </div>
      </div>
    </Layout>
  )
}
