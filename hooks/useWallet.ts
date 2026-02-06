'use client';

import { useState, useEffect, useCallback } from 'react';
import { getBalance } from '@/app/actions/wallet';

interface WalletState {
  accountId: string | null;
  balanceHbar: number;
  balanceUsdc: number;
  isLoading: boolean;
  error: string | null;
}

/**
 * Hook para gestión del wallet
 */
export function useWallet(walletId?: string) {
  const [state, setState] = useState<WalletState>({
    accountId: null,
    balanceHbar: 0,
    balanceUsdc: 0,
    isLoading: true,
    error: null,
  });

  const fetchBalance = useCallback(async () => {
    if (!walletId) {
      setState((prev) => ({ ...prev, isLoading: false }));
      return;
    }

    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const result = await getBalance(walletId);

      if (result.success && result.data) {
        setState({
          accountId: null, // TODO: obtener del resultado
          balanceHbar: (result.data.hbar as number) || 0,
          balanceUsdc: (result.data.usdc as number) || 0,
          isLoading: false,
          error: null,
        });
      } else {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: result.error || 'Error al obtener balance',
        }));
      }
    } catch (error) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: 'Error inesperado al obtener balance',
      }));
    }
  }, [walletId]);

  useEffect(() => {
    fetchBalance();
  }, [fetchBalance]);

  return { ...state, refresh: fetchBalance };
}
