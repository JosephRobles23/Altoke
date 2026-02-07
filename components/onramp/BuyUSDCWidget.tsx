'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { generateOnrampURL } from '@/app/actions/onramp';
import { ExternalLink, CreditCard } from 'lucide-react';

interface BuyUSDCWidgetProps {
  address?: string;
}

export function BuyUSDCWidget({ address }: BuyUSDCWidgetProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleBuy = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await generateOnrampURL();

      if (!result.success) {
        setError(result.error || 'Error al generar URL');
        return;
      }

      const url = result.data?.url as string;
      // Abrir el widget de Coinbase en una nueva ventana/popup
      const popup = window.open(
        url,
        'coinbase-onramp',
        'width=460,height=720,menubar=no,toolbar=no'
      );

      if (!popup) {
        // Si el popup fue bloqueado, abrir en nueva pestaña
        window.open(url, '_blank');
      }
    } catch {
      setError('Error inesperado. Intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Comprar USDC
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-lg bg-muted/50 p-4">
          <h3 className="font-medium">Coinbase On-Ramp</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Compra USDC directamente en Base con tarjeta de crédito/débito,
            transferencia bancaria o Apple Pay. Sin comisiones en USDC.
          </p>
        </div>

        {address && (
          <div className="rounded-lg border p-3">
            <p className="text-xs text-muted-foreground">
              Los USDC se depositarán en:
            </p>
            <p className="mt-1 font-mono text-sm">
              {address.slice(0, 6)}...{address.slice(-4)}
            </p>
          </div>
        )}

        {error && (
          <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <Button
          onClick={handleBuy}
          className="w-full"
          disabled={isLoading}
          size="lg"
        >
          {isLoading ? (
            <LoadingSpinner />
          ) : (
            <>
              Comprar USDC <ExternalLink className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>

        <p className="text-center text-xs text-muted-foreground">
          Serás redirigido al widget seguro de Coinbase
        </p>
      </CardContent>
    </Card>
  );
}
