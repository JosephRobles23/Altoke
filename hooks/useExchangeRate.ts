'use client';

import { useState, useEffect, useCallback } from 'react';

interface ExchangeRateState {
  rate: number | null;
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

/**
 * Hook para obtener tasas de cambio en tiempo real
 * Actualiza automáticamente cada 5 minutos
 */
export function useExchangeRate(from: string = 'USD', to: string = 'PEN') {
  const [state, setState] = useState<ExchangeRateState>({
    rate: null,
    isLoading: true,
    error: null,
    lastUpdated: null,
  });

  const fetchRate = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      // TODO: Implementar llamada al API de exchange rate
      // Por ahora usar tasa estática para desarrollo
      const mockRate = from === 'USD' && to === 'PEN' ? 3.72 : 1;

      setState({
        rate: mockRate,
        isLoading: false,
        error: null,
        lastUpdated: new Date(),
      });
    } catch (error) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: 'Error al obtener tipo de cambio',
      }));
    }
  }, [from, to]);

  useEffect(() => {
    fetchRate();

    // Actualizar cada 5 minutos
    const interval = setInterval(fetchRate, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [fetchRate]);

  return { ...state, refresh: fetchRate };
}
