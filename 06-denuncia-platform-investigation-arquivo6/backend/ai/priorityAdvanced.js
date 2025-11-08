const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

/*
 * Módulo de classificação e priorização avançada.
 * Utiliza um serviço externo para analisar o texto da denúncia e
 * sugerir categorias e nível de prioridade com base em sinais
 * linguísticos mais complexos. Se o serviço não estiver configurado,
 * delega para os classificadores heurísticos existentes.
 *
 * Configuração:
 * - AI_CLASSIFICATION_API_URL: URL do serviço de IA.
 * - AI_CLASSIFICATION_API_KEY: chave de acesso.
 */

const AI_API_URL = process.env.AI_CLASSIFICATION_API_URL;
const AI_API_KEY = process.env.AI_CLASSIFICATION_API_KEY;

const { classifyCase } = require('./classifier');
const { evaluatePriority } = require('./priority');

/**
 * Analisa um relato e retorna categorias sugeridas e prioridade com base
 * em IA avançada, ou delega para heurísticas simples se a IA não
 * estiver configurada.
 * @param {string} text Texto da denúncia
 * @returns {Promise<{ categories: string[], priority: { level: string, score: number } }>}
 */
async function suggestCategoriesAndPriority(text = '') {
  // Usa IA externa se estiver configurada
  if (AI_API_URL && AI_API_KEY) {
    try {
      const res = await fetch(AI_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${AI_API_KEY}`,
        },
        body: JSON.stringify({ text }),
      });
      if (!res.ok) {
        console.error('Erro no serviço de IA avançada', await res.text());
        // Fallback para heurística
        return {
          categories: classifyCase(text),
          priority: evaluatePriority(text),
        };
      }
      const data = await res.json();
      const categories = data.categories || classifyCase(text);
      const priority = data.priority || evaluatePriority(text);
      return { categories, priority };
    } catch (err) {
      console.error('Falha ao conectar ao serviço de IA', err);
      return {
        categories: classifyCase(text),
        priority: evaluatePriority(text),
      };
    }
  }
  // Usa heurísticas locais caso a IA não esteja configurada
  return {
    categories: classifyCase(text),
    priority: evaluatePriority(text),
  };
}

module.exports = { suggestCategoriesAndPriority };