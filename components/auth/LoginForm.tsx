'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FormField } from '@/components/ui/form';
import { loginUser } from '@/app/actions/auth';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';

export function LoginForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  async function handleSubmit(formData: FormData) {
    setIsLoading(true);
    setError(null);
    setFieldErrors({});

    try {
      const result = await loginUser(formData);

      if (!result.success) {
        setError(result.error || 'Error al iniciar sesión');
        if (result.fields) setFieldErrors(result.fields);
        return;
      }

      router.push('/dashboard');
    } catch {
      setError('Error inesperado. Intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-center">Bienvenido de vuelta</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <FormField
            label="Email"
            htmlFor="email"
            error={fieldErrors.email?.[0]}
          >
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="tu@email.com"
              required
              disabled={isLoading}
            />
          </FormField>

          <FormField
            label="Contraseña"
            htmlFor="password"
            error={fieldErrors.password?.[0]}
          >
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              required
              disabled={isLoading}
            />
          </FormField>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? <LoadingSpinner /> : 'Iniciar Sesión'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
