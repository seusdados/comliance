/*
 * Módulo de avaliação de prioridade de casos.
 * Este módulo utiliza heurísticas simples para sugerir um nível de prioridade
 * (alto, médio, baixo) com base no texto da denúncia.  Em uma solução
 * completa, poderíamos empregar modelos de linguagem mais avançados ou
 * pipelines de IA que consideram diferentes fatores, como cargo dos
 * envolvidos, valor monetário, reincidência e outros indicadores.
 */

/**
 * Calcula um score de prioridade com base em palavras‑chave.  Os termos
 * representam maior severidade ou impacto e aumentam o score.  A função
 * retorna um objeto com o score numérico e o rótulo de prioridade.
 *
 * @param {string} text Texto da denúncia
 * @returns {{ score: number, level: 'baixo' | 'medio' | 'alto' }}
 */
function evaluatePriority(text = '') {
  const normalized = text.toLowerCase();
  let score = 0;
  // Pontue termos de acordo com impacto: quanto maior a pontuação, maior a prioridade
  const highImpactTerms = ['corrupção', 'suborno', 'fraude massiva', 'assédio grave', 'violência física'];
  const mediumImpactTerms = ['assédio', 'intimidação', 'racismo', 'discriminação', 'conflito de interesses'];
  // Incrementa score para ocorrências de termos de alto impacto
  highImpactTerms.forEach(term => {
    if (normalized.includes(term)) score += 3;
  });
  // Incrementa score para ocorrências de termos de impacto médio
  mediumImpactTerms.forEach(term => {
    if (normalized.includes(term)) score += 1;
  });
  // Determina nível de prioridade
  let level = 'baixo';
  if (score >= 5) {
    level = 'alto';
  } else if (score >= 2) {
    level = 'medio';
  }
  return { score, level };
}

module.exports = { evaluatePriority };