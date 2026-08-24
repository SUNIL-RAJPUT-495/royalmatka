import crypto from "crypto";

/**
 * Encrypt a JSON object using AES-256-ECB with PKCS7 padding
 * @param {Object} obj Plaintext object to encrypt
 * @param {string} secret 32-character secret key
 * @returns {string} Base64 encoded ciphertext
 */
export function encryptPayload(obj, secret) {
  const c = crypto.createCipheriv("aes-256-ecb", Buffer.from(secret, "utf8"), null);
  c.setAutoPadding(true); // PKCS7 padding
  return Buffer.concat([c.update(JSON.stringify(obj), "utf8"), c.final()]).toString("base64");
}

/**
 * Decrypt a Base64 encoded AES-256-ECB ciphertext to JSON object
 * @param {string} b64 Base64 encoded ciphertext
 * @param {string} secret 32-character secret key
 * @returns {Object} Decrypted JSON object
 */
export function decryptPayload(b64, secret) {
  const d = crypto.createDecipheriv("aes-256-ecb", Buffer.from(secret, "utf8"), null);
  d.setAutoPadding(true);
  return JSON.parse(Buffer.concat([d.update(Buffer.from(b64, "base64")), d.final()]).toString("utf8"));
}

export default {
  encryptPayload,
  decryptPayload
};
