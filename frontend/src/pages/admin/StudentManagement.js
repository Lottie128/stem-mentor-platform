import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../../styles/StudentManagement.css';

const StudentManagement = () => {
  const [students, setStudents] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [newStudent, setNewStudent] = useState({
    full_name: '',
    email: '',
    password: '',
    expires_at: ''
  });

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await axios.get('/api/admin/students');
      setStudents(response.data);
    } catch (error) {
      console.error('Failed to fetch students:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateStudent = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/admin/students', newStudent);
      setShowCreateModal(false);
      setNewStudent({ full_name: '', email: '', password: '', expires_at: '' });
      fetchStudents();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to create student');
    }
  };

  const toggleStudentStatus = async (studentId, currentStatus) => {
    try {
      await axios.patch(`/api/admin/students/${studentId}/status`, {
        is_active: !currentStatus
      });
      fetchStudents();
    } catch (error) {
      alert('Failed to update student status');
    }
  };

  if (loading) {
    return <div className="loading">Loading students...</div>;
  }

  return (
    <div className="student-management">
      <div className="page-header">
        <h1>Student Management</h1>
        <button onClick={() => setShowCreateModal(true)} className="create-btn">
          + Create Student Account
        </button>
      </div>

      <div className="students-table">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Status</th>
              <th>Expires At</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {students.map(student => (
              <tr key={student.id}>
                <td>{student.full_name}</td>
                <td>{student.email}</td>
                <td>
                  <span className={`status-badge ${student.is_active ? 'active' : 'inactive'}`}>
                    {student.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td>{student.expires_at ? new Date(student.expires_at).toLocaleDateString() : 'Never'}</td>
                <td>{new Date(student.created_at).toLocaleDateString()}</td>
                <td>
                  <button 
                    onClick={() => toggleStudentStatus(student.id, student.is_active)}
                    className={`toggle-btn ${student.is_active ? 'deactivate' : 'activate'}`}
                  >
                    {student.is_active ? 'Deactivate' : 'Activate'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Create Student Account</h2>
              <button onClick={() => setShowCreateModal(false)} className="close-btn">×</button>
            </div>
            <form onSubmit={handleCreateStudent}>
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  value={newStudent.full_name}
                  onChange={(e) => setNewStudent({...newStudent, full_name: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={newStudent.email}
                  onChange={(e) => setNewStudent({...newStudent, email: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  value={newStudent.password}
                  onChange={(e) => setNewStudent({...newStudent, password: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Expires At (Optional)</label>
                <input
                  type="date"
                  value={newStudent.expires_at}
                  onChange={(e) => setNewStudent({...newStudent, expires_at: e.target.value})}
                />
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => setShowCreateModal(false)} className="cancel-btn">
                  Cancel
                </button>
                <button type="submit" className="submit-btn">
                  Create Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentManagement;