// Usa import dinâmico para compatibilidade com node-fetch versão ESM
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

/*
 * Serviço de integração com Instagram.
 * Este módulo encapsula chamadas à API do Instagram via Graph API.  Para que funcione
 * adequadamente, é necessário configurar um aplicativo no Facebook/Meta, habilitar
 * o Messenger API para Instagram e obter tokens de acesso de longo prazo.  As
 * variáveis de ambiente IG_BUSINESS_ID e INSTAGRAM_ACCESS_TOKEN devem ser
 * definidas antes da execução.
 */

const IG_BUSINESS_ID = process.env.IG_BUSINESS_ID;
const INSTAGRAM_ACCESS_TOKEN = process.env.INSTAGRAM_ACCESS_TOKEN;

/**
 * Envia uma mensagem direta para um usuário no Instagram.
 * @param {string} toUserId ID do destinatário (PSID)
 * @param {string} message Texto da mensagem a ser enviada
 */
async function sendDirectMessage(toUserId, message) {
  const url = `https://graph.facebook.com/v14.0/${IG_BUSINESS_ID}/messages`;
  const body = {
    recipient: { id: toUserId },
    message: { text: message },
  };
  const params = new URLSearchParams({ access_token: INSTAGRAM_ACCESS_TOKEN });
  const res = await fetch(`${url}?${params.toString()}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    console.error('Erro ao enviar mensagem Instagram', await res.text());
  }
  return res.json();
}

/**
 * Processa evento recebido do Webhook do Instagram.
 * O evento deverá ser repassado a partir do endpoint /webhook/instagram.
 * Retorna um objeto simplificado contendo id do remetente e conteúdo.
 * @param {object} payload
 */
function parseWebhookEvent(payload) {
  // Para simplificação, assume que payload.entry[0].messaging[0] contém a mensagem.
  try {
    const entry = payload.entry && payload.entry[0];
    const messaging = entry.messaging && entry.messaging[0];
    const senderId = messaging.sender.id;
    const messageText = messaging.message.text;
    return { senderId, messageText };
  } catch (err) {
    console.error('Falha ao interpretar webhook do Instagram', err);
    return null;
  }
}

module.exports = { sendDirectMessage, parseWebhookEvent };