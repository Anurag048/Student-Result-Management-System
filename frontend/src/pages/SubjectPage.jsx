import React from 'react'
import { API_BASE, buildAuthHeaders, getJson } from '../utils/api'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import Layout from '../components/Layout'
import '../css/classPage.css'

export default function SubjectPage() {
  const { token } = useAuth()
  const { showToast } = useToast()
  const [subjects, setSubjects] = React.useState([])
  const [classes, setClasses] = React.useState([])
  const [teachers, setTeachers] = React.useState([])
  const [classSubjects, setClassSubjects] = React.useState([])
  const [subjectForm, setSubjectForm] = React.useState({
    name: ''
  })
  const [examForm, setExamForm] = React.useState({
    name: '',
    classId: '',
    academicYear: '',
    date: ''    
  })
  const [classSubjectForm, setClassSubjectForm] = React.useState({
    subjectId: '',
    classId: '',
    teacherId: '',
    maxMarks: 100
  })

  const loadAll = React.useCallback(async () => {
    try {
      const headers = buildAuthHeaders(token)
      const [classesRes, subjectsRes, classSubjectsRes, teachersRes] = await Promise.all([
        fetch(`${API_BASE}/admin/classes`, { headers }),
        fetch(`${API_BASE}/admin/subjects`, { headers }),
        fetch(`${API_BASE}/admin/class-subjects`, { headers }),
        fetch(`${API_BASE}/admin/teachers`, { headers })
      ])

      const classesData = await getJson(classesRes)
      const subjectsData = await getJson(subjectsRes)
      const classSubjectsData = await getJson(classSubjectsRes)
      const teachersData = await getJson(teachersRes)

      setClasses(classesData.classes || [])
      setSubjects(subjectsData.subjects || [])
      setClassSubjects(classSubjectsData.classSubjects || [])
      setTeachers(teachersData.teachers || [])
    } catch (error) {
      showToast(error.message || 'Failed to load admin data', 'error')
    }
  }, [showToast, token])

  React.useEffect(() => {
    loadAll()
  }, [loadAll])

  const handleSubmit = async (path, body, reset) => {
    try {
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

  const classSubjectRows = React.useMemo(() => {
    const grouped = classSubjects.reduce((acc, item) => {
      const classId = item?.classId?._id || ''
      if (!classId) return acc
      if (!acc[classId]) {
        acc[classId] = {
          classLabel: `${item?.classId?.name || '-'}-${item?.classId?.section || '-'}`,
          subjects: []
        }
      }
      acc[classId].subjects.push(`${item?.subjectId?.name || '-'} (${item?.maxMarks ?? 0})`)
      return acc
    }, {})

    return Object.values(grouped).sort((a, b) => a.classLabel.localeCompare(b.classLabel))
  }, [classSubjects])

  return (
    <Layout title="Subject Panel">
      <div className="class-frame">
        <div className="subject-exam">

        
        <div className="class-card">
          <h3>Create Subject</h3>
          <div className="class-form-grid">
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
      </div>
        <div className="class-card">
          <h3>Create Class Subject</h3>
          <div className="class-form-grid">
            <select
              value={classSubjectForm.subjectId}
              onChange={(e) => setClassSubjectForm({ ...classSubjectForm, subjectId: e.target.value })}
            >
              <option value="">Select Subject</option>
              {subjects.map((item) => (
                <option key={item._id} value={item._id}>
                  {item.name}
                </option>
              ))}
            </select>
            <select
              value={classSubjectForm.classId}
              onChange={(e) => setClassSubjectForm({ ...classSubjectForm, classId: e.target.value })}
            >
              <option value="">Select Class</option>
              {classes.map((item) => (
                <option key={item._id} value={item._id}>
                  {item.name}-{item.section}
                </option>
              ))}
            </select>
            <select
              value={classSubjectForm.teacherId}
              onChange={(e) => setClassSubjectForm({ ...classSubjectForm, teacherId: e.target.value })}
            >
              <option value="">Select Teacher</option>
              {teachers.map((item) => (
                <option key={item._id} value={item._id}>
                  {item.username}
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
      </div>

      <div className="class-table-card class-students-card">
        <h3>Class Subject List</h3>
        <div className="class-table-wrapper">
          <table className="class-table">
            <thead>
              <tr>
                <th>Class</th>
                <th>Subjects</th>
              </tr>
            </thead>
            <tbody>
              {classSubjectRows.length === 0 ? (
                <tr>
                  <td colSpan="2" className="class-table-empty">
                    No class subjects found
                  </td>
                </tr>
              ) : (
                classSubjectRows.map((item) => (
                  <tr key={item.classLabel}>
                    <td>{item.classLabel}</td>
                    <td>{item.subjects.join(', ')}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  )
}
