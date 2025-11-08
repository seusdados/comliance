import React, { createContext, useState, useEffect } from 'react';

// Contexto para compartilhar o idioma selecionado entre os componentes.
export const LanguageContext = createContext({ lang: 'pt', changeLanguage: () => {} });

export function LanguageProvider({ children }) {
  // Lê a escolha de idioma do armazenamento local ou utiliza "pt" como padrão
  const [lang, setLang] = useState(() => {
    const saved = localStorage.getItem('lang');
    return saved || 'pt';
  });

  useEffect(() => {
    localStorage.setItem('lang', lang);
  }, [lang]);

  function changeLanguage(newLang) {
    setLang(newLang);
  }

  return (
    <LanguageContext.Provider value={{ lang, changeLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}