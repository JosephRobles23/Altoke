'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { generateOfframpURL } from '@/app/actions/onramp';
import { ExternalLink, Banknote } from 'lucide-react';

interface SellUSDCWidgetProps {
  address?: string;
  balance?: number;
}

export function SellUSDCWidget({ address, balance = 0 }: SellUSDCWidgetProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSell = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await generateOfframpURL();

      if (!result.success) {
        setError(result.error || 'Error al generar URL');
        return;
      }

      const url = result.data?.url as string;
      // Abrir el widget de Coinbase en una nueva ventana/popup
      const popup = window.open(
        url,
        'coinbase-offramp',
        'width=460,height=720,menubar=no,toolbar=no'
      );

      if (!popup) {
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
          <Banknote className="h-5 w-5" />
          Vender USDC
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-lg bg-muted/50 p-4">
          <h3 className="font-medium">Coinbase Off-Ramp</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Convierte tus USDC a USD y retíralos a tu cuenta bancaria.
            Sin comisiones en USDC.
          </p>
        </div>

        {address && (
          <div className="rounded-lg border p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Tu wallet:</p>
                <p className="mt-1 font-mono text-sm">
                  {address.slice(0, 6)}...{address.slice(-4)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Balance USDC:</p>
                <p className="mt-1 text-lg font-bold">${balance.toFixed(2)}</p>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <Button
          onClick={handleSell}
          className="w-full"
          disabled={isLoading || balance <= 0}
          size="lg"
          variant={balance <= 0 ? 'secondary' : 'default'}
        >
          {isLoading ? (
            <LoadingSpinner />
          ) : balance <= 0 ? (
            'Sin USDC disponible'
          ) : (
            <>
              Vender USDC <ExternalLink className="ml-2 h-4 w-4" />
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
