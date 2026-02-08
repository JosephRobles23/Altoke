import { SellUSDCWidget } from '@/components/onramp/SellUSDCWidget';
import { getWallet, getBalance } from '@/app/actions/wallet';
import { redirect } from 'next/navigation';

export default async function SellPage() {
  const walletResult = await getWallet();

  if (!walletResult.success || !walletResult.data) {
    redirect('/dashboard');
  }

  // Obtener balance actualizado
  const balanceResult = await getBalance();
  const usdcBalance =
    balanceResult.success && balanceResult.data
      ? (balanceResult.data.usdc as number)
      : 0;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Vender USDC</h1>
        <p className="text-muted-foreground">
          Convierte tus USDC a moneda local a través de TransFi
        </p>
      </div>

      <SellUSDCWidget
        address={walletResult.data!.address as string}
        balance={usdcBalance}
      />
    </div>
  );
}
