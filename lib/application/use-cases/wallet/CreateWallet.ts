import { Wallet } from '@/lib/domain/entities/Wallet';
import { IWalletRepository } from '@/lib/domain/repositories/IWalletRepository';

export interface IBlockchainAccountService {
  createAccount(): Promise<{
    accountId: string;
    publicKey: string;
    privateKey: string;
  }>;
}

export interface IEncryptionService {
  encryptPrivateKey(privateKey: string, masterPassword: string): string;
}

export interface CreateWalletRequest {
  userId: string;
  network?: 'testnet' | 'mainnet';
}

export interface CreateWalletResponse {
  walletId: string;
  accountId: string;
  publicKey: string;
}

export class CreateWalletUseCase {
  constructor(
    private walletRepo: IWalletRepository,
    private blockchainService: IBlockchainAccountService,
    private encryptionService: IEncryptionService,
    private masterPassword: string
  ) {}

  async execute(request: CreateWalletRequest): Promise<CreateWalletResponse> {
    // 1. Verificar que no exista un wallet para el usuario
    const existingWallet = await this.walletRepo.findByUserId(request.userId);
    if (existingWallet) {
      throw new Error('User already has a wallet');
    }

    // 2. Crear cuenta en Hedera
    const account = await this.blockchainService.createAccount();

    // 3. Encriptar private key
    const encryptedKey = this.encryptionService.encryptPrivateKey(
      account.privateKey,
      this.masterPassword
    );

    // 4. Guardar wallet en base de datos
    const wallet = Wallet.create({
      userId: request.userId,
      accountId: account.accountId,
      publicKey: account.publicKey,
      privateKeyEncrypted: encryptedKey,
      balance: { hbar: 0, usdc: 0 },
      network: request.network || 'testnet',
    });

    await this.walletRepo.save(wallet);

    return {
      walletId: wallet.id,
      accountId: wallet.accountId,
      publicKey: wallet.publicKey,
    };
  }
}
