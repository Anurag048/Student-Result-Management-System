import React from 'react'
import Layout from '../components/Layout.jsx'
import { API_BASE, buildAuthHeaders, getJson } from '../utils/api.js'
import { useAuth } from '../context/AuthContext.jsx'
import { useToast } from '../context/ToastContext.jsx'

export default function TeacherPage() {
  const { token } = useAuth()
  const { showToast } = useToast()
  const [classSubjects, setClassSubjects] = React.useState([])
  const [students, setStudents] = React.useState([])
  const [exams, setExams] = React.useState([])
  const [form, setForm] = React.useState({
    classSubjectId: '',
    studentId: '',
    examId: '',
    marksObtained: ''
  })

  const loadClassSubjects = React.useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE}/teacher/class-subjects`, {
        headers: buildAuthHeaders(token)
      })
      const data = await getJson(response)
      setClassSubjects(data.classSubjects || [])
    } catch (error) {
      showToast(error.message || 'Failed to load subjects', 'error')
    }
  }, [showToast, token])

  React.useEffect(() => {
    loadClassSubjects()
  }, [loadClassSubjects])

  const handleClassSubjectChange = async (value) => {
    try {
      setForm((prev) => ({ ...prev, classSubjectId: value, studentId: '', examId: '' }))
      const selected = classSubjects.find((cs) => cs._id === value)
      if (!selected) return

      const classId = selected.classId?._id
      if (!classId) return

      const [studentsRes, examsRes] = await Promise.all([
        fetch(`${API_BASE}/teacher/students?classId=${classId}`, {
          headers: buildAuthHeaders(token)
        }),
        fetch(`${API_BASE}/teacher/exams?classId=${classId}`, {
          headers: buildAuthHeaders(token)
        })
      ])

      const studentsData = await getJson(studentsRes)
      const examsData = await getJson(examsRes)
      setStudents(studentsData.students || [])
      setExams(examsData.exams || [])
    } catch (error) {
      showToast(error.message || 'Failed to load class data', 'error')
    }
  }

  const submitResult = async () => {
    try {
      const response = await fetch(`${API_BASE}/teacher/results`, {
        method: 'POST',
        headers: buildAuthHeaders(token),
        body: JSON.stringify({
          ...form,
          marksObtained: Number(form.marksObtained)
        })
      })
      await getJson(response)
      showToast('Marks submitted', 'success')
      setForm({ classSubjectId: '', studentId: '', examId: '', marksObtained: '' })
    } catch (error) {
      showToast(error.message || 'Submit failed', 'error')
    }
  }

  return (
    <Layout title="Teacher Dashboard">
      <div className="card">
        <h3>My Subjects</h3>
        <div className="list">
          {classSubjects.map((cs) => (
            <div className="list-item" key={cs._id}>
              {cs.subjectId?.name} - {cs.classId?.name}-{cs.classId?.section}
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <h3>Add Marks</h3>
        <div className="form-grid">
          <select
            value={form.classSubjectId}
            onChange={(e) => handleClassSubjectChange(e.target.value)}
          >
            <option value="">Select Subject</option>
            {classSubjects.map((cs) => (
              <option key={cs._id} value={cs._id}>
                {cs.subjectId?.name} - {cs.classId?.name}-{cs.classId?.section}
              </option>
            ))}
          </select>
          <select
            value={form.studentId}
            onChange={(e) => setForm({ ...form, studentId: e.target.value })}
          >
            <option value="">Select Student</option>
            {students.map((s) => (
              <option key={s._id} value={s._id}>
                {s.userId?.username} ({s.enrollmentNumber})
              </option>
            ))}
          </select>
          <select
            value={form.examId}
            onChange={(e) => setForm({ ...form, examId: e.target.value })}
          >
            <option value="">Select Exam</option>
            {exams.map((e) => (
              <option key={e._id} value={e._id}>
                {e.name} {e.academicYear}
              </option>
            ))}
          </select>
          <input
            type="number"
            placeholder="Marks obtained"
            value={form.marksObtained}
            onChange={(e) => setForm({ ...form, marksObtained: e.target.value })}
          />
          <button onClick={submitResult}>Submit Marks</button>
        </div>
      </div>
    </Layout>
  )
}
