export default function BuyPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Comprar USDC</h1>
        <p className="text-muted-foreground">
          Compra USDC con tarjeta de crédito o débito a través de Transak
        </p>
      </div>

      <div className="rounded-lg border p-6">
        {/* Widget de Transak se cargará aquí */}
        <div id="transak-widget" className="min-h-[500px]">
          <p className="text-center text-muted-foreground">
            Cargando widget de Transak...
          </p>
        </div>
      </div>
    </div>
  );
}
