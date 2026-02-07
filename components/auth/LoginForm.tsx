'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FormField } from '@/components/ui/form';
import { loginUser, signInWithGoogle } from '@/app/actions/auth';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.96 10.96 0 0 0 1 12c0 1.77.42 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}

export function LoginForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
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

  async function handleGoogleSignIn() {
    setIsGoogleLoading(true);
    setError(null);

    try {
      const result = await signInWithGoogle();

      if (!result.success || !result.url) {
        setError(result.error || 'Error al iniciar sesión con Google');
        return;
      }

      // Redirigir al flujo OAuth de Google
      window.location.href = result.url;
    } catch {
      setError('Error inesperado al conectar con Google.');
    } finally {
      setIsGoogleLoading(false);
    }
  }

  const anyLoading = isLoading || isGoogleLoading;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-center">Bienvenido de vuelta</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        {/* Google OAuth */}
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={handleGoogleSignIn}
          disabled={anyLoading}
        >
          {isGoogleLoading ? (
            <LoadingSpinner />
          ) : (
            <>
              <GoogleIcon className="mr-2 h-5 w-5" />
              Continuar con Google
            </>
          )}
        </Button>

        {/* Separador */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">
              o con email
            </span>
          </div>
        </div>

        {/* Formulario email/password */}
        <form action={handleSubmit} className="space-y-4">
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
              disabled={anyLoading}
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
              disabled={anyLoading}
            />
          </FormField>

          <Button type="submit" className="w-full" disabled={anyLoading}>
            {isLoading ? <LoadingSpinner /> : 'Iniciar Sesión'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
