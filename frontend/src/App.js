import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Loader from './components/Loader';
import Header from './components/Header';
import ParticlesBackground from './components/ParticlesBackground';
import Login from './pages/Login';
import NotActive from './pages/NotActive';
import AdminDashboard from './pages/admin/AdminDashboard';
import StudentManagement from './pages/admin/StudentManagement';
import ProjectReview from './pages/admin/ProjectReview';
import IBRManagement from './pages/admin/IBRManagement';
import StudentDashboard from './pages/student/StudentDashboard';
import ProjectSubmit from './pages/student/ProjectSubmit';
import ProjectView from './pages/student/ProjectView';
import Awards from './pages/student/Awards';
import IBRApplication from './pages/student/IBRApplication';
import ProfileEdit from './pages/student/ProfileEdit';
import CertificateView from './pages/CertificateView';
import PublicPortfolio from './pages/PublicPortfolio';
import PublicProjectView from './pages/PublicProjectView';
import './styles/App.css';

function App() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    
    setTimeout(() => {
      setLoading(false);
    }, 2000);
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <Router
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true
      }}
    >
      <div className="app">
        <ParticlesBackground />
        {user && <Header user={user} onLogout={handleLogout} />}
        
        <main className="app-main">
          <Routes>
            <Route 
              path="/login" 
              element={user ? <Navigate to={user.role === 'ADMIN' ? '/admin' : '/student'} /> : <Login onLogin={handleLogin} />} 
            />
            <Route path="/not-active" element={<NotActive />} />

            {/* Public routes */}
            <Route path="/portfolio/:username" element={<PublicPortfolio />} />
            <Route path="/portfolio/:username/project/:projectId" element={<PublicProjectView />} />
            <Route path="/certificate/:certificateId" element={<CertificateView />} />

            {/* Admin routes */}
            <Route 
              path="/admin" 
              element={user?.role === 'ADMIN' ? <AdminDashboard /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/admin/students" 
              element={user?.role === 'ADMIN' ? <StudentManagement /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/admin/projects/:projectId" 
              element={user?.role === 'ADMIN' ? <ProjectReview /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/admin/ibr" 
              element={user?.role === 'ADMIN' ? <IBRManagement /> : <Navigate to="/login" />} 
            />

            {/* Student routes */}
            <Route 
              path="/student" 
              element={user?.role === 'STUDENT' && user?.is_active ? <StudentDashboard /> : <Navigate to={user?.role === 'STUDENT' ? '/not-active' : '/login'} />} 
            />
            <Route 
              path="/student/submit" 
              element={user?.role === 'STUDENT' && user?.is_active ? <ProjectSubmit /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/student/projects/:projectId" 
              element={user?.role === 'STUDENT' && user?.is_active ? <ProjectView /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/student/awards" 
              element={user?.role === 'STUDENT' && user?.is_active ? <Awards /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/student/profile" 
              element={user?.role === 'STUDENT' && user?.is_active ? <ProfileEdit /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/student/ibr-apply" 
              element={user?.role === 'STUDENT' && user?.is_active ? <IBRApplication /> : <Navigate to="/login" />} 
            />

            <Route path="*" element={<Navigate to={user ? (user.role === 'ADMIN' ? '/admin' : '/student') : '/login'} />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;