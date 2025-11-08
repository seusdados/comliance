/*
 * Módulo de observadores de canais externos.
 * Este arquivo contém funções que, quando iniciadas, procuram por
 * novas mensagens em canais como Instagram, Facebook Messenger, WhatsApp,
 * e‑mail e telefonia, e as encaminham para a API interna do sistema via
 * chamadas HTTP.  Ele foi projetado para ser flexível: se você tiver
 * webhooks configurados para cada canal, pode desativar o poll periódico
 * ajustando as variáveis de ambiente para false.
 *
 * Para utilizar as integrações de forma real, você deve habilitar as
 * variáveis de ambiente `ENABLE_INSTAGRAM_POLL`, `ENABLE_FACEBOOK_POLL`,
 * `ENABLE_WHATSAPP_POLL` e outras conforme desejado.  Cada observador
 * usa o token ou identificador correspondente definido no arquivo `.env`.
 *
 * IMPORTANTE: Este módulo utiliza chamadas HTTP à própria API do
 * aplicativo (por padrão em http://localhost:3000) para enviar
 * denúncias captadas via polling.  Isso simplifica a integração e
 * desacopla os observadores do núcleo da aplicação.  Os dados enviados
 * através das webhooks internas serão tratados da mesma forma que
 * aqueles recebidos por webhooks externos.
 */

const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

const API_URL = process.env.API_URL || 'http://localhost:3000';
const TENANT_ID = process.env.DEFAULT_TENANT_ID || 'default';

// Variáveis de ambiente para Instagram/Facebook/WhatsApp
const IG_BUSINESS_ID = process.env.IG_BUSINESS_ID;
const INSTAGRAM_ACCESS_TOKEN = process.env.INSTAGRAM_ACCESS_TOKEN;
const FACEBOOK_PAGE_ACCESS_TOKEN = process.env.FACEBOOK_PAGE_ACCESS_TOKEN;
const WHATSAPP_PHONE_ID = process.env.WHATSAPP_PHONE_ID;
const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;

// Flags de ativação
const ENABLE_INSTAGRAM_POLL = process.env.ENABLE_INSTAGRAM_POLL === 'true';
const ENABLE_FACEBOOK_POLL = process.env.ENABLE_FACEBOOK_POLL === 'true';
const ENABLE_WHATSAPP_POLL = process.env.ENABLE_WHATSAPP_POLL === 'true';
const POLL_INTERVAL_SECONDS = Number(process.env.POLL_INTERVAL_SECONDS) || 60;

// Lista de conversas/mensagens já processadas para evitar duplicidade
const processedInstagramMessages = new Set();
const processedFacebookMessages = new Set();
const processedWhatsAppMessages = new Set();

/**
 * Envia um payload para a rota interna de webhook.  Inclui o cabeçalho
 * X-Tenant-ID para garantir isolamento multi‑tenant.
 * @param {string} endpoint Rota (por exemplo, '/api/webhooks/instagram')
 * @param {object} payload Dados do evento
 */
async function forwardToWebhook(endpoint, payload) {
  try {
    const res = await fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Tenant-ID': TENANT_ID,
      },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      console.error(`Falha ao encaminhar evento para ${endpoint}`, await res.text());
    }
  } catch (err) {
    console.error(`Erro ao encaminhar evento para ${endpoint}`, err);
  }
}

/**
 * Observador de mensagens do Instagram.  Faz uma chamada periódica à API
 * Graph para listar conversas e mensagens recentes.  Para cada nova
 * mensagem recebida (que ainda não tenha sido processada), envia um
 * payload para a rota interna `/api/webhooks/instagram`.
 */
async function pollInstagram() {
  if (!ENABLE_INSTAGRAM_POLL || !IG_BUSINESS_ID || !INSTAGRAM_ACCESS_TOKEN) return;
  try {
    // Consulta as conversas do Instagram (Graph API) – obter últimas 10
    const convRes = await fetch(
      `https://graph.facebook.com/v14.0/${IG_BUSINESS_ID}/conversations?fields=participants,messages.limit(10){id,from,to,text,created_time}&access_token=${INSTAGRAM_ACCESS_TOKEN}`
    );
    const convData = await convRes.json();
    const conversations = convData.data || [];
    for (const conv of conversations) {
      const messages = conv.messages && conv.messages.data;
      if (!messages) continue;
      for (const msg of messages) {
        if (!msg.text) continue;
        const messageId = msg.id;
        if (processedInstagramMessages.has(messageId)) continue;
        processedInstagramMessages.add(messageId);
        const payload = { senderId: msg.from && msg.from.id, messageText: msg.text };
        await forwardToWebhook('/api/webhooks/instagram', { entry: [{ messaging: [{ sender: { id: payload.senderId }, message: { text: payload.messageText } }] }] });
      }
    }
  } catch (err) {
    console.error('Erro ao consultar mensagens do Instagram', err);
  }
}

/**
 * Observador de mensagens do Facebook Messenger.  Lista mensagens recentes da
 * página utilizando a API Graph e reencaminha aquelas que ainda não
 * foram processadas.
 */
async function pollFacebook() {
  if (!ENABLE_FACEBOOK_POLL || !FACEBOOK_PAGE_ACCESS_TOKEN) return;
  try {
    // Este endpoint recupera conversas/mensagens recentes da página
    const res = await fetch(
      `https://graph.facebook.com/v14.0/me/conversations?fields=messages.limit(10){id,from,to,message,created_time}&access_token=${FACEBOOK_PAGE_ACCESS_TOKEN}`
    );
    const data = await res.json();
    const conversations = data.data || [];
    for (const conv of conversations) {
      const messages = conv.messages && conv.messages.data;
      if (!messages) continue;
      for (const msg of messages) {
        if (!msg.message) continue;
        const messageId = msg.id;
        if (processedFacebookMessages.has(messageId)) continue;
        processedFacebookMessages.add(messageId);
        const payload = { senderId: msg.from && msg.from.id, messageText: msg.message };
        await forwardToWebhook('/api/webhooks/facebook', { entry: [{ messaging: [{ sender: { id: payload.senderId }, message: { text: payload.messageText } }] }] });
      }
    }
  } catch (err) {
    console.error('Erro ao consultar mensagens do Facebook', err);
  }
}

/**
 * Observador de mensagens do WhatsApp.  Faz uma consulta periódica à API
 * WhatsApp Business (Cloud API) para obter mensagens recentes e repassa
 * aquelas que ainda não foram processadas.
 */
async function pollWhatsApp() {
  if (!ENABLE_WHATSAPP_POLL || !WHATSAPP_PHONE_ID || !WHATSAPP_TOKEN) return;
  try {
    const res = await fetch(
      `https://graph.facebook.com/v14.0/${WHATSAPP_PHONE_ID}/messages?access_token=${WHATSAPP_TOKEN}`
    );
    const data = await res.json();
    const messages = data.data || [];
    for (const msg of messages) {
      const msgId = msg.id;
      if (processedWhatsAppMessages.has(msgId)) continue;
      processedWhatsAppMessages.add(msgId);
      const senderNumber = msg.from;
      const messageText = msg.text && msg.text.body;
      if (!messageText) continue;
      // Monte objeto de acordo com o parseWebhookEvent
      await forwardToWebhook('/api/webhooks/whatsapp', { entry: [{ changes: [{ value: { messages: [{ from: senderNumber, text: { body: messageText } }] } }] }] });
    }
  } catch (err) {
    console.error('Erro ao consultar mensagens do WhatsApp', err);
  }
}

/**
 * Função principal de inicialização.  Ela agenda os observadores para
 * serem executados a cada intervalo definido pela variável
 * POLL_INTERVAL_SECONDS.  Os observadores só são ativados se as
 * respectivas variáveis de ambiente estiverem marcadas como true.
 */
function initIntegrationWatchers() {
  const intervalMs = POLL_INTERVAL_SECONDS * 1000;
  if (ENABLE_INSTAGRAM_POLL) {
    setInterval(pollInstagram, intervalMs);
    // Invoca imediatamente na inicialização
    pollInstagram();
  }
  if (ENABLE_FACEBOOK_POLL) {
    setInterval(pollFacebook, intervalMs);
    pollFacebook();
  }
  if (ENABLE_WHATSAPP_POLL) {
    setInterval(pollWhatsApp, intervalMs);
    pollWhatsApp();
  }
  // E‑mail e telefone exigem processos externos ou webhooks separados, então não
  // incluímos uma pesquisa periódica aqui.  Recomenda‑se utilizar um serviço
  // de recebimento de e‑mails (IMAP/POP) ou provedor de telefonia que
  // encaminhe chamadas para `/api/webhooks/email` e `/api/webhooks/phone`.
}

module.exports = { initIntegrationWatchers };