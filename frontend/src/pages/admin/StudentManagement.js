import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../../styles/StudentManagement.css';

const StudentManagement = () => {
  const [students, setStudents] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
  const [showExpiryModal, setShowExpiryModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [newExpiryDate, setNewExpiryDate] = useState('');
  const [generatedPassword, setGeneratedPassword] = useState('');
  const [generatedEmail, setGeneratedEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [newStudent, setNewStudent] = useState({
    full_name: '',
    email: '',
    age: '',
    school: '',
    country: '',
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
      const response = await axios.post('/api/admin/students', newStudent);
      
      // Show generated password to admin
      setGeneratedEmail(response.data.student.email);
      setGeneratedPassword(response.data.defaultPassword);
      setShowPasswordModal(true);
      
      setShowCreateModal(false);
      setNewStudent({ full_name: '', email: '', age: '', school: '', country: '', expires_at: '' });
      fetchStudents();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to create student');
    }
  };

  const toggleStudentStatus = async (studentId) => {
    try {
      await axios.patch(`/api/admin/students/${studentId}/toggle-active`);
      fetchStudents();
    } catch (error) {
      alert('Failed to update student status');
    }
  };

  const handleResetPassword = async (student) => {
    setSelectedStudent(student);
    setShowResetPasswordModal(true);
  };

  const confirmResetPassword = async () => {
    try {
      const response = await axios.post(`/api/password/admin/reset/${selectedStudent.id}`, {});
      
      setGeneratedEmail(response.data.student.email);
      setGeneratedPassword(response.data.newPassword);
      setShowResetPasswordModal(false);
      setShowPasswordModal(true);
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to reset password');
    }
  };

  const handleUpdateExpiry = async (student) => {
    setSelectedStudent(student);
    setNewExpiryDate(student.expires_at ? student.expires_at.split('T')[0] : '');
    setShowExpiryModal(true);
  };

  const confirmUpdateExpiry = async () => {
    try {
      await axios.patch(`/api/admin/students/${selectedStudent.id}/expiry`, {
        expires_at: newExpiryDate || null
      });
      alert('✅ Expiry date updated successfully!');
      setShowExpiryModal(false);
      fetchStudents();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to update expiry date');
    }
  };

  if (loading) {
    return <div className="loading">Loading students...</div>;
  }

  return (
    <div className="student-management">
      <div className="page-header">
        <h1>🎓 Student Management</h1>
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
              <th>School</th>
              <th>Country</th>
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
                <td>{student.school || 'N/A'}</td>
                <td>{student.country || 'N/A'}</td>
                <td>
                  <span className={`status-badge ${student.is_active ? 'active' : 'inactive'}`}>
                    {student.is_active ? '✅ Active' : '❌ Inactive'}
                  </span>
                </td>
                <td>{student.expires_at ? new Date(student.expires_at).toLocaleDateString() : 'Never'}</td>
                <td>{new Date(student.created_at).toLocaleDateString()}</td>
                <td>
                  <div className="action-buttons">
                    <button 
                      onClick={() => toggleStudentStatus(student.id)}
                      className={`toggle-btn ${student.is_active ? 'deactivate' : 'activate'}`}
                    >
                      {student.is_active ? 'Deactivate' : 'Activate'}
                    </button>
                    <button 
                      onClick={() => handleResetPassword(student)}
                      className="reset-password-btn"
                      title="Reset student password"
                    >
                      🔐 Reset Pwd
                    </button>
                    <button 
                      onClick={() => handleUpdateExpiry(student)}
                      className="update-expiry-btn"
                      title="Update expiry date"
                    >
                      📅 Expiry
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Create Student Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>✨ Create Student Account</h2>
              <button onClick={() => setShowCreateModal(false)} className="close-btn">×</button>
            </div>
            <form onSubmit={handleCreateStudent}>
              <div className="form-group">
                <label>Full Name *</label>
                <input
                  type="text"
                  value={newStudent.full_name}
                  onChange={(e) => setNewStudent({...newStudent, full_name: e.target.value})}
                  placeholder="John Doe"
                  required
                />
              </div>
              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  value={newStudent.email}
                  onChange={(e) => setNewStudent({...newStudent, email: e.target.value})}
                  placeholder="student@example.com"
                  required
                />
                <small>💡 Default password will be the first 8 characters of the email</small>
              </div>
              <div className="form-group">
                <label>Age</label>
                <input
                  type="number"
                  value={newStudent.age}
                  onChange={(e) => setNewStudent({...newStudent, age: e.target.value})}
                  placeholder="15"
                />
              </div>
              <div className="form-group">
                <label>School</label>
                <input
                  type="text"
                  value={newStudent.school}
                  onChange={(e) => setNewStudent({...newStudent, school: e.target.value})}
                  placeholder="Springfield High School"
                />
              </div>
              <div className="form-group">
                <label>Country</label>
                <input
                  type="text"
                  value={newStudent.country}
                  onChange={(e) => setNewStudent({...newStudent, country: e.target.value})}
                  placeholder="India"
                />
              </div>
              <div className="form-group">
                <label>Account Expires At *</label>
                <input
                  type="date"
                  value={newStudent.expires_at}
                  onChange={(e) => setNewStudent({...newStudent, expires_at: e.target.value})}
                  required
                />
                <small>📅 Account will be automatically deactivated after this date</small>
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => setShowCreateModal(false)} className="cancel-btn">
                  Cancel
                </button>
                <button type="submit" className="submit-btn">
                  ✅ Create Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reset Password Confirmation Modal */}
      {showResetPasswordModal && (
        <div className="modal-overlay" onClick={() => setShowResetPasswordModal(false)}>
          <div className="modal-content confirmation-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>⚠️ Reset Password</h2>
            </div>
            <div className="confirmation-content">
              <p>Are you sure you want to reset the password for:</p>
              <p className="student-name"><strong>{selectedStudent?.full_name}</strong></p>
              <p className="student-email">{selectedStudent?.email}</p>
              <p className="warning-text">💡 A new random password will be generated and shown to you.</p>
            </div>
            <div className="modal-actions">
              <button onClick={() => setShowResetPasswordModal(false)} className="cancel-btn">
                Cancel
              </button>
              <button onClick={confirmResetPassword} className="submit-btn danger">
                ✅ Yes, Reset Password
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Update Expiry Modal */}
      {showExpiryModal && (
        <div className="modal-overlay" onClick={() => setShowExpiryModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>📅 Update Expiry Date</h2>
            </div>
            <div className="modal-body">
              <p><strong>Student:</strong> {selectedStudent?.full_name}</p>
              <p><strong>Email:</strong> {selectedStudent?.email}</p>
              <div className="form-group" style={{marginTop: '1rem'}}>
                <label>New Expiry Date</label>
                <input
                  type="date"
                  value={newExpiryDate}
                  onChange={(e) => setNewExpiryDate(e.target.value)}
                />
                <small>💡 Leave empty to remove expiry date (account never expires)</small>
              </div>
            </div>
            <div className="modal-actions">
              <button onClick={() => setShowExpiryModal(false)} className="cancel-btn">
                Cancel
              </button>
              <button onClick={confirmUpdateExpiry} className="submit-btn">
                ✅ Update Expiry
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Password Display Modal */}
      {showPasswordModal && (
        <div className="modal-overlay" onClick={() => setShowPasswordModal(false)}>
          <div className="modal-content password-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>✅ New Password Generated!</h2>
            </div>
            <div className="password-display">
              <p><strong>Email:</strong> {generatedEmail}</p>
              <p><strong>Password:</strong> <code className="password-code">{generatedPassword}</code></p>
              <div className="warning">
                <p>⚠️ <strong>Important:</strong> Share these credentials with the student securely. They can change their password after logging in.</p>
              </div>
            </div>
            <div className="modal-actions">
              <button onClick={() => {
                navigator.clipboard.writeText(`Email: ${generatedEmail}\nPassword: ${generatedPassword}`);
                alert('✅ Credentials copied to clipboard!');
              }} className="copy-btn">
                📋 Copy Credentials
              </button>
              <button onClick={() => setShowPasswordModal(false)} className="submit-btn">
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentManagement;