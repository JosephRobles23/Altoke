'use client';

import { useState, useCallback } from 'react';
import { sendRemittance, type TransactionActionResult } from '@/app/actions/transaction';

interface TransactionState {
  isLoading: boolean;
  error: string | null;
  result: TransactionActionResult | null;
}

/**
 * Hook para operaciones de transacciones
 */
export function useTransaction() {
  const [state, setState] = useState<TransactionState>({
    isLoading: false,
    error: null,
    result: null,
  });

  const send = useCallback(async (formData: FormData) => {
    setState({ isLoading: true, error: null, result: null });

    try {
      const result = await sendRemittance(formData);
      setState({
        isLoading: false,
        error: result.success ? null : result.error || 'Error desconocido',
        result,
      });
      return result;
    } catch (error) {
      const errorMessage = 'Error inesperado al enviar remesa';
      setState({
        isLoading: false,
        error: errorMessage,
        result: null,
      });
      return { success: false, error: errorMessage };
    }
  }, []);

  const reset = useCallback(() => {
    setState({ isLoading: false, error: null, result: null });
  }, []);

  return { ...state, send, reset };
}
