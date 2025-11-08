import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from '../useTranslation.js';
import { LanguageContext } from '../LanguageContext.jsx';

function Navbar({ user, onLogout }) {
  const t = useTranslation();
  const { lang, changeLanguage } = useContext(LanguageContext);

  // Recupera opções de idiomas do armazenamento local ou utiliza padrão
  let languages = ['pt', 'en', 'es'];
  try {
    const stored = localStorage.getItem('tenantLanguages');
    if (stored) {
      languages = JSON.parse(stored);
    }
  } catch (err) {
    // Ignore errors
  }

  return (
    <nav
      className="text-white p-4 flex justify-between items-center flex-wrap"
      style={{ backgroundColor: 'var(--primary-color, #1e40af)' }}
    >
      <div className="font-semibold mb-2 sm:mb-0">Canal de Denúncias</div>
      {user && (
        <div className="space-x-4 flex items-center flex-wrap">
          <Link to="/" className="hover:underline">{t('Dashboard') || 'Painel'}</Link>
          <Link to="/novo" className="hover:underline">{t('NewCase') || 'Nova denúncia'}</Link>
          {/* Link de administração e configurações */}
          {['admin', 'ceo'].includes(user.role) && (
            <>
              <Link to="/admin" className="hover:underline">{t('Administration') || 'Administração'}</Link>
              <Link to="/settings" className="hover:underline">{t('settings') || 'Configurações'}</Link>
              <Link to="/reports" className="hover:underline">{t('Reports') || 'Relatórios'}</Link>
            </>
          )}
          <select
            value={lang}
            onChange={(e) => changeLanguage(e.target.value)}
            className="text-blue-600 bg-white rounded px-1 py-1"
          >
            {languages.map((l) => (
              <option key={l} value={l}>
                {l.toUpperCase()}
              </option>
            ))}
          </select>
          <button onClick={onLogout} className="bg-white text-blue-600 px-2 py-1 rounded hover:bg-gray-100">
            {t('Logout') || 'Sair'}
          </button>
        </div>
      )}
    </nav>
  );
}

export default Navbar;