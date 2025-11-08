/*
 * Resumidor simplificado.
 * Recebe um texto e retorna os primeiros 300 caracteres como um resumo.
 * Em uma implementação real, utilizaríamos modelos de linguagem natural
 * para produzir resumos coerentes e informativos.
 */

function summarizeText(text = '') {
  if (typeof text !== 'string') return '';
  const maxLength = 300;
  return text.length <= maxLength ? text : text.substring(0, maxLength) + '...';
}

module.exports = { summarizeText };