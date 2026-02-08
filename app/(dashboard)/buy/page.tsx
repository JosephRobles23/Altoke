import { BuyUSDCWidget } from '@/components/onramp/BuyUSDCWidget';
import { getWallet } from '@/app/actions/wallet';
import { redirect } from 'next/navigation';

export default async function BuyPage() {
  const walletResult = await getWallet();

  if (!walletResult.success || !walletResult.data) {
    redirect('/dashboard');
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Comprar USDC</h1>
        <p className="text-muted-foreground">
          Compra USDC con múltiples métodos de pago a través de TransFi
        </p>
      </div>

      <BuyUSDCWidget address={walletResult.data!.address as string} />
    </div>
  );
}
