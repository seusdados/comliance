const twilio = require('twilio');

/*
 * Serviço de integração telefônica usando Twilio.  Permite o envio de SMS
 * e o recebimento de mensagens de voz via webhook.  Configure as variáveis
 * TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN e TWILIO_FROM_NUMBER no arquivo .env.
 */

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

/**
 * Envia um SMS para o número de telefone especificado.
 * @param {string} to Número destino em formato internacional
 * @param {string} body Texto do SMS
 */
async function sendSms(to, body) {
  try {
    const message = await client.messages.create({
      body,
      from: process.env.TWILIO_FROM_NUMBER,
      to,
    });
    return message;
  } catch (err) {
    console.error('Erro ao enviar SMS', err);
    throw err;
  }
}

// Stub de processamento de ligação ou transcrição via Twilio webhook
function handleIncomingCall(callData) {
  // callData pode conter gravação de voz ou texto transcrito
  console.log('Ligação recebida', callData.from);
}

module.exports = { sendSms, handleIncomingCall };