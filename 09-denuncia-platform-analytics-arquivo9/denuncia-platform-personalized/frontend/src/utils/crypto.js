// utilitário de criptografia para o front‑end
// Usa a biblioteca crypto‑js para realizar criptografia simétrica AES

import CryptoJS from 'crypto-js';

/**
 * Gera uma chave aleatória de 256 bits em formato hexadecimal.
 * Esta chave deve ser armazenada localmente pelo cliente para descriptografar
 * posteriormente as informações do caso.  A chave não é enviada ao servidor.
 * @returns {string} chave de 32 bytes em hexadecimal
 */
export function generateRandomKey() {
  return CryptoJS.lib.WordArray.random(32).toString();
}

/**
 * Criptografa um objeto JSON como uma string AES encriptada.
 * @param {object} obj Objeto a ser criptografado
 * @param {string} key Chave em formato hexadecimal
 * @returns {string} Ciphertext codificado em base64
 */
export function encryptObject(obj, key) {
  const jsonStr = JSON.stringify(obj);
  const ciphertext = CryptoJS.AES.encrypt(jsonStr, key).toString();
  return ciphertext;
}

/**
 * Descriptografa um objeto a partir de uma string cifrada AES.
 * @param {string} ciphertext Texto cifrado (base64)
 * @param {string} key Chave em hexadecimal
 * @returns {object} Objeto original
 */
export function decryptObject(ciphertext, key) {
  try {
    const bytes = CryptoJS.AES.decrypt(ciphertext, key);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
    return JSON.parse(decrypted);
  } catch (err) {
    console.error('Falha ao descriptografar', err);
    return null;
  }
}