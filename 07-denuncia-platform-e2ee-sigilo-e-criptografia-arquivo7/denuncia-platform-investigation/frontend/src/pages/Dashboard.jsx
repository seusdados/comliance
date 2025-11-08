import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import Chart from '../components/Chart.jsx';

function Dashboard({ user, onLogout }) {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCases = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch('http://localhost:3000/api/cases', {
          headers: {
            Authorization: 'Bearer ' + localStorage.getItem('token'),
            'X-Tenant-ID': user.tenantId,
          },
        });
        const data = await response.json();
        if (response.ok) {
          setCases(data.cases);
        } else {
          setError(data.mensagem || 'Falha ao buscar casos');
        }
      } catch (err) {
        setError('Erro de rede');
      } finally {
        setLoading(false);
      }
    };
    fetchCases();
  }, [user]);

  // Agrupa por status para o gráfico
  const statusCounts = cases.reduce((acc, c) => {
    acc[c.status] = (acc[c.status] || 0) + 1;
    return acc;
  }, {});

  const chartData = {
    labels: Object.keys(statusCounts),
    datasets: [
      {
        label: 'Casos por status',
        data: Object.values(statusCounts),
      },
    ],
  };

  return (
    <div>
      <Navbar user={user} onLogout={onLogout} />
      <div className="p-4 space-y-4">
        <h2 className="text-lg font-semibold">Painel</h2>
        {loading && <p>Carregando…</p>}
        {error && <p className="text-red-600">{error}</p>}
        {!loading && !error && (
          <>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 border rounded bg-white">
                <Chart chartData={chartData} />
              </div>
              <div className="p-4 border rounded bg-white overflow-auto">
                {cases.length === 0 ? (
                  <p>Nenhum caso registrado.</p>
                ) : (
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr>
                        <th className="text-left p-2">ID</th>
                        <th className="text-left p-2">Título</th>
                        <th className="text-left p-2">Status</th>
                        <th className="text-left p-2">Prioridade</th>
                        <th className="text-left p-2">Categorias</th>
                        <th className="text-left p-2">Data</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cases.map((c) => (
                        <tr key={c.id} className="border-t">
                          <td className="p-2">
                            <Link to={`/caso/${c.id}`} className="text-blue-600 hover:underline">
                              {c.id.substring(0, 6)}
                            </Link>
                          </td>
                          <td className="p-2">{c.title}</td>
                          <td className="p-2 capitalize">{c.status}</td>
                          <td className="p-2 capitalize">{c.priority?.level || '-'}</td>
                          <td className="p-2">{(c.categories || []).join(', ')}</td>
                          <td className="p-2">
                            {new Date(c.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Dashboard;