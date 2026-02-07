'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { generateOnrampURL } from '@/app/actions/onramp';
import { Plus } from 'lucide-react';

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
          'coinbase-onramp',
          'width=460,height=720,menubar=no,toolbar=no'
        );
        if (!popup) {
          window.open(url, '_blank');
        }
      }
    } catch {
      // Silently handle - the buy page has better error handling
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
