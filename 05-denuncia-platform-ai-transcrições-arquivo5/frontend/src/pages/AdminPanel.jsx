import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar.jsx';

function AdminPanel({ user }) {
  const [users, setUsers] = useState([]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  const fetchUsers = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/users', {
        headers: {
          Authorization: 'Bearer ' + localStorage.getItem('token'),
          'X-Tenant-ID': user.tenantId,
        },
      });
      const data = await response.json();
      if (response.ok) {
        setUsers(data.users);
      } else {
        setError(data.mensagem || 'Falha ao obter usuários');
      }
    } catch (err) {
      setError('Erro de rede');
    }
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    try {
      const response = await fetch('http://localhost:3000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + localStorage.getItem('token'),
          'X-Tenant-ID': user.tenantId,
        },
        body: JSON.stringify({ name, email, password, role }),
      });
      const data = await response.json();
      if (response.ok) {
        setMessage('Usuário criado com sucesso');
        setName('');
        setEmail('');
        setPassword('');
        setRole('user');
        fetchUsers();
      } else {
        setError(data.mensagem || 'Não foi possível criar usuário');
      }
    } catch (err) {
      setError('Erro de rede');
    }
  };

  return (
    <div>
      <Navbar user={user} onLogout={() => {}} />
      <div className="p-4 max-w-4xl mx-auto space-y-6">
        <h2 className="text-lg font-semibold">Administração</h2>
        {error && <p className="text-red-600">{error}</p>}
        {message && <p className="text-green-700">{message}</p>}
        {/* Lista de usuários */}
        <div className="border rounded p-4 bg-white overflow-auto">
          <h3 className="font-semibold mb-2">Usuários da empresa</h3>
          {users.length === 0 ? (
            <p>Nenhum usuário encontrado.</p>
          ) : (
            <table className="min-w-full text-sm">
              <thead>
                <tr>
                  <th className="text-left p-2">Nome</th>
                  <th className="text-left p-2">E‑mail</th>
                  <th className="text-left p-2">Perfil</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-t">
                    <td className="p-2">{u.name}</td>
                    <td className="p-2">{u.email}</td>
                    <td className="p-2">{u.role}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        {/* Formulário para criar usuário */}
        <div className="border rounded p-4 bg-white">
          <h3 className="font-semibold mb-2">Adicionar usuário</h3>
          <form onSubmit={handleCreate} className="space-y-3">
            <div>
              <label className="block text-sm mb-1">Nome</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border p-2 rounded"
                required
              />
            </div>
            <div>
              <label className="block text-sm mb-1">E‑mail</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border p-2 rounded"
                required
              />
            </div>
            <div>
              <label className="block text-sm mb-1">Senha</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border p-2 rounded"
                required
              />
            </div>
            <div>
              <label className="block text-sm mb-1">Perfil</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full border p-2 rounded"
              >
                <option value="user">Usuário</option>
                <option value="triage">Triagem</option>
                <option value="investigator">Investigador</option>
                <option value="ceo">Diretor</option>
                <option value="admin">Administrador</option>
              </select>
            </div>
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Criar usuário
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AdminPanel;