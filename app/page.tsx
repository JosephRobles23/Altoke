import Link from 'next/link';

export default function LandingPage() {
  return (
    <main className="flex min-h-screen flex-col">
      {/* Hero Section */}
      <header className="border-b">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <h1 className="text-2xl font-bold text-primary">Altoke</h1>
          <nav className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Iniciar Sesión
            </Link>
            <Link
              href="/signup"
              className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 transition-colors"
            >
              Registrarse
            </Link>
          </nav>
        </div>
      </header>

      <section className="flex flex-1 flex-col items-center justify-center px-4 text-center">
        <div className="max-w-3xl space-y-6">
          <h2 className="text-4xl font-bold tracking-tight sm:text-6xl">
            Envía dinero a Perú{' '}
            <span className="text-primary">al toque</span>
          </h2>
          <p className="text-lg text-muted-foreground sm:text-xl">
            Remesas rápidas, seguras y económicas usando tecnología blockchain.
            Convierte USD a PEN con las mejores tasas del mercado.
          </p>
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/signup"
              className="inline-flex h-11 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 transition-colors"
            >
              Comenzar ahora
            </Link>
            <Link
              href="#how-it-works"
              className="inline-flex h-11 items-center justify-center rounded-md border border-input bg-background px-8 text-sm font-medium shadow-sm hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              ¿Cómo funciona?
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="how-it-works" className="border-t py-16">
        <div className="container mx-auto px-4">
          <h3 className="mb-12 text-center text-3xl font-bold">¿Por qué Altoke?</h3>
          <div className="grid gap-8 md:grid-cols-3">
            <div className="rounded-lg border p-6 text-center">
              <div className="mb-4 text-4xl">⚡</div>
              <h4 className="mb-2 text-xl font-semibold">Rápido</h4>
              <p className="text-muted-foreground">
                Transferencias en segundos gracias a Hedera Hashgraph.
              </p>
            </div>
            <div className="rounded-lg border p-6 text-center">
              <div className="mb-4 text-4xl">🔒</div>
              <h4 className="mb-2 text-xl font-semibold">Seguro</h4>
              <p className="text-muted-foreground">
                Encriptación de grado militar y blockchain inmutable.
              </p>
            </div>
            <div className="rounded-lg border p-6 text-center">
              <div className="mb-4 text-4xl">💰</div>
              <h4 className="mb-2 text-xl font-semibold">Económico</h4>
              <p className="text-muted-foreground">
                Comisiones mínimas comparadas con servicios tradicionales.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Altoke. Todos los derechos reservados.</p>
        </div>
      </footer>
    </main>
  );
}
