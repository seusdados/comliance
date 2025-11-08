import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
// Importa utilidades para classificação e criptografia
import { classifyCase, evaluatePriority, summarizeText } from '../utils/classification.js';
import { generateRandomKey, encryptObject } from '../utils/crypto.js';

function NewCase({ user }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [anonymous, setAnonymous] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      // Gera chave de criptografia e prepara objeto sensível
      const key = generateRandomKey();
      // Classifica e avalia prioridade localmente
      const autoCategories = classifyCase(description);
      const priorityObj = evaluatePriority(description);
      const summary = summarizeText(description);
      // Determina categorias finais: utiliza categoria manual se fornecida
      let categories = [];
      if (category) {
        categories = Array.isArray(category) ? category : [category];
      } else {
        categories = autoCategories;
      }
      // Usa avaliação local como prioridade inicial;
      const priority = priorityObj;
      const sensitiveFields = {
        title,
        description,
        summary,
        priority,
        categories,
      };
      const encryptedData = encryptObject(sensitiveFields, key);
      const body = {
        encryptedData,
        categories,
        priority,
        anonymous,
      };
      const response = await fetch('http://localhost:3000/api/cases', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + localStorage.getItem('token'),
          'X-Tenant-ID': user.tenantId,
        },
        body: JSON.stringify(body),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.mensagem || 'Erro ao criar caso');
        return;
      }
      // Armazena a chave localmente associada ao ID do caso para descriptografia futura
      if (data.case && data.case.id) {
        localStorage.setItem(`case-key-${data.case.id}`, key);
      }
      navigate('/');
    } catch (err) {
      setError('Erro de rede');
    }
  };

  return (
    <div>
      <Navbar user={user} onLogout={() => {}} />
      <div className="max-w-xl mx-auto p-4">
        <h2 className="text-lg font-semibold mb-4">Nova denúncia</h2>
        {error && <p className="text-red-600 mb-2">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm mb-1">Título</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border p-2 rounded"
              required
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Descrição</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full border p-2 rounded"
              rows={4}
              required
            ></textarea>
          </div>
          <div>
            <label className="block text-sm mb-1">Categoria</label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full border p-2 rounded"
              placeholder="Fraude, assédio, discriminação..."
            />
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={anonymous}
              onChange={(e) => setAnonymous(e.target.checked)}
              id="anonymous"
            />
            <label htmlFor="anonymous" className="text-sm">
              Enviar de forma anônima
            </label>
          </div>
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Registrar caso
          </button>
        </form>
      </div>
    </div>
  );
}

export default NewCase;