'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { createWallet } from '@/app/actions/wallet';
import { Wallet, Shield } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function CreateWalletCard() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleCreate = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await createWallet();

      if (!result.success) {
        setError(result.error || 'Error al crear el wallet');
        return;
      }

      router.refresh();
    } catch {
      setError('Error inesperado. Intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="mx-auto max-w-lg">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <Wallet className="h-8 w-8 text-primary" />
        </div>
        <CardTitle className="text-2xl">Crea tu Wallet</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-center">
        <p className="text-muted-foreground">
          Para empezar a usar Altoke, necesitas crear tu wallet en Base.
          Es seguro, rápido y tu clave privada estará encriptada.
        </p>

        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Shield className="h-4 w-4" />
          <span>Encriptación AES-256-GCM</span>
        </div>

        {error && (
          <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <Button
          onClick={handleCreate}
          className="w-full"
          size="lg"
          disabled={isLoading}
        >
          {isLoading ? <LoadingSpinner /> : 'Crear Wallet'}
        </Button>
      </CardContent>
    </Card>
  );
}
