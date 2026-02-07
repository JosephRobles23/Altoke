import { SendMoneyForm } from '@/components/dashboard/SendMoneyForm';
import { getWallet } from '@/app/actions/wallet';
import { redirect } from 'next/navigation';

export default async function SendPage() {
  const walletResult = await getWallet();

  if (!walletResult.success || !walletResult.data) {
    redirect('/dashboard');
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Enviar Dinero</h1>
        <p className="text-muted-foreground">
          Envía USDC a otro usuario de forma rápida y segura por Base
        </p>
      </div>

      <SendMoneyForm />
    </div>
  );
}
