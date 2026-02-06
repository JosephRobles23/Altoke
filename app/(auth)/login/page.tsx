import { LoginForm } from '@/components/auth/LoginForm';
import Link from 'next/link';

export default function LoginPage() {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Iniciar Sesión</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Ingresa tus credenciales para acceder a tu cuenta
        </p>
      </div>

      <LoginForm />

      <p className="text-center text-sm text-muted-foreground">
        ¿No tienes cuenta?{' '}
        <Link href="/signup" className="font-medium text-primary hover:underline">
          Regístrate aquí
        </Link>
      </p>
    </div>
  );
}
