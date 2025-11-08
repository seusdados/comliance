import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar.jsx';
import { useTranslation } from '../useTranslation.js';

function Settings({ user }) {
  const t = useTranslation();
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Campos de edição adicionais
  const [flowsInput, setFlowsInput] = useState('');
  const [languagesInput, setLanguagesInput] = useState('');
  const [themeInput, setThemeInput] = useState({ primaryColor: '', secondaryColor: '' });

  // Campos de edição
  const [categoriesInput, setCategoriesInput] = useState('');
  const [formsInput, setFormsInput] = useState({});

  useEffect(() => {
    async function fetchSettings() {
      setLoading(true);
      try {
        const response = await fetch('http://localhost:3000/api/settings', {
          headers: {
            Authorization: 'Bearer ' + localStorage.getItem('token'),
            'X-Tenant-ID': user.tenantId
          }
        });
        const data = await response.json();
        if (response.ok) {
          const conf = data.settings || {};
          setSettings(conf);
          setCategoriesInput((conf.categories || []).join('\n'));
          setFormsInput(conf.forms || {});
          setFlowsInput((conf.flows || []).join('\n'));
          setLanguagesInput((conf.languages || []).join(','));
          setThemeInput({
            primaryColor: conf.theme?.primaryColor || '',
            secondaryColor: conf.theme?.secondaryColor || '',
          });
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

  // Manipulação de campos do formulário
  const handleAddField = (role) => {
    setFormsInput((prev) => {
      const newFields = prev[role] ? [...prev[role]] : [];
      newFields.push({ id: '', labelKey: '', type: 'text', required: false });
      return { ...prev, [role]: newFields };
    });
  };
  const handleRemoveField = (role, index) => {
    setFormsInput((prev) => {
      const newFields = prev[role] ? prev[role].filter((_, i) => i !== index) : [];
      return { ...prev, [role]: newFields };
    });
  };
  const handleFieldChange = (role, index, key, value) => {
    setFormsInput((prev) => {
      const newFields = prev[role] ? [...prev[role]] : [];
      newFields[index] = { ...newFields[index], [key]: value };
      return { ...prev, [role]: newFields };
    });
  };

  // Salvar configurações
  const saveSettings = async () => {
    const categoriesArray = categoriesInput
      .split('\n')
      .map((c) => c.trim())
      .filter((c) => c);
    const flowsArray = flowsInput
      .split('\n')
      .map((f) => f.trim())
      .filter((f) => f);
    const languagesArray = languagesInput
      .split(',')
      .map((l) => l.trim())
      .filter((l) => l);
    const themeObj = {
      primaryColor: themeInput.primaryColor || undefined,
      secondaryColor: themeInput.secondaryColor || undefined,
    };
    try {
      const response = await fetch('http://localhost:3000/api/settings', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + localStorage.getItem('token'),
          'X-Tenant-ID': user.tenantId
        },
        body: JSON.stringify({
          categories: categoriesArray,
          forms: formsInput,
          flows: flowsArray,
          languages: languagesArray,
          theme: themeObj,
        })
      });
      const data = await response.json();
      if (response.ok) {
        setSettings(data.settings);
        alert('Configurações atualizadas');
      } else {
        alert(data.mensagem || 'Falha ao salvar configurações');
      }
    } catch (err) {
      alert('Erro de rede');
    }
  };

  if (loading) return <div><Navbar user={user} onLogout={() => {}} /><div className="p-4">Carregando…</div></div>;
  if (error) return <div><Navbar user={user} onLogout={() => {}} /><div className="p-4 text-red-500">{error}</div></div>;

  return (
    <div>
      <Navbar user={user} onLogout={() => {}} />
      <div className="p-4 max-w-4xl mx-auto">
        <h2 className="text-lg font-semibold mb-4">{t('settings') || 'Configurações'}</h2>
        <div className="mb-6">
          <h3 className="text-md font-semibold mb-2">{t('categories') || 'Categorias'}</h3>
          <p className="text-sm text-gray-600 mb-1">Uma categoria por linha</p>
          <textarea
            className="w-full border rounded p-2"
            rows={5}
            value={categoriesInput}
            onChange={(e) => setCategoriesInput(e.target.value)}
          ></textarea>
        </div>
        {/* Seção de fluxos */}
        <div className="mb-6">
          <h3 className="text-md font-semibold mb-2">{t('flows') || 'Fluxos'}</h3>
          <p className="text-sm text-gray-600 mb-1">Uma etapa por linha (ex: novo, triagem, investigação…)</p>
          <textarea
            className="w-full border rounded p-2"
            rows={4}
            value={flowsInput}
            onChange={(e) => setFlowsInput(e.target.value)}
          ></textarea>
        </div>
        {/* Seção de idiomas */}
        <div className="mb-6">
          <h3 className="text-md font-semibold mb-2">{t('languages') || 'Idiomas'}</h3>
          <p className="text-sm text-gray-600 mb-1">Códigos separados por vírgula (ex: pt, en, es)</p>
          <input
            type="text"
            className="w-full border rounded p-2"
            value={languagesInput}
            onChange={(e) => setLanguagesInput(e.target.value)}
          />
        </div>
        {/* Seção de tema de cores */}
        <div className="mb-6">
          <h3 className="text-md font-semibold mb-2">{t('theme') || 'Tema'}</h3>
          <div className="flex items-center space-x-4">
            <div>
              <label className="block text-sm mb-1">Cor principal</label>
              <input
                type="color"
                value={themeInput.primaryColor || '#1e40af'}
                onChange={(e) => setThemeInput((prev) => ({ ...prev, primaryColor: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm mb-1">Cor secundária</label>
              <input
                type="color"
                value={themeInput.secondaryColor || '#10b981'}
                onChange={(e) => setThemeInput((prev) => ({ ...prev, secondaryColor: e.target.value }))}
              />
            </div>
          </div>
        </div>
        <div className="mb-6">
          <h3 className="text-md font-semibold mb-2">{t('forms') || 'Formulários'}</h3>
          {Object.keys(formsInput).map((roleKey) => (
            <div key={roleKey} className="mb-4 border rounded p-3">
              <h4 className="font-semibold mb-2 capitalize">{roleKey}</h4>
              {formsInput[roleKey] && formsInput[roleKey].map((field, index) => (
                <div key={index} className="mb-2 flex flex-wrap gap-2 items-center">
                  <input
                    className="border p-1 text-sm"
                    style={{ width: '100px' }}
                    placeholder={t('fieldId') || 'ID'}
                    value={field.id}
                    onChange={(e) => handleFieldChange(roleKey, index, 'id', e.target.value)}
                  />
                  <input
                    className="border p-1 text-sm"
                    style={{ width: '120px' }}
                    placeholder={t('fieldLabel') || 'Label'}
                    value={field.labelKey}
                    onChange={(e) => handleFieldChange(roleKey, index, 'labelKey', e.target.value)}
                  />
                  <select
                    className="border p-1 text-sm"
                    value={field.type}
                    onChange={(e) => handleFieldChange(roleKey, index, 'type', e.target.value)}
                  >
                    <option value="text">text</option>
                    <option value="textarea">textarea</option>
                    <option value="select">select</option>
                    <option value="checkbox">checkbox</option>
                    <option value="date">date</option>
                    <option value="file">file</option>
                  </select>
                  <label className="text-sm flex items-center">
                    <input
                      type="checkbox"
                      checked={!!field.required}
                      onChange={(e) => handleFieldChange(roleKey, index, 'required', e.target.checked)}
                      className="mr-1"
                    />
                    {t('required') || 'Obrigatório'}
                  </label>
                  <button
                    type="button"
                    className="text-red-600 underline text-sm"
                    onClick={() => handleRemoveField(roleKey, index)}
                  >
                    {t('remove') || 'Remover'}
                  </button>
                </div>
              ))}
              <button
                type="button"
                className="bg-blue-600 text-white px-2 py-1 rounded text-sm"
                onClick={() => handleAddField(roleKey)}
              >
                {t('addField') || 'Adicionar campo'}
              </button>
            </div>
          ))}
          {/* Permite adicionar um novo papel/formulário */}
          <div className="mt-4">
            <button
              type="button"
              className="bg-purple-600 text-white px-3 py-1 rounded"
              onClick={() => {
                const newRole = prompt('Nome do novo perfil (sem espaços)');
                if (!newRole) return;
                setFormsInput((prev) => {
                  if (prev[newRole]) {
                    alert('Perfil já existe');
                    return prev;
                  }
                  return { ...prev, [newRole]: [] };
                });
              }}
            >
              Adicionar novo perfil
            </button>
          </div>
        </div>
        <button
          onClick={saveSettings}
          className="bg-green-600 text-white px-4 py-2 rounded"
        >
          {t('save') || 'Salvar'}
        </button>
      </div>
    </div>
  );
}

export default Settings;