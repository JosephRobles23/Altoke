import { BalanceCard } from '@/components/dashboard/BalanceCard';
import { TransactionList } from '@/components/dashboard/TransactionList';
import { ExchangeRateWidget } from '@/components/dashboard/ExchangeRateWidget';
import { KycStatusBadge } from '@/components/dashboard/KycStatusBadge';
import { FundWalletButton } from '@/components/onramp/FundWalletButton';
import { getWallet, getBalance } from '@/app/actions/wallet';
import { getTransactionHistory } from '@/app/actions/transaction';
import { getProfile } from '@/app/actions/profile';
import { CreateWalletCard } from './CreateWalletCard';

export default async function DashboardPage() {
  const [walletResult, profileResult] = await Promise.all([
    getWallet(),
    getProfile(),
  ]);
  const hasWallet = walletResult.success && walletResult.data;

  let balanceData = { eth: 0, usdc: 0 };
  let transactions: Array<{
    id: string;
    type: 'send' | 'receive' | 'buy' | 'sell';
    amount: number;
    currency: string;
    status: 'pending' | 'completed' | 'failed';
    description?: string;
    txHash?: string;
    toAddress?: string;
    createdAt: string;
  }> = [];

  if (hasWallet) {
    // Obtener balance actualizado on-chain y transacciones en paralelo
    const [balanceResult, txResult] = await Promise.all([
      getBalance(),
      getTransactionHistory(),
    ]);

    if (balanceResult.success && balanceResult.data) {
      balanceData = {
        eth: balanceResult.data.eth as number,
        usdc: balanceResult.data.usdc as number,
      };
    }

    if (txResult.success && txResult.data) {
      transactions = txResult.data.transactions as typeof transactions;
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            {profileResult.success && profileResult.data
              ? `Hola, ${profileResult.data.fullName}`
              : 'Resumen de tu cuenta Altoke'}
          </p>
        </div>
        {hasWallet && <FundWalletButton />}
      </div>

      {/* KYC Status */}
      {profileResult.success && profileResult.data && (
        <KycStatusBadge
          kycStatus={profileResult.data.kycStatus}
          kycLevel={profileResult.data.kycLevel}
        />
      )}

      {!hasWallet ? (
        <CreateWalletCard />
      ) : (
        <>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <BalanceCard
              eth={balanceData.eth}
              usdc={balanceData.usdc}
              address={walletResult.data?.address as string}
              network={walletResult.data?.network as string}
            />
            <ExchangeRateWidget />
          </div>

          <div>
            <h2 className="mb-4 text-xl font-semibold">
              Transacciones Recientes
            </h2>
            <TransactionList transactions={transactions} />
          </div>
        </>
      )}
    </div>
  );
}
