const nodemailer = require('nodemailer');

/*
 * Serviço de envio de e‑mail para notificações de denúncias.  Use o transporte
 * configurado em seu provedor SMTP.  Configure as variáveis MAIL_HOST,
 * MAIL_PORT, MAIL_USER e MAIL_PASS no arquivo .env.  Para ingestão de e‑mails,
 * recomenda‑se configurar um endereço dedicado e um processo separado de
 * leitura via IMAP/POP, que então enviará os dados para a API através de
 * endpoints criados neste backend.
 */

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: process.env.MAIL_PORT,
  secure: process.env.MAIL_SECURE === 'true',
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

/**
 * Envia um e‑mail para um destinatário.
 * @param {string} to Endereço do destinatário
 * @param {string} subject Assunto do e‑mail
 * @param {string} text Corpo do e‑mail em texto simples
 */
async function sendEmail(to, subject, text) {
  try {
    const info = await transporter.sendMail({
      from: process.env.MAIL_FROM,
      to,
      subject,
      text,
    });
    return info;
  } catch (err) {
    console.error('Erro ao enviar e‑mail', err);
    throw err;
  }
}

// Stub para ingestão de e‑mails - implementar via IMAP/POP e chamar esta função
function handleIncomingEmail(emailData) {
  // Exemplo: emailData.subject, emailData.from, emailData.text
  console.log('Recebido e‑mail de', emailData.from);
  // Processar conteúdo e abrir novo caso ou adicionar a um existente
}

module.exports = { sendEmail, handleIncomingEmail };