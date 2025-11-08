const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

/*
 * Serviço de integração com Facebook Messenger.
 * Utilize a API Graph do Facebook para enviar e receber mensagens.  O
 * token de acesso da página deve ser fornecido na variável PAGE_ACCESS_TOKEN.
 */

const PAGE_ACCESS_TOKEN = process.env.FACEBOOK_PAGE_ACCESS_TOKEN;

/**
 * Envia uma mensagem ao usuário do Messenger.
 * @param {string} recipientId ID do destinatário
 * @param {string} message Texto da mensagem
 */
async function sendMessage(recipientId, message) {
  const url = `https://graph.facebook.com/v14.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`;
  const body = {
    recipient: { id: recipientId },
    message: { text: message },
  };
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    console.error('Erro ao enviar mensagem no Messenger', await res.text());
  }
  return res.json();
}

/**
 * Interpreta eventos de webhook do Messenger.
 * @param {object} payload
 */
function parseWebhookEvent(payload) {
  try {
    const entry = payload.entry && payload.entry[0];
    const messaging = entry.messaging && entry.messaging[0];
    const senderId = messaging.sender.id;
    const messageText = messaging.message.text;
    return { senderId, messageText };
  } catch (err) {
    console.error('Falha ao interpretar webhook do Messenger', err);
    return null;
  }
}

module.exports = { sendMessage, parseWebhookEvent };