import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
// Importa utilidades para classificação e criptografia
import { classifyCase, evaluatePriority, summarizeText } from '../utils/classification.js';
import { generateRandomKey, encryptObject } from '../utils/crypto.js';
import { useTranslation } from '../useTranslation.js';

function NewCase({ user }) {
  const t = useTranslation();
  const navigate = useNavigate();
  // Configurações do tenant (incluindo formulários e categorias)
  const [settings, setSettings] = useState(null);
  // Seleção de papel (denunciante, vitima, consultor, etc.)
  const [role, setRole] = useState('');
  // Valores dos campos dinâmicos
  const [formValues, setFormValues] = useState({});
  // Arquivos enviados (campo id => File)
  const [files, setFiles] = useState({});
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  // Carrega configurações do tenant ao montar
  useEffect(() => {
    async function fetchSettings() {
      try {
        const response = await fetch('http://localhost:3000/api/settings', {
          headers: {
            Authorization: 'Bearer ' + localStorage.getItem('token'),
            'X-Tenant-ID': user.tenantId,
          },
        });
        const data = await response.json();
        if (response.ok) {
          setSettings(data.settings);
          // Define papel padrão como o primeiro definido nos formulários
          const formKeys = data.settings.forms ? Object.keys(data.settings.forms) : [];
          if (formKeys.length > 0) {
            setRole(formKeys[0]);
          }
        } else {
          setError(data.mensagem || 'Não foi possível carregar as configurações');
        }
      } catch (err) {
        setError('Erro de rede');
      } finally {
        setLoading(false);
      }
    }
    fetchSettings();
  }, [user]);

  const handleFieldChange = (fieldId, value) => {
    setFormValues((prev) => ({ ...prev, [fieldId]: value }));
  };

  const handleFileChange = (fieldId, file) => {
    setFiles((prev) => ({ ...prev, [fieldId]: file }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    // Gera chave de criptografia
    const key = generateRandomKey();
    try {
      // Determina categorias e descrição para classificação
      let categories = [];
      let descriptionText = '';
      let anonymous = false;
      // Identifica campos no formulário
      const formDef = settings?.forms?.[role] || [];
      formDef.forEach((field) => {
        const value = formValues[field.id];
        if (field.id === 'category' || field.id === 'categories') {
          // select (podendo ser múltipla escolha futuramente)
          if (value) {
            if (Array.isArray(value)) {
              categories = value;
            } else {
              categories = [value];
            }
          }
        }
        // Campo de descrição é usado para sumário/avaliação de prioridade
        if (!descriptionText && (field.id.toLowerCase().includes('description') || field.type === 'textarea')) {
          descriptionText = value || '';
        }
        // Campo para anonimato
        if (field.id.toLowerCase().includes('anonymous')) {
          anonymous = !!value;
        }
      });
      // Caso não tenha categorias selecionadas, usa classificação heurística
      if (!categories || categories.length === 0) {
        categories = classifyCase(descriptionText);
      }
      // Calcula prioridade e resumo
      const priority = evaluatePriority(descriptionText);
      const summary = summarizeText(descriptionText);
      // Constrói objeto sensível com todos os campos do formulário, além de resumo, prioridade e categorias
      const sensitiveData = {
        ...formValues,
        summary,
        priority,
        categories,
      };
      const encryptedData = encryptObject(sensitiveData, key);
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
        // Faz upload de anexos se existirem
        const attachments = Object.entries(files);
        for (const [fieldId, file] of attachments) {
          if (file) {
            // Converte arquivo em base64 para envio
            const contentBase64 = await new Promise((resolve, reject) => {
              const reader = new FileReader();
              reader.onload = () => resolve(reader.result.split(',')[1]);
              reader.onerror = reject;
              reader.readAsDataURL(file);
            });
            await fetch(`http://localhost:3000/api/cases/${data.case.id}/attachments`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: 'Bearer ' + localStorage.getItem('token'),
                'X-Tenant-ID': user.tenantId,
              },
              body: JSON.stringify({
                filename: file.name,
                content: contentBase64,
                contentType: file.type,
              }),
            });
          }
        }
      }
      navigate('/');
    } catch (err) {
      console.error(err);
      setError('Erro de rede');
    }
  };

  if (loading) {
    return (
      <div>
        <Navbar user={user} onLogout={() => {}} />
        <div className="p-4">Carregando…</div>
      </div>
    );
  }
  if (error) {
    return (
      <div>
        <Navbar user={user} onLogout={() => {}} />
        <div className="p-4 text-red-600">{error}</div>
      </div>
    );
  }

  // Obtém definições de formulários e categorias
  const formDefs = settings?.forms || {};
  const roles = Object.keys(formDefs);
  const categories = settings?.categories || [];

  return (
    <div>
      <Navbar user={user} onLogout={() => {}} />
      <div className="max-w-3xl mx-auto p-4">
        <h2 className="text-lg font-semibold mb-4">{t('NewCase') || 'Nova denúncia'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Se houver mais de um papel disponível, permite ao usuário escolher */}
          {roles.length > 1 && (
            <div>
              <label className="block text-sm mb-1" htmlFor="role">
                {t('role') || 'Perfil'}
              </label>
              <select
                id="role"
                value={role}
                onChange={(e) => {
                  setRole(e.target.value);
                  setFormValues({});
                  setFiles({});
                }}
                className="w-full border p-2 rounded"
              >
                {roles.map((r) => (
                  <option key={r} value={r} className="capitalize">
                    {t(r) || r}
                  </option>
                ))}
              </select>
            </div>
          )}
          {/* Renderiza campos dinâmicos para o papel selecionado */}
          {formDefs[role] && formDefs[role].map((field) => {
            const fieldValue = formValues[field.id] || '';
            const isRequired = !!field.required;
            const idAttr = `field-${field.id}`;
            const labelText = t(field.labelKey) || field.labelKey;
            if (field.type === 'select') {
              // Somente suporta opções baseadas em categorias
              const options = field.options === 'categories' ? categories : [];
              return (
                <div key={field.id}>
                  <label htmlFor={idAttr} className="block text-sm mb-1">
                    {labelText}
                  </label>
                  <select
                    id={idAttr}
                    value={fieldValue}
                    onChange={(e) => handleFieldChange(field.id, e.target.value)}
                    className="w-full border p-2 rounded"
                    required={isRequired}
                  >
                    <option value="">{t('selectOption') || '--'}</option>
                    {options.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>
              );
            }
            if (field.type === 'checkbox') {
              return (
                <div key={field.id} className="flex items-center space-x-2">
                  <input
                    id={idAttr}
                    type="checkbox"
                    checked={!!fieldValue}
                    onChange={(e) => handleFieldChange(field.id, e.target.checked)}
                  />
                    <label htmlFor={idAttr} className="text-sm">
                      {labelText}
                    </label>
                </div>
              );
            }
            if (field.type === 'date') {
              return (
                <div key={field.id}>
                  <label htmlFor={idAttr} className="block text-sm mb-1">
                    {labelText}
                  </label>
                  <input
                    id={idAttr}
                    type="date"
                    value={fieldValue}
                    onChange={(e) => handleFieldChange(field.id, e.target.value)}
                    className="w-full border p-2 rounded"
                    required={isRequired}
                  />
                </div>
              );
            }
            if (field.type === 'file') {
              return (
                <div key={field.id}>
                  <label htmlFor={idAttr} className="block text-sm mb-1">
                    {labelText}
                  </label>
                  <input
                    id={idAttr}
                    type="file"
                    onChange={(e) => handleFileChange(field.id, e.target.files[0])}
                    className="w-full border p-2 rounded"
                  />
                </div>
              );
            }
            if (field.type === 'textarea') {
              return (
                <div key={field.id}>
                  <label htmlFor={idAttr} className="block text-sm mb-1">
                    {labelText}
                  </label>
                  <textarea
                    id={idAttr}
                    value={fieldValue}
                    onChange={(e) => handleFieldChange(field.id, e.target.value)}
                    className="w-full border p-2 rounded"
                    rows={4}
                    required={isRequired}
                  ></textarea>
                </div>
              );
            }
            // default: text
            return (
              <div key={field.id}>
                <label htmlFor={idAttr} className="block text-sm mb-1">
                  {labelText}
                </label>
                <input
                  id={idAttr}
                  type="text"
                  value={fieldValue}
                  onChange={(e) => handleFieldChange(field.id, e.target.value)}
                  className="w-full border p-2 rounded"
                  required={isRequired}
                />
              </div>
            );
          })}
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            {t('submit') || 'Enviar'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default NewCase;