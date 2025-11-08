const crypto = require('crypto');
require('dotenv').config();

/*
 * Módulo de criptografia de mensagens.  Utiliza AES‑256‑GCM para cifrar o
 * conteúdo das mensagens armazenadas no banco de dados.  A chave de
 * criptografia é determinada pela variável de ambiente MESSAGE_SECRET.
 */

const MESSAGE_SECRET = (process.env.MESSAGE_SECRET || 'mensagem-secreta-chave-segura-32').padEnd(32, '0').slice(0, 32);

function encryptMessage(text) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', Buffer.from(MESSAGE_SECRET), iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const tag = cipher.getAuthTag().toString('hex');
  return { iv: iv.toString('hex'), content: encrypted, tag };
}

function decryptMessage({ iv, content, tag }) {
  const decipher = crypto.createDecipheriv('aes-256-gcm', Buffer.from(MESSAGE_SECRET), Buffer.from(iv, 'hex'));
  decipher.setAuthTag(Buffer.from(tag, 'hex'));
  let decrypted = decipher.update(content, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

module.exports = { encryptMessage, decryptMessage };