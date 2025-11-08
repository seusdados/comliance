// Funções de classificação, avaliação de prioridade e sumarização
// Replicam a lógica existente no backend para operar no cliente

/**
 * Classifica o texto de denúncia em possíveis categorias, baseado em palavras‑chave.
 * Retorna uma lista de categorias ordenada pela contagem de termos encontrados.
 * @param {string} description
 * @returns {Array<string>}
 */
export function classifyCase(description = '') {
  const keywords = {
    fraude: ['desvio', 'suborno', 'propina', 'corrupção', 'embezzlement'],
    assedio: ['assédio', 'abuso', 'bullying', 'violência'],
    discriminacao: ['discriminação', 'racismo', 'preconceito', 'machismo'],
    conflito: ['conflito de interesses', 'favor', 'nepotismo'],
  };
  const text = description.toLowerCase();
  const scores = {};
  Object.entries(keywords).forEach(([category, terms]) => {
    scores[category] = terms.reduce((count, term) => {
      return count + (text.includes(term) ? 1 : 0);
    }, 0);
  });
  return Object.keys(scores)
    .sort((a, b) => scores[b] - scores[a])
    .filter((cat) => scores[cat] > 0);
}

/**
 * Avalia a prioridade de um texto de denúncia com base em heurísticas de impacto.
 * Retorna um objeto com score numérico e rótulo (baixo, medio, alto).
 * @param {string} text
 * @returns {{ score: number, level: 'baixo' | 'medio' | 'alto' }}
 */
export function evaluatePriority(text = '') {
  const normalized = text.toLowerCase();
  let score = 0;
  const highImpactTerms = ['corrupção', 'suborno', 'fraude massiva', 'assédio grave', 'violência física'];
  const mediumImpactTerms = ['assédio', 'intimidação', 'racismo', 'discriminação', 'conflito de interesses'];
  highImpactTerms.forEach((term) => {
    if (normalized.includes(term)) score += 3;
  });
  mediumImpactTerms.forEach((term) => {
    if (normalized.includes(term)) score += 1;
  });
  let level = 'baixo';
  if (score >= 5) {
    level = 'alto';
  } else if (score >= 2) {
    level = 'medio';
  }
  return { score, level };
}

/**
 * Gera um resumo simples dos primeiros 300 caracteres do texto.
 * @param {string} text
 * @returns {string}
 */
export function summarizeText(text = '') {
  const maxLength = 300;
  if (typeof text !== 'string') return '';
  return text.length <= maxLength ? text : text.substring(0, maxLength) + '...';
}