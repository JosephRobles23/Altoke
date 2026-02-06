'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FormField } from '@/components/ui/form';
import { sendRemittance } from '@/app/actions/transaction';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { useExchangeRate } from '@/hooks/useExchangeRate';

export function SendMoneyForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [amount, setAmount] = useState('');

  const { rate, isLoading: rateLoading } = useExchangeRate('USD', 'PEN');

  const amountPEN = rate && amount ? (parseFloat(amount) * rate).toFixed(2) : '0.00';

  async function handleSubmit(formData: FormData) {
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const result = await sendRemittance(formData);

      if (!result.success) {
        setError(result.error || 'Error al enviar');
        return;
      }

      setSuccess(true);
      setAmount('');
    } catch {
      setError('Error inesperado. Intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Enviar USDC</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          {success && (
            <div className="rounded-md bg-green-50 p-3 text-sm text-green-700">
              Transacción enviada exitosamente
            </div>
          )}

          <FormField label="Account ID del Destinatario" htmlFor="toAccountId">
            <Input
              id="toAccountId"
              name="toAccountId"
              type="text"
              placeholder="0.0.xxxxx"
              required
              disabled={isLoading}
            />
          </FormField>

          <FormField label="Monto (USDC)" htmlFor="amount">
            <Input
              id="amount"
              name="amount"
              type="number"
              step="0.01"
              min="0.01"
              max="10000"
              placeholder="0.00"
              required
              disabled={isLoading}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </FormField>

          {/* Calculadora de tipo de cambio */}
          <div className="rounded-lg bg-muted/50 p-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Tipo de cambio:</span>
              <span className="font-medium">
                {rateLoading ? 'Cargando...' : `1 USD = ${rate?.toFixed(4) || '--'} PEN`}
              </span>
            </div>
            <div className="mt-2 flex items-center justify-between text-sm">
              <span className="text-muted-foreground">El destinatario recibe:</span>
              <span className="text-lg font-bold text-primary">S/ {amountPEN}</span>
            </div>
          </div>

          <FormField label="Descripción (opcional)" htmlFor="description">
            <Input
              id="description"
              name="description"
              type="text"
              placeholder="Ej: Remesa familiar"
              disabled={isLoading}
            />
          </FormField>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? <LoadingSpinner /> : 'Enviar'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
