export default function SettingsPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Configuración</h1>
        <p className="text-muted-foreground">
          Administra tu perfil y preferencias de cuenta
        </p>
      </div>

      <div className="space-y-6">
        {/* Perfil */}
        <div className="rounded-lg border p-6">
          <h2 className="mb-4 text-xl font-semibold">Perfil</h2>
          <p className="text-sm text-muted-foreground">
            Actualiza tu información personal y datos KYC.
          </p>
          {/* TODO: Formulario de perfil */}
        </div>

        {/* Seguridad */}
        <div className="rounded-lg border p-6">
          <h2 className="mb-4 text-xl font-semibold">Seguridad</h2>
          <p className="text-sm text-muted-foreground">
            Gestiona la seguridad de tu cuenta.
          </p>
          {/* TODO: Opciones de seguridad */}
        </div>

        {/* Wallet */}
        <div className="rounded-lg border p-6">
          <h2 className="mb-4 text-xl font-semibold">Wallet</h2>
          <p className="text-sm text-muted-foreground">
            Información de tu wallet Hedera.
          </p>
          {/* TODO: Info del wallet */}
        </div>
      </div>
    </div>
  );
}
