'use client';

import { Bell, LogOut, Settings, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { logoutUser } from '@/app/actions/auth';

export function Header() {
  return (
    <header className="flex h-16 items-center justify-between border-b px-6">
      <div>
        <h2 className="text-lg font-semibold">Altoke</h2>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" aria-label="Notificaciones">
          <Bell className="h-5 w-5" />
        </Button>

        <Button variant="ghost" size="icon" aria-label="Configuración">
          <Settings className="h-5 w-5" />
        </Button>

        <Button variant="ghost" size="icon" aria-label="Perfil">
          <User className="h-5 w-5" />
        </Button>

        <form action={logoutUser}>
          <Button variant="ghost" size="icon" type="submit" aria-label="Cerrar sesión">
            <LogOut className="h-5 w-5" />
          </Button>
        </form>
      </div>
    </header>
  );
}
