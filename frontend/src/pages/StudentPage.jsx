import React from 'react'
import Layout from '../components/Layout.jsx'
import { API_BASE, buildAuthHeaders, getJson } from '../utils/api.js'
import { useAuth } from '../context/AuthContext.jsx'
import { useToast } from '../context/ToastContext.jsx'
import '../css/studentPage.css'

export default function StudentPage() {
  const { token } = useAuth()
  const { showToast } = useToast()
  const [resultSheets, setResultSheets] = React.useState([])
  const [student, setStudent] = React.useState(null)

  React.useEffect(() => {
    const loadResults = async () => {
      try {
        const response = await fetch(`${API_BASE}/student/results`, {
          headers: buildAuthHeaders(token)
        })
        const data = await getJson(response)
        setResultSheets(data.resultSheets || [])
        setStudent(data.student || null)
      } catch (error) {
        showToast(error.message || 'Failed to load results', 'error')
      }
    }
    loadResults()
  }, [showToast, token])

  const handlePrint = () => {
    window.print()
  }

  return (
    <Layout title="My Results">
      <div className="student-result-toolbar no-print">
        <button onClick={handlePrint}>Print Result</button>
      </div>

      {student && (
        <div className="card result-meta-card">
          <h3>Student Details</h3>
          <div className="result-meta-grid">
            <div>
              <strong>Name:</strong> {student.username || '-'}
            </div>
            <div>
              <strong>Email:</strong> {student.email || '-'}
            </div>
            <div>
              <strong>Enrollment Number:</strong> {student.enrollmentNumber || '-'}
            </div>
            <div>
              <strong>Class:</strong> {student.class?.name || '-'}-{student.class?.section || '-'}
            </div>
            <div>
              <strong>Class Incharge:</strong> {student.class?.classInchargeId?.username || '-'}
            </div>
          </div>
        </div>
      )}

      {resultSheets.length === 0 ? (
        <div className="card">
          <div className="list-item">No results found yet.</div>
        </div>
      ) : (
        resultSheets.map((sheet) => (
          <div className="card result-sheet-card" key={sheet.exam?._id || sheet.exam?.name}>
            <div className="result-sheet-header">
              <h3>{sheet.exam?.name || 'Exam'}</h3>
              <div>
                {sheet.exam?.academicYear || '-'} |{' '}
                {sheet.exam?.date ? new Date(sheet.exam.date).toLocaleDateString() : '-'}
              </div>
            </div>

            <div className="result-sheet-table-wrapper">
              <table className="result-sheet-table">
                <thead>
                  <tr>
                    <th>Subject</th>
                    <th>Marks Obtained</th>
                    <th>Max Marks</th>
                    <th>Grade</th>
                  </tr>
                </thead>
                <tbody>
                  {sheet.subjects.map((subjectRow) => (
                    <tr key={subjectRow.resultId}>
                      <td>{subjectRow.subject}</td>
                      <td>{subjectRow.marksObtained}</td>
                      <td>{subjectRow.maxMarks}</td>
                      <td>{subjectRow.grade}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td>
                      <strong>Total</strong>
                    </td>
                    <td>
                      <strong>{sheet.totals?.obtainedMarks ?? 0}</strong>
                    </td>
                    <td>
                      <strong>{sheet.totals?.maxMarks ?? 0}</strong>
                    </td>
                    <td>
                      <strong>{sheet.totals?.percentage ?? 0}%</strong>
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        ))
      )}
    </Layout>
  )
}
