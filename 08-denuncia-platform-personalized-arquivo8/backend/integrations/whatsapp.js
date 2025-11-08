/*
 * Integração com WhatsApp.
 * Em uma solução real, poderíamos utilizar a API oficial do WhatsApp Business
 * ou provedores terceiros.  Este arquivo é apenas uma estrutura.
 */

function receiveWhatsAppMessage(payload) {
  console.log('Mensagem recebida do WhatsApp:', payload);
}

module.exports = { receiveWhatsAppMessage };