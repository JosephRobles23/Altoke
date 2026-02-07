import { parseUnits, formatUnits } from 'viem';
import { publicClient, getWalletClient, CHAIN_CONFIG } from './client';
import { ERC20_ABI, USDC_DECIMALS } from './contracts';
import type { BaseTransactionResult } from './types';

export class USDCService {
  private usdcAddress = CHAIN_CONFIG.usdc as `0x${string}`;

  /**
   * Consulta balance USDC de una dirección
   */
  async getBalance(address: `0x${string}`): Promise<number> {
    const balance = await publicClient.readContract({
      address: this.usdcAddress,
      abi: ERC20_ABI,
      functionName: 'balanceOf',
      args: [address],
    });

    return parseFloat(formatUnits(balance, USDC_DECIMALS));
  }

  /**
   * Transfiere USDC de una dirección a otra en Base
   */
  async transfer(
    fromPrivateKey: `0x${string}`,
    toAddress: `0x${string}`,
    amount: number
  ): Promise<BaseTransactionResult> {
    const walletClient = getWalletClient(fromPrivateKey);
    const amountWei = parseUnits(amount.toString(), USDC_DECIMALS);

    // Enviar TX de transfer ERC-20
    const txHash = await walletClient.writeContract({
      address: this.usdcAddress,
      abi: ERC20_ABI,
      functionName: 'transfer',
      args: [toAddress, amountWei],
    });

    // Esperar confirmación
    const receipt = await publicClient.waitForTransactionReceipt({
      hash: txHash,
    });

    return {
      txHash: receipt.transactionHash,
      blockNumber: receipt.blockNumber,
      gasUsed: receipt.gasUsed,
    };
  }

  /**
   * Genera link a BaseScan para una TX
   */
  getExplorerUrl(txHash: string): string {
    return `${CHAIN_CONFIG.explorer}/tx/${txHash}`;
  }

  /**
   * Genera link a BaseScan para una dirección
   */
  getAddressExplorerUrl(address: string): string {
    return `${CHAIN_CONFIG.explorer}/address/${address}`;
  }
}

export const usdcService = new USDCService();
