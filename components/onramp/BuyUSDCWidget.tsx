'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { generateOnrampURL } from '@/app/actions/onramp';
import { CreditCard, ShieldCheck, Globe } from 'lucide-react';

interface BuyUSDCWidgetProps {
  address?: string;
}

/**
 * Widget de compra de USDC usando TransFi On-Ramp.
 *
 * Integración: abre el widget de TransFi en un iframe embebido.
 * TransFi soporta 40+ monedas fiat, 250+ métodos de pago y 100+ países.
 *
 * Ref: https://ramp-docs.transfi.com/docs/widget-integration
 */
export function BuyUSDCWidget({ address }: BuyUSDCWidgetProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [widgetUrl, setWidgetUrl] = useState<string | null>(null);

  const handleBuy = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setWidgetUrl(null);

    try {
      const result = await generateOnrampURL();

      if (!result.success) {
        setError(result.error || 'Error al generar URL');
        return;
      }

      const url = result.data?.url as string;
      setWidgetUrl(url);
    } catch {
      setError('Error inesperado. Intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleCloseWidget = useCallback(() => {
    setWidgetUrl(null);
  }, []);

  // Si el widget está abierto, mostrar iframe
  if (widgetUrl) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Comprar USDC — TransFi
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={handleCloseWidget}>
              Cerrar
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-hidden rounded-lg border">
            <iframe
              src={widgetUrl}
              title="TransFi On-Ramp Widget"
              width="100%"
              height="680"
              style={{ border: 'none' }}
              allow="camera; microphone; payment"
              sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-top-navigation"
            />
          </div>
          <p className="mt-3 text-center text-xs text-muted-foreground">
            Procesado de forma segura por TransFi. Tu información está protegida.
          </p>
        </CardContent>
      </Card>
    );
  }

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
          <h3 className="font-medium">TransFi On-Ramp</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Compra USDC en Base con tarjeta de crédito/débito, transferencia
            bancaria y más de 250 métodos de pago en 100+ países.
          </p>
        </div>

        {/* Features */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2 rounded-lg border p-3">
            <Globe className="h-4 w-4 text-blue-500" />
            <span className="text-sm">40+ monedas fiat</span>
          </div>
          <div className="flex items-center gap-2 rounded-lg border p-3">
            <ShieldCheck className="h-4 w-4 text-green-500" />
            <span className="text-sm">KYC integrado</span>
          </div>
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
            <>Comprar USDC</>
          )}
        </Button>

        <p className="text-center text-xs text-muted-foreground">
          Procesado de forma segura por TransFi
        </p>
      </CardContent>
    </Card>
  );
}
