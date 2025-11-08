import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';

function CaseDetail({ user }) {
  const { id } = useParams();
  const [caseData, setCaseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState('');

  const fetchCase = async () => {
    try {
      const response = await fetch(`http://localhost:3000/api/cases/${id}`, {
        headers: {
          Authorization: 'Bearer ' + localStorage.getItem('token'),
          'X-Tenant-ID': user.tenantId,
        },
      });
      const data = await response.json();
      if (response.ok) {
        setCaseData(data.case);
      } else {
        setError(data.mensagem || 'Falha ao carregar caso');
      }
    } catch (err) {
      setError('Erro de rede');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCase();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const submitMessage = async (e) => {
    e.preventDefault();
    if (!message) return;
    try {
      const response = await fetch(`http://localhost:3000/api/cases/${id}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + localStorage.getItem('token'),
          'X-Tenant-ID': user.tenantId,
        },
        body: JSON.stringify({ content: message }),
      });
      const data = await response.json();
      if (response.ok) {
        setMessage('');
        fetchCase();
      } else {
        alert(data.mensagem || 'Não foi possível enviar');
      }
    } catch (err) {
      alert('Erro de rede');
    }
  };

  return (
    <div>
      <Navbar user={user} onLogout={() => {}} />
      <div className="p-4 max-w-3xl mx-auto">
        {loading && <p>Carregando…</p>}
        {error && <p className="text-red-600">{error}</p>}
        {caseData && (
          <>
            <h2 className="text-lg font-semibold mb-2">{caseData.title}</h2>
            <p className="mb-4">{caseData.description}</p>
            <div className="mb-4">
              <span className="font-semibold">Status:</span> {caseData.status}
            </div>
            <div className="mb-6">
              <h3 className="font-semibold mb-2">Mensagens</h3>
              {caseData.messages.length === 0 ? (
                <p>Nenhuma mensagem ainda.</p>
              ) : (
                <ul className="space-y-2">
                  {caseData.messages.map((m) => (
                    <li key={m.id} className="border rounded p-2 bg-white">
                      <div className="text-xs text-gray-500">
                        {new Date(m.createdAt).toLocaleString()}
                      </div>
                      <div>{m.content}</div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            {/* Formulário para adicionar mensagem */}
            <form onSubmit={submitMessage} className="space-y-2">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full border p-2 rounded"
                rows={3}
                placeholder="Escreva uma mensagem para a equipe"
              ></textarea>
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Enviar mensagem
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

export default CaseDetail;