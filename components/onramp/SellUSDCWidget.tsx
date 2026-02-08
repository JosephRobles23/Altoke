'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { generateOfframpURL } from '@/app/actions/onramp';
import { Banknote, ShieldCheck, Globe } from 'lucide-react';

interface SellUSDCWidgetProps {
  address?: string;
  balance?: number;
}

/**
 * Widget de venta de USDC usando TransFi Off-Ramp.
 *
 * Integración: abre el widget de TransFi en un iframe embebido.
 * TransFi convierte USDC a fiat y paga al banco del usuario.
 *
 * Ref: https://ramp-docs.transfi.com/docs/widget-integration
 */
export function SellUSDCWidget({ address, balance = 0 }: SellUSDCWidgetProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [widgetUrl, setWidgetUrl] = useState<string | null>(null);

  const handleSell = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setWidgetUrl(null);

    try {
      const result = await generateOfframpURL();

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
              <Banknote className="h-5 w-5" />
              Vender USDC — TransFi
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
              title="TransFi Off-Ramp Widget"
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
          <Banknote className="h-5 w-5" />
          Vender USDC
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-lg bg-muted/50 p-4">
          <h3 className="font-medium">TransFi Off-Ramp</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Convierte tus USDC a moneda local (PEN, USD, etc.) y recíbelos
            directamente en tu cuenta bancaria.
          </p>
        </div>

        {/* Features */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2 rounded-lg border p-3">
            <Globe className="h-4 w-4 text-blue-500" />
            <span className="text-sm">Pago a tu banco</span>
          </div>
          <div className="flex items-center gap-2 rounded-lg border p-3">
            <ShieldCheck className="h-4 w-4 text-green-500" />
            <span className="text-sm">Proceso seguro</span>
          </div>
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
            <>Vender USDC</>
          )}
        </Button>

        <p className="text-center text-xs text-muted-foreground">
          Procesado de forma segura por TransFi
        </p>
      </CardContent>
    </Card>
  );
}
