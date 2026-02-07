import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts';
import { formatEther } from 'viem';
import { publicClient } from './client';
import { encryptionService } from '../../security/encryption';
import type { BaseWallet } from './types';

export class WalletService {
  /**
   * Genera un nuevo wallet EVM (par de claves)
   * Encripta el private key con el master password
   */
  createWallet(masterPassword: string): BaseWallet {
    const privateKey = generatePrivateKey();
    const account = privateKeyToAccount(privateKey);

    const privateKeyEncrypted = encryptionService.encryptPrivateKey(
      privateKey,
      masterPassword
    );

    return {
      address: account.address,
      privateKeyEncrypted,
    };
  }

  /**
   * Consulta balance ETH (para gas) de una dirección en Base
   */
  async getETHBalance(address: `0x${string}`): Promise<number> {
    const balance = await publicClient.getBalance({ address });
    return parseFloat(formatEther(balance));
  }
}

export const walletService = new WalletService();
