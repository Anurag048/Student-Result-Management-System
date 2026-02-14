import React from 'react'
import '../css/classPage.css'
import Layout from '../components/Layout'
import { API_BASE, buildAuthHeaders, getJson } from '../utils/api.js'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'

const getStudentClassId = (student) => student?.classId?._id || student?.classId || ''

const buildStudentDraft = (student) => ({
  username: student?.userId?.username || '',
  email: student?.userId?.email || '',
  enrollmentNumber: student?.enrollmentNumber || '',
  classId: getStudentClassId(student),
  password: ''
})

const escapeCsv = (value) => {
  const normalized = String(value ?? '')
  return `"${normalized.replace(/"/g, '""')}"`
}

export default function ClassPage() {
  const { token } = useAuth()
  const { showToast } = useToast()
  const [classes, setClasses] = React.useState([])
  const [students, setStudents] = React.useState([])
  const [teachers, setTeachers] = React.useState([])
  const [selectedClassId, setSelectedClassId] = React.useState('')
  const [studentDrafts, setStudentDrafts] = React.useState({})
  const [classForm, setClassForm] = React.useState({
    name: '',
    section: '',
    classInchargeId: ''
  })

  const loadData = React.useCallback(async () => {
    try {
      const headers = buildAuthHeaders(token)
      const [classesRes, studentsRes, teachersRes] = await Promise.all([
        fetch(`${API_BASE}/admin/classes`, { headers }),
        fetch(`${API_BASE}/admin/students`, { headers }),
        fetch(`${API_BASE}/admin/teachers`, { headers })
      ])

      const classesData = await getJson(classesRes)
      const studentsData = await getJson(studentsRes)
      const teachersData = await getJson(teachersRes)

      setClasses(classesData.classes || [])
      setStudents(studentsData.students || [])
      setTeachers(teachersData.teachers || [])
    } catch (error) {
      showToast(error.message || 'Failed to load classes', 'error')
    }
  }, [showToast, token])

  React.useEffect(() => {
    loadData()
  }, [loadData])

  React.useEffect(() => {
    if (selectedClassId && classes.some((item) => item._id === selectedClassId)) return
    setSelectedClassId(classes[0]?._id || '')
  }, [classes, selectedClassId])

  const handleCreateClass = async () => {
    if (!classForm.name.trim() || !classForm.section.trim()) {
      showToast('Please fill class name and section', 'error')
      return
    }

    try {
      const response = await fetch(`${API_BASE}/admin/classes`, {
        method: 'POST',
        headers: buildAuthHeaders(token),
        body: JSON.stringify({
          name: classForm.name.trim(),
          section: classForm.section.trim().toUpperCase(),
          classInchargeId: classForm.classInchargeId || undefined
        })
      })
      await getJson(response)
      showToast('Class created successfully', 'success')
      setClassForm({ name: '', section: '', classInchargeId: '' })
      await loadData()
    } catch (error) {
      showToast(error.message || 'Failed to create class', 'error')
    }
  }

  const handleUpdateIncharge = async (classId, classInchargeId) => {
    if (!classInchargeId) {
      showToast('Please select a class incharge', 'error')
      return
    }
    try {
      const response = await fetch(`${API_BASE}/admin/classes/${classId}/incharge`, {
        method: 'PUT',
        headers: buildAuthHeaders(token),
        body: JSON.stringify({ classInchargeId })
      })
      await getJson(response)
      showToast('Class incharge updated', 'success')
      await loadData()
    } catch (error) {
      showToast(error.message || 'Failed to update class incharge', 'error')
    }
  }

  const classRows = React.useMemo(() => {
    const studentCountByClass = students.reduce((acc, student) => {
      const classId = student?.classId?._id || student?.classId
      if (!classId) return acc
      acc[classId] = (acc[classId] || 0) + 1
      return acc
    }, {})

    return classes.map((item) => ({
      id: item._id,
      name: item.name,
      section: item.section,
      totalStudents: studentCountByClass[item._id] || 0,
      classIncharge: item.classInchargeId || null
    }))
  }, [classes, students])

  const selectedClass = React.useMemo(
    () => classes.find((item) => item._id === selectedClassId) || null,
    [classes, selectedClassId]
  )

  const selectedClassStudents = React.useMemo(
    () => students.filter((student) => getStudentClassId(student) === selectedClassId),
    [selectedClassId, students]
  )

  React.useEffect(() => {
    setStudentDrafts((prev) => {
      const next = { ...prev }
      selectedClassStudents.forEach((student) => {
        if (!next[student._id]) {
          next[student._id] = buildStudentDraft(student)
        }
      })
      return next
    })
  }, [selectedClassStudents])

  const handleStudentDraftChange = (studentId, key, value) => {
    setStudentDrafts((prev) => ({
      ...prev,
      [studentId]: {
        ...(prev[studentId] || {}),
        [key]: value
      }
    }))
  }

  const handleUpdateStudent = async (studentId) => {
    const draft = studentDrafts[studentId]
    if (!draft?.username?.trim() || !draft?.email?.trim() || !draft?.enrollmentNumber?.trim()) {
      showToast('Username, email and enrollment number are required', 'error')
      return
    }

    try {
      const payload = {
        username: draft.username.trim(),
        email: draft.email.trim(),
        enrollmentNumber: draft.enrollmentNumber.trim(),
        classId: draft.classId
      }
      if (draft.password?.trim()) {
        payload.password = draft.password.trim()
      }

      const response = await fetch(`${API_BASE}/admin/students/${studentId}`, {
        method: 'PUT',
        headers: buildAuthHeaders(token),
        body: JSON.stringify(payload)
      })
      await getJson(response)
      showToast('Student updated', 'success')
      await loadData()
    } catch (error) {
      showToast(error.message || 'Failed to update student', 'error')
    }
  }

  const handleShiftStudent = async (studentId) => {
    const draft = studentDrafts[studentId]
    if (!draft?.classId) {
      showToast('Please select a class', 'error')
      return
    }

    try {
      const response = await fetch(`${API_BASE}/admin/students/${studentId}/shift-class`, {
        method: 'PUT',
        headers: buildAuthHeaders(token),
        body: JSON.stringify({ classId: draft.classId })
      })
      await getJson(response)
      showToast('Student shifted successfully', 'success')
      await loadData()
    } catch (error) {
      showToast(error.message || 'Failed to shift student', 'error')
    }
  }

  const handleDeleteStudent = async (studentId, username) => {
    const confirmed = window.confirm(`Remove ${username || 'this student'} from school records?`)
    if (!confirmed) return

    try {
      const response = await fetch(`${API_BASE}/admin/students/${studentId}`, {
        method: 'DELETE',
        headers: buildAuthHeaders(token)
      })
      await getJson(response)
      showToast('Student removed', 'success')
      await loadData()
    } catch (error) {
      showToast(error.message || 'Failed to remove student', 'error')
    }
  }

  const handleDownloadSelectedClass = () => {
    if (!selectedClass) {
      showToast('Select a class first', 'error')
      return
    }

    const headers = ['Username', 'Email', 'Enrollment Number', 'Class', 'Section']
    const rows = selectedClassStudents.map((student) => [
      student?.userId?.username || '',
      student?.userId?.email || '',
      student?.enrollmentNumber || '',
      selectedClass.name || '',
      selectedClass.section || ''
    ])

    const csv = [headers, ...rows]
      .map((row) => row.map((cell) => escapeCsv(cell)).join(','))
      .join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${selectedClass.name}-${selectedClass.section}-students.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return (
    <Layout title="Class Section">
      <div className="class-frame">
        <div className="class-card">
          <h2>Create Class</h2>
          <div className="class-form-grid">
            <input
              type="text"
              placeholder="Class Name"
              value={classForm.name}
              onChange={(e) => setClassForm({ ...classForm, name: e.target.value })}
            />
            <input
              type="text"
              placeholder="Section (A/B/C)"
              value={classForm.section}
              onChange={(e) => setClassForm({ ...classForm, section: e.target.value })}
            />
            <select
              value={classForm.classInchargeId}
              onChange={(e) => setClassForm({ ...classForm, classInchargeId: e.target.value })}
            >
              <option value="">Select Class Incharge (Optional)</option>
              {teachers.map((teacher) => (
                <option key={teacher._id} value={teacher._id}>
                  {teacher.username}
                </option>
              ))}
            </select>
            <button onClick={handleCreateClass}>Create Class</button>
          </div>
        </div>

        <div className="class-table-card">
          <h2>Classes</h2>
          <div className="class-table-wrapper">
            <table className="class-table">
              <thead>
                <tr>
                  <th>Class</th>
                  <th>Section</th>
                  <th>Total Students</th>
                  <th>Class Incharge</th>
                  <th>Update Incharge</th>
                </tr>
              </thead>
              <tbody>
                {classRows.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="class-table-empty">
                      No classes found
                    </td>
                  </tr>
                ) : (
                  classRows.map((row) => (
                    <tr
                      key={row.id}
                      className={selectedClassId === row.id ? 'class-table-row-selected' : ''}
                      onClick={() => setSelectedClassId(row.id)}
                    >
                      <td>{row.name}</td>
                      <td>{row.section}</td>
                      <td>{row.totalStudents}</td>
                      <td>{row.classIncharge?.username || '-'}</td>
                      <td>
                        <div className="incharge-update-group">
                          <select
                            key={`${row.id}-${row.classIncharge?._id || 'none'}`}
                            defaultValue={row.classIncharge?._id || ''}
                            onChange={(e) => handleUpdateIncharge(row.id, e.target.value)}
                          >
                            <option value="">Select Incharge</option>
                            {teachers.map((teacher) => (
                              <option key={teacher._id} value={teacher._id}>
                                {teacher.username}
                              </option>
                            ))}
                          </select>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="class-table-card class-students-card">
        <div className="class-students-header">
          <h2>
            Students {selectedClass ? `- ${selectedClass.name}-${selectedClass.section}` : ''}
          </h2>
          <button onClick={handleDownloadSelectedClass}>Download CSV</button>
        </div>
        <div className="class-table-wrapper">
          <table className="class-table students-table">
            <thead>
              <tr>
                <th>Username</th>
                <th>Email</th>
                <th>Enrollment</th>
                <th>Class</th>
                <th>New Password</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {!selectedClass ? (
                <tr>
                  <td colSpan="6" className="class-table-empty">
                    Select a class to view students
                  </td>
                </tr>
              ) : selectedClassStudents.length === 0 ? (
                <tr>
                  <td colSpan="6" className="class-table-empty">
                    No students found in this class
                  </td>
                </tr>
              ) : (
                selectedClassStudents.map((student) => {
                  const draft = studentDrafts[student._id] || buildStudentDraft(student)
                  return (
                    <tr key={student._id}>
                      <td>
                        <input
                          value={draft.username}
                          onChange={(e) =>
                            handleStudentDraftChange(student._id, 'username', e.target.value)
                          }
                        />
                      </td>
                      <td>
                        <input
                          value={draft.email}
                          onChange={(e) =>
                            handleStudentDraftChange(student._id, 'email', e.target.value)
                          }
                        />
                      </td>
                      <td>
                        <input
                          value={draft.enrollmentNumber}
                          onChange={(e) =>
                            handleStudentDraftChange(
                              student._id,
                              'enrollmentNumber',
                              e.target.value
                            )
                          }
                        />
                      </td>
                      <td>
                        <select
                          value={draft.classId}
                          onChange={(e) =>
                            handleStudentDraftChange(student._id, 'classId', e.target.value)
                          }
                        >
                          <option value="">Select Class</option>
                          {classes.map((item) => (
                            <option key={item._id} value={item._id}>
                              {item.name}-{item.section}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td>
                        <input
                          type="password"
                          placeholder="Optional"
                          value={draft.password}
                          onChange={(e) =>
                            handleStudentDraftChange(student._id, 'password', e.target.value)
                          }
                        />
                      </td>
                      <td>
                        <div className="student-actions">
                          <button onClick={() => handleUpdateStudent(student._id)}>Update</button>
                          <button onClick={() => handleShiftStudent(student._id)}>Shift</button>
                          <button
                            className="danger-btn"
                            onClick={() =>
                              handleDeleteStudent(student._id, student?.userId?.username || '')
                            }
                          >
                            Remove
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  )
}
