'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { generateOnrampURL } from '@/app/actions/onramp';
import { Plus } from 'lucide-react';

/**
 * Botón rápido para fondear wallet vía TransFi On-Ramp.
 * Abre el widget de TransFi en una ventana popup.
 */
export function FundWalletButton() {
  const [isLoading, setIsLoading] = useState(false);

  const handleFund = async () => {
    setIsLoading(true);

    try {
      const result = await generateOnrampURL();

      if (result.success && result.data?.url) {
        const url = result.data.url as string;
        const popup = window.open(
          url,
          'transfi-onramp',
          'width=500,height=750,menubar=no,toolbar=no'
        );
        if (!popup) {
          window.open(url, '_blank');
        }
      }
    } catch {
      // Silently handle - la página de compra tiene mejor manejo de errores
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button onClick={handleFund} disabled={isLoading} variant="outline">
      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <>
          <Plus className="mr-2 h-4 w-4" />
          Fondear Wallet
        </>
      )}
    </Button>
  );
}
