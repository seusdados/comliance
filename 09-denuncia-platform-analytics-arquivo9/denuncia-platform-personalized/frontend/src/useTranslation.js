import { useContext } from 'react';
import { LanguageContext } from './LanguageContext.jsx';
import translations from './i18n.js';

// Hook que retorna uma função para obter traduções de acordo com o idioma atual.
export function useTranslation() {
  const { lang } = useContext(LanguageContext);
  return (key) => {
    if (translations[lang] && translations[lang][key]) {
      return translations[lang][key];
    }
    // Fallback para português
    return translations['pt'][key] || key;
  };
}