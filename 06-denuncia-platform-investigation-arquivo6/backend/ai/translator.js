const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

/*
 * Módulo de tradução de texto.  Utiliza um serviço externo para traduzir
 * o conteúdo das denúncias para o idioma padrão do sistema (Português).
 * O serviço de tradução é configurado através das variáveis de ambiente:
 *
 * - TRANSLATION_API_URL: URL do serviço de tradução.
 * - TRANSLATION_API_KEY: chave de acesso.
 * - TRANSLATION_DEFAULT_LANG: idioma alvo (por padrão 'pt').
 */

const API_URL = process.env.TRANSLATION_API_URL;
const API_KEY = process.env.TRANSLATION_API_KEY;
const DEFAULT_LANG = process.env.TRANSLATION_DEFAULT_LANG || 'pt';

/**
 * Traduz um texto do idioma detectado para o idioma padrão configurado.
 * Caso as variáveis de ambiente não estejam definidas, retorna o texto
 * original sem tradução.
 * @param {string} text Texto a ser traduzido
 * @param {string} targetLang Idioma alvo (opcional)
 */
async function translateText(text = '', targetLang = DEFAULT_LANG) {
  if (!API_URL || !API_KEY) {
    // Não há serviço de tradução configurado
    return text;
  }
  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({ text, target: targetLang }),
    });
    if (!res.ok) {
      console.error('Erro ao traduzir texto', await res.text());
      return text;
    }
    const data = await res.json();
    // Espera campo 'translation' no corpo da resposta
    return data.translation || text;
  } catch (err) {
    console.error('Falha no serviço de tradução', err);
    return text;
  }
}

module.exports = { translateText };