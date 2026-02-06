import { SignupForm } from '@/components/auth/SignupForm';
import Link from 'next/link';

export default function SignupPage() {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Crear Cuenta</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Regístrate para comenzar a enviar remesas al toque
        </p>
      </div>

      <SignupForm />

      <p className="text-center text-sm text-muted-foreground">
        ¿Ya tienes cuenta?{' '}
        <Link href="/login" className="font-medium text-primary hover:underline">
          Inicia sesión
        </Link>
      </p>
    </div>
  );
}
