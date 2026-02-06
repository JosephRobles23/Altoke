import { IWalletRepository } from '@/lib/domain/repositories/IWalletRepository';

export interface ITokenService {
  associateToken(accountId: string, privateKey: string, tokenId: string): Promise<void>;
}

export interface IEncryptionDecryptService {
  decryptPrivateKey(encryptedData: string, masterPassword: string): string;
}

export interface AssociateTokenRequest {
  userId: string;
  tokenId: string;
}

export class AssociateTokenUseCase {
  constructor(
    private walletRepo: IWalletRepository,
    private tokenService: ITokenService,
    private encryptionService: IEncryptionDecryptService,
    private masterPassword: string
  ) {}

  async execute(request: AssociateTokenRequest): Promise<void> {
    // 1. Obtener wallet del usuario
    const wallet = await this.walletRepo.findByUserId(request.userId);
    if (!wallet || !wallet.privateKeyEncrypted) {
      throw new Error('Wallet not found or no private key');
    }

    // 2. Desencriptar private key
    const privateKey = this.encryptionService.decryptPrivateKey(
      wallet.privateKeyEncrypted,
      this.masterPassword
    );

    // 3. Asociar token en Hedera
    await this.tokenService.associateToken(wallet.accountId, privateKey, request.tokenId);
  }
}
