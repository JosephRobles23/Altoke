'use client';

import { useState, useEffect, useCallback } from 'react';
import { getBalance } from '@/app/actions/wallet';

interface WalletState {
  address: string | null;
  balanceEth: number;
  balanceUsdc: number;
  network: string | null;
  isLoading: boolean;
  error: string | null;
}

/**
 * Hook para gestión del wallet
 */
export function useWallet() {
  const [state, setState] = useState<WalletState>({
    address: null,
    balanceEth: 0,
    balanceUsdc: 0,
    network: null,
    isLoading: true,
    error: null,
  });

  const fetchBalance = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const result = await getBalance();

      if (result.success && result.data) {
        setState({
          address: (result.data.address as string) || null,
          balanceEth: (result.data.eth as number) || 0,
          balanceUsdc: (result.data.usdc as number) || 0,
          network: (result.data.network as string) || null,
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
    } catch {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: 'Error inesperado al obtener balance',
      }));
    }
  }, []);

  useEffect(() => {
    fetchBalance();
  }, [fetchBalance]);

  return { ...state, refresh: fetchBalance };
}
