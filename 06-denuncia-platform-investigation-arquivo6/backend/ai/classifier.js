/*
 * Classificador simples de categorias de denúncias.
 * Este módulo demonstra como um pipeline de IA pode sugerir automaticamente
 * tipologias e prioridades com base no texto recebido.  Ele utiliza
 * palavras‑chave para determinar a classificação.  Em uma solução real,
 * poderíamos empregar modelos de linguagem ou redes neurais mais avançadas.
 */

const keywords = {
  fraude: ['desvio', 'suborno', 'propina', 'corrupção', 'embezzlement'],
  assedio: ['assédio', 'abuso', 'bullying', 'violência'],
  discriminacao: ['discriminação', 'racismo', 'preconceito', 'machismo'],
  conflito: ['conflito de interesses', 'favor', 'nepotismo'],
};

/**
 * Recebe um texto de denúncia e tenta identificar a categoria principal.
 * Retorna uma lista de categorias ordenada pela contagem de palavras-chave encontradas.
 * @param {string} description Texto do caso
 * @returns {Array<string>} Lista de categorias sugeridas
 */
function classifyCase(description = '') {
  const text = description.toLowerCase();
  const scores = {};
  for (const [category, terms] of Object.entries(keywords)) {
    scores[category] = terms.reduce((count, term) => {
      return count + (text.includes(term) ? 1 : 0);
    }, 0);
  }
  // Ordena categorias pela pontuação
  const ordered = Object.keys(scores).sort((a, b) => scores[b] - scores[a]);
  // Retorna apenas categorias com pontuação > 0
  return ordered.filter((cat) => scores[cat] > 0);
}

module.exports = { classifyCase };