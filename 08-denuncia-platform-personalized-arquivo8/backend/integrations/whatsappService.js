const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

/*
 * Serviço de integração com WhatsApp Business via API Graph (Cloud API).
 * Para utilizar este serviço é necessário ter um número de telefone associado ao
 * WhatsApp Business e gerar um token de acesso. Configure as variáveis
 * WHATSAPP_PHONE_ID e WHATSAPP_TOKEN no arquivo .env.
 */

const PHONE_ID = process.env.WHATSAPP_PHONE_ID;
const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;

/**
 * Envia mensagem via WhatsApp para um número específico.
 * @param {string} to Número de telefone no formato internacional (ex.: +5511999990000)
 * @param {string} text Texto da mensagem
 */
async function sendMessage(to, text) {
  const url = `https://graph.facebook.com/v14.0/${PHONE_ID}/messages`;
  const payload = {
    messaging_product: 'whatsapp',
    to,
    text: { body: text },
  };
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${WHATSAPP_TOKEN}`,
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    console.error('Erro ao enviar mensagem no WhatsApp', await res.text());
  }
  return res.json();
}

/**
 * Processa o corpo do webhook do WhatsApp para extrair a mensagem e o remetente.
 * @param {object} payload
 */
function parseWebhookEvent(payload) {
  try {
    const entry = payload.entry && payload.entry[0];
    const changes = entry.changes && entry.changes[0];
    const messages = changes.value.messages && changes.value.messages[0];
    const from = messages.from;
    const text = messages.text && messages.text.body;
    return { senderNumber: from, messageText: text };
  } catch (err) {
    console.error('Falha ao interpretar webhook do WhatsApp', err);
    return null;
  }
}

module.exports = { sendMessage, parseWebhookEvent };