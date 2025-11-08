const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

// Caminho para o arquivo que armazena as identidades cifradas
const dataDir = path.join(__dirname, '..', 'data');
const identitiesFile = path.join(dataDir, 'identities.json');
if (!fs.existsSync(identitiesFile)) {
  fs.writeFileSync(identitiesFile, JSON.stringify([]));
}

// Chave secreta para criptografia (32 bytes). Deve ser configurada por ambiente.
const SECRET = (process.env.IDENTITY_SECRET || 'identidade-secreta-chave-segura-32-bytes').padEnd(32, '0').slice(0, 32);

/**
 * Carrega o banco de identidades cifradas.
 */
function loadIdentities() {
  const content = fs.readFileSync(identitiesFile, 'utf8');
  return content ? JSON.parse(content) : [];
}

/**
 * Salva a lista de identidades cifradas no arquivo.
 */
function saveIdentities(identities) {
  fs.writeFileSync(identitiesFile, JSON.stringify(identities, null, 2));
}

/**
 * Cifra um objeto de identidade usando AES-256-GCM.
 * @param {object} identityObj
 * @returns {object} Objeto contendo iv e conteúdo cifrado
 */
function encryptIdentity(identityObj) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', Buffer.from(SECRET), iv);
  const jsonStr = JSON.stringify(identityObj);
  let encrypted = cipher.update(jsonStr, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const tag = cipher.getAuthTag().toString('hex');
  return { iv: iv.toString('hex'), content: encrypted, tag };
}

/**
 * Decifra dados de identidade.
 * @param {object} encryptedData
 * @returns {object} Objeto de identidade original
 */
function decryptIdentity(encryptedData) {
  const { iv, content, tag } = encryptedData;
  const decipher = crypto.createDecipheriv('aes-256-gcm', Buffer.from(SECRET), Buffer.from(iv, 'hex'));
  decipher.setAuthTag(Buffer.from(tag, 'hex'));
  let decrypted = decipher.update(content, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return JSON.parse(decrypted);
}

/**
 * Armazena uma identidade associada a um caso.
 * @param {string} caseId
 * @param {object} identityData
 * @returns {string} ID da identidade armazenada
 */
function storeIdentity(caseId, identityData) {
  const identities = loadIdentities();
  const encrypted = encryptIdentity(identityData);
  const identityId = uuidv4();
  identities.push({ id: identityId, caseId, data: encrypted });
  saveIdentities(identities);
  return identityId;
}

/**
 * Recupera uma identidade descriptografada se existir.
 * @param {string} identityId
 * @returns {object|null}
 */
function retrieveIdentity(identityId) {
  const identities = loadIdentities();
  const entry = identities.find((i) => i.id === identityId);
  if (!entry) return null;
  return decryptIdentity(entry.data);
}

module.exports = { storeIdentity, retrieveIdentity };