import { Wallet } from '@/lib/domain/entities/Wallet';
import { IWalletRepository } from '@/lib/domain/repositories/IWalletRepository';

export interface IBlockchainWalletService {
  createWallet(masterPassword: string): {
    address: string;
    privateKeyEncrypted: string;
  };
}

export interface CreateWalletRequest {
  userId: string;
  network?: 'base-sepolia' | 'base';
}

export interface CreateWalletResponse {
  walletId: string;
  address: string;
}

export class CreateWalletUseCase {
  constructor(
    private walletRepo: IWalletRepository,
    private blockchainService: IBlockchainWalletService,
    private masterPassword: string
  ) {}

  async execute(request: CreateWalletRequest): Promise<CreateWalletResponse> {
    // 1. Verificar que no exista un wallet para el usuario
    const existingWallet = await this.walletRepo.findByUserId(request.userId);
    if (existingWallet) {
      throw new Error('User already has a wallet');
    }

    // 2. Crear wallet EVM con viem
    const newWallet = this.blockchainService.createWallet(this.masterPassword);

    // 3. Guardar wallet en base de datos
    const wallet = Wallet.create({
      userId: request.userId,
      address: newWallet.address,
      privateKeyEncrypted: newWallet.privateKeyEncrypted,
      balance: { eth: 0, usdc: 0 },
      network: request.network || 'base-sepolia',
    });

    await this.walletRepo.save(wallet);

    return {
      walletId: wallet.id,
      address: wallet.address,
    };
  }
}
