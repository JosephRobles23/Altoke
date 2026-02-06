'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp } from 'lucide-react';
import { useExchangeRate } from '@/hooks/useExchangeRate';

export function ExchangeRateWidget() {
  const { rate, isLoading, lastUpdated } = useExchangeRate('USD', 'PEN');

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Tipo de Cambio</CardTitle>
        <TrendingUp className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-muted-foreground">Cargando...</p>
        ) : (
          <div className="space-y-2">
            <p className="text-2xl font-bold">
              1 USD = {rate?.toFixed(4) || '--'} PEN
            </p>
            {lastUpdated && (
              <p className="text-xs text-muted-foreground">
                Actualizado: {new Date(lastUpdated).toLocaleTimeString('es-PE')}
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
