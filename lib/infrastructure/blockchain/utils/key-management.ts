import { encryptionService } from './encryption';
import { env } from '@/lib/config/env';

/**
 * Utilidad para gestión segura de private keys
 */
export class KeyManagement {
  /**
   * Encripta un private key usando el master password del sistema
   */
  static encrypt(privateKey: string): string {
    return encryptionService.encryptPrivateKey(privateKey, env.ENCRYPTION_MASTER_PASSWORD);
  }

  /**
   * Desencripta un private key usando el master password del sistema
   */
  static decrypt(encryptedKey: string): string {
    return encryptionService.decryptPrivateKey(encryptedKey, env.ENCRYPTION_MASTER_PASSWORD);
  }
}
