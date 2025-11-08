import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import NewCase from './pages/NewCase.jsx';
import CaseDetail from './pages/CaseDetail.jsx';
import AdminPanel from './pages/AdminPanel.jsx';
import Settings from './pages/Settings.jsx';

function App() {
  const [user, setUser] = React.useState(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });
  // Estado para guardar o tema do tenant (carga inicial vazia)
  const [theme, setTheme] = React.useState(null);

  // Lista de idiomas disponíveis para o tenant
  const [languageOptions, setLanguageOptions] = React.useState(['pt', 'en', 'es']);

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

  // Carrega configurações do tenant (incluindo tema) quando o usuário é definido
  React.useEffect(() => {
    async function fetchTheme() {
      if (!user) return;
      try {
        const response = await fetch('http://localhost:3000/api/settings', {
          headers: {
            Authorization: 'Bearer ' + localStorage.getItem('token'),
            'X-Tenant-ID': user.tenantId,
          },
        });
        const data = await response.json();
        if (response.ok) {
          const th = data.settings.theme || {};
          setTheme(th);
          // Aplica as cores no documento root para uso pelo Tailwind via CSS custom properties
          if (th.primaryColor) {
            document.documentElement.style.setProperty('--primary-color', th.primaryColor);
          }
          if (th.secondaryColor) {
            document.documentElement.style.setProperty('--secondary-color', th.secondaryColor);
          }
          // Define idiomas disponíveis
          const langs = data.settings.languages || ['pt', 'en', 'es'];
          setLanguageOptions(langs);
          // Armazena lista de idiomas para uso em componentes como Navbar
          localStorage.setItem('tenantLanguages', JSON.stringify(langs));
        }
      } catch (err) {
        // Falha ao carregar tema não deve travar aplicação
        console.error('Falha ao carregar configurações do tenant', err);
      }
    }
    fetchTheme();
  }, [user]);

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
        <Route
          path="/settings"
          element={
            user && ['admin', 'ceo'].includes(user.role) ? <Settings user={user} /> : <Navigate to="/" />
          }
        />
      </Routes>
    </Router>
  );
}

export default App;