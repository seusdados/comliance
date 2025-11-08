const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

/*
 * Módulo de transcrição de áudio.  Utiliza um serviço externo para converter
 * arquivos de áudio em texto.  Configure as variáveis STT_API_URL e
 * STT_API_KEY com os valores do seu provedor de reconhecimento de fala.
 */

const STT_API_URL = process.env.STT_API_URL;
const STT_API_KEY = process.env.STT_API_KEY;

/**
 * Transcreve um arquivo de áudio (Buffer) para texto.
 * @param {Buffer} audioBuffer
 */
async function transcribeAudio(audioBuffer) {
  const response = await fetch(STT_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'audio/wav',
      'Authorization': `Bearer ${STT_API_KEY}`,
    },
    body: audioBuffer,
  });
  if (!response.ok) {
    console.error('Erro ao transcrever áudio', await response.text());
    return '';
  }
  const data = await response.json();
  return data.transcript || '';
}

module.exports = { transcribeAudio };