import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import NewCase from './pages/NewCase.jsx';
import CaseDetail from './pages/CaseDetail.jsx';
import AdminPanel from './pages/AdminPanel.jsx';

function App() {
  const [user, setUser] = React.useState(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });

  const handleLogin = (userData, token) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', token);
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login onLogin={handleLogin} />} />
        <Route
          path="/"
          element={
            user ? <Dashboard user={user} onLogout={handleLogout} /> : <Navigate to="/login" />
          }
        />
        <Route
          path="/novo"
          element={
            user ? <NewCase user={user} /> : <Navigate to="/login" />
          }
        />
        <Route
          path="/caso/:id"
          element={
            user ? <CaseDetail user={user} /> : <Navigate to="/login" />
          }
        />
        <Route
          path="/admin"
          element={
            user && user.role === 'admin' ? <AdminPanel user={user} /> : <Navigate to="/" />
          }
        />
      </Routes>
    </Router>
  );
}

export default App;