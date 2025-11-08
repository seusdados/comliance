import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';

function CaseDetail({ user }) {
  const { id } = useParams();
  const [caseData, setCaseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState('');
  const [identity, setIdentity] = useState(null);

  // Estado para tarefas
  const [tasks, setTasks] = useState([]);
  const [tasksLoading, setTasksLoading] = useState(true);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDesc, setNewTaskDesc] = useState('');
  const [newTaskDueDate, setNewTaskDueDate] = useState('');

  // Verifica se o usuário tem permissão para manipular tarefas
  const canManageTasks = ['admin', 'ceo', 'triage', 'investigator'].includes(user.role);

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

  // Busca tarefas
  const fetchTasks = async () => {
    setTasksLoading(true);
    try {
      const response = await fetch(`http://localhost:3000/api/cases/${id}/tasks`, {
        headers: {
          Authorization: 'Bearer ' + localStorage.getItem('token'),
          'X-Tenant-ID': user.tenantId,
        },
      });
      const data = await response.json();
      if (response.ok) {
        setTasks(data.tasks || []);
      } else {
        // se 403, simplesmente ignora
        setTasks([]);
      }
    } catch (err) {
      setTasks([]);
    } finally {
      setTasksLoading(false);
    }
  };

  useEffect(() => {
    fetchCase();
    fetchTasks();
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

  const revealIdentity = async () => {
    try {
      const response = await fetch(`http://localhost:3000/api/cases/${id}/identity`, {
        headers: {
          Authorization: 'Bearer ' + localStorage.getItem('token'),
          'X-Tenant-ID': user.tenantId,
        },
      });
      const data = await response.json();
      if (response.ok) {
        setIdentity(data.identity);
      } else {
        alert(data.mensagem || 'Não foi possível revelar');
      }
    } catch (err) {
      alert('Erro de rede');
    }
  };

  // Criar nova tarefa
  const submitTask = async (e) => {
    e.preventDefault();
    if (!newTaskTitle) return;
    try {
      const response = await fetch(`http://localhost:3000/api/cases/${id}/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + localStorage.getItem('token'),
          'X-Tenant-ID': user.tenantId,
        },
        body: JSON.stringify({ title: newTaskTitle, description: newTaskDesc, dueDate: newTaskDueDate }),
      });
      const data = await response.json();
      if (response.ok) {
        setNewTaskTitle('');
        setNewTaskDesc('');
        setNewTaskDueDate('');
        fetchTasks();
      } else {
        alert(data.mensagem || 'Não foi possível criar a tarefa');
      }
    } catch (err) {
      alert('Erro de rede');
    }
  };

  // Concluir tarefa
  const completeTask = async (taskId) => {
    try {
      const response = await fetch(`http://localhost:3000/api/cases/${id}/tasks/${taskId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + localStorage.getItem('token'),
          'X-Tenant-ID': user.tenantId,
        },
        body: JSON.stringify({ status: 'concluido' }),
      });
      const data = await response.json();
      if (response.ok) {
        fetchTasks();
      } else {
        alert(data.mensagem || 'Não foi possível atualizar a tarefa');
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
            {caseData.categories && caseData.categories.length > 0 && (
              <p className="mb-2"><span className="font-semibold">Categorias:</span> {caseData.categories.join(', ')}</p>
            )}
            {caseData.priority && (
              <p className="mb-2"><span className="font-semibold">Prioridade:</span> {caseData.priority.level} (score {caseData.priority.score})</p>
            )}
            <div className="mb-4">
              <span className="font-semibold">Status:</span> {caseData.status}
            </div>
            {/* Botão para revelar identidade */}
            {caseData.identityId && (user.role === 'admin' || user.role === 'ceo') && (
              <div className="mb-4">
                <button
                  type="button"
                  onClick={revealIdentity}
                  className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                >
                  Revelar identidade
                </button>
                {identity && (
                  <div className="mt-2 p-2 border rounded bg-gray-50">
                    <div><strong>Nome:</strong> {identity.name}</div>
                    <div><strong>E‑mail:</strong> {identity.email}</div>
                  </div>
                )}
              </div>
            )}
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

            {/* Seção de tarefas (investigação) */}
            <div className="mt-8">
              <h3 className="font-semibold mb-2">Tarefas do processo de investigação</h3>
              {tasksLoading ? (
                <p>Carregando tarefas…</p>
              ) : tasks.length === 0 ? (
                <p>Nenhuma tarefa registrada.</p>
              ) : (
                <ul className="space-y-2">
                  {tasks.map((task) => (
                    <li key={task.id} className="border rounded p-3 bg-white">
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-medium">{task.title}</div>
                          <div className="text-sm text-gray-600">{task.description}</div>
                          {task.dueDate && (
                            <div className="text-sm text-gray-600">Vence em: {new Date(task.dueDate).toLocaleDateString()}</div>
                          )}
                          {task.assignedTo && (
                            <div className="text-sm text-gray-600">Responsável: {task.assignedTo}</div>
                          )}
                          <div className="text-sm font-semibold mt-1">Status: {task.status}</div>
                        </div>
                        {canManageTasks && task.status !== 'concluido' && (
                          <button
                            type="button"
                            onClick={() => completeTask(task.id)}
                            className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                          >
                            Concluir
                          </button>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
              {canManageTasks && (
                <div className="mt-4">
                  <h4 className="font-medium mb-1">Nova tarefa</h4>
                  <form onSubmit={submitTask} className="space-y-2">
                    <input
                      type="text"
                      value={newTaskTitle}
                      onChange={(e) => setNewTaskTitle(e.target.value)}
                      className="w-full border p-2 rounded"
                      placeholder="Título"
                    />
                    <textarea
                      value={newTaskDesc}
                      onChange={(e) => setNewTaskDesc(e.target.value)}
                      className="w-full border p-2 rounded"
                      rows={2}
                      placeholder="Descrição (opcional)"
                    ></textarea>
                    <input
                      type="date"
                      value={newTaskDueDate}
                      onChange={(e) => setNewTaskDueDate(e.target.value)}
                      className="border p-2 rounded"
                    />
                    <button
                      type="submit"
                      className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                    >
                      Adicionar tarefa
                    </button>
                  </form>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default CaseDetail;