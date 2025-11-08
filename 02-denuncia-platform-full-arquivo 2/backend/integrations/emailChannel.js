/*
 * Integração de e-mail.
 * Este stub representa a ingestão de e-mails enviados para o canal.
 * Em uma implementação prática, seriam configurados um endereço específico
 * e rotinas de leitura via IMAP/POP ou Webhooks de provedores.
 */

function receiveEmail(emailData) {
  console.log('E-mail recebido:', emailData.subject);
}

module.exports = { receiveEmail };