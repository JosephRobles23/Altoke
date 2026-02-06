import { TransactionList } from '@/components/dashboard/TransactionList';

export default function TransactionsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Historial de Transacciones</h1>
        <p className="text-muted-foreground">
          Consulta todas tus transacciones realizadas
        </p>
      </div>

      <TransactionList showAll />
    </div>
  );
}
