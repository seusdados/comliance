const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

/*
 * Módulo de transcrição avançada de voz.
 * Este módulo delega a transcrição a um serviço de reconhecimento de fala
 * configurado via variáveis de ambiente.  Caso a transcrição avançada
 * não esteja configurada, ele recorre ao módulo básico de transcrição.
 *
 * Configuração:
 * - ADVANCED_STT_API_URL: URL do serviço de transcrição.
 * - ADVANCED_STT_API_KEY: chave de acesso ou token.
 */

const ADV_API_URL = process.env.ADVANCED_STT_API_URL;
const ADV_API_KEY = process.env.ADVANCED_STT_API_KEY;

// Importa o módulo básico como fallback
const { transcribeAudio: basicTranscribe } = require('./transcriber');

/**
 * Transcreve um arquivo de áudio (Buffer) para texto utilizando a API
 * avançada, se disponível; do contrário, usa o módulo básico.
 * @param {Buffer} audioBuffer
 * @returns {Promise<string>}
 */
async function transcribeAudioAdvanced(audioBuffer) {
  // Usa serviço avançado se URL e chave estiverem configuradas
  if (ADV_API_URL && ADV_API_KEY) {
    try {
      const response = await fetch(ADV_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'audio/wav',
          'Authorization': `Bearer ${ADV_API_KEY}`,
        },
        body: audioBuffer,
      });
      if (!response.ok) {
        console.error('Erro ao transcrever áudio (avançado)', await response.text());
        // Fallback para transcrição básica
        return basicTranscribe(audioBuffer);
      }
      const data = await response.json();
      return data.transcript || '';
    } catch (err) {
      console.error('Falha no serviço de transcrição avançada', err);
      return basicTranscribe(audioBuffer);
    }
  }
  // Se não houver configuração avançada, usa o básico
  return basicTranscribe(audioBuffer);
}

module.exports = { transcribeAudioAdvanced };