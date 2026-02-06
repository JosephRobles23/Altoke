import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const KEY_LENGTH = 32;
const IV_LENGTH = 16;
const SALT_LENGTH = 64;

/**
 * Servicio de encriptación para private keys
 * Utiliza AES-256-GCM para encriptar/desencriptar datos sensibles
 */
export class EncryptionService {
  private getKey(password: string, salt: Buffer): Buffer {
    return scryptSync(password, salt, KEY_LENGTH);
  }

  /**
   * Encripta un private key usando AES-256-GCM
   * @param privateKey - Private key en formato string
   * @param masterPassword - Password maestro (desde env var)
   * @returns String encriptado en formato: salt:iv:tag:encrypted
   */
  encryptPrivateKey(privateKey: string, masterPassword: string): string {
    const salt = randomBytes(SALT_LENGTH);
    const key = this.getKey(masterPassword, salt);
    const iv = randomBytes(IV_LENGTH);

    const cipher = createCipheriv(ALGORITHM, key, iv);

    let encrypted = cipher.update(privateKey, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const tag = cipher.getAuthTag();

    // Formato: salt:iv:tag:encrypted
    return [salt.toString('hex'), iv.toString('hex'), tag.toString('hex'), encrypted].join(':');
  }

  /**
   * Desencripta un private key
   * @param encryptedData - String encriptado
   * @param masterPassword - Password maestro
   * @returns Private key original
   */
  decryptPrivateKey(encryptedData: string, masterPassword: string): string {
    const [saltHex, ivHex, tagHex, encrypted] = encryptedData.split(':');

    const salt = Buffer.from(saltHex, 'hex');
    const iv = Buffer.from(ivHex, 'hex');
    const tag = Buffer.from(tagHex, 'hex');
    const key = this.getKey(masterPassword, salt);

    const decipher = createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(tag);

    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }
}

// Singleton
export const encryptionService = new EncryptionService();
