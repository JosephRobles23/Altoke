import { TransactionList } from '@/components/dashboard/TransactionList';
import { getTransactionHistory } from '@/app/actions/transaction';

export default async function TransactionsPage() {
  const txResult = await getTransactionHistory();

  const transactions =
    txResult.success && txResult.data
      ? (txResult.data.transactions as Array<{
          id: string;
          type: 'send' | 'receive' | 'buy' | 'sell';
          amount: number;
          currency: string;
          status: 'pending' | 'completed' | 'failed';
          description?: string;
          txHash?: string;
          toAddress?: string;
          createdAt: string;
        }>)
      : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Historial de Transacciones</h1>
        <p className="text-muted-foreground">
          Consulta todas tus transacciones realizadas
        </p>
      </div>

      <TransactionList transactions={transactions} showAll />
    </div>
  );
}
