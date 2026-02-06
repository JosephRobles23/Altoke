import { BalanceCard } from '@/components/dashboard/BalanceCard';
import { TransactionList } from '@/components/dashboard/TransactionList';
import { ExchangeRateWidget } from '@/components/dashboard/ExchangeRateWidget';

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Resumen de tu cuenta Altoke</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <BalanceCard />
        <ExchangeRateWidget />
      </div>

      <div>
        <h2 className="mb-4 text-xl font-semibold">Transacciones Recientes</h2>
        <TransactionList />
      </div>
    </div>
  );
}
