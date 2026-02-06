'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowUpRight, ArrowDownLeft, ExternalLink } from 'lucide-react';

interface Transaction {
  id: string;
  type: 'send' | 'receive' | 'buy' | 'sell';
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed';
  description?: string;
  hederaTxId?: string;
  createdAt: string;
}

interface TransactionListProps {
  transactions?: Transaction[];
  showAll?: boolean;
}

const HEDERA_EXPLORER_URL = 'https://hashscan.io/testnet/transaction';

export function TransactionList({ transactions = [], showAll = false }: TransactionListProps) {
  const displayTransactions = showAll ? transactions : transactions.slice(0, 5);

  if (displayTransactions.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-10">
          <p className="text-muted-foreground">No hay transacciones aún</p>
          <p className="text-sm text-muted-foreground">
            Tus transacciones aparecerán aquí
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">
          {showAll ? 'Todas las Transacciones' : 'Recientes'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {displayTransactions.map((tx) => (
            <div
              key={tx.id}
              className="flex items-center justify-between rounded-lg border p-4"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`rounded-full p-2 ${
                    tx.type === 'send' || tx.type === 'sell'
                      ? 'bg-red-100 text-red-600'
                      : 'bg-green-100 text-green-600'
                  }`}
                >
                  {tx.type === 'send' || tx.type === 'sell' ? (
                    <ArrowUpRight className="h-4 w-4" />
                  ) : (
                    <ArrowDownLeft className="h-4 w-4" />
                  )}
                </div>
                <div>
                  <p className="font-medium capitalize">{tx.type}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(tx.createdAt).toLocaleDateString('es-PE')}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="text-right">
                  <p className="font-medium">
                    {tx.type === 'send' || tx.type === 'sell' ? '-' : '+'}
                    {tx.amount.toFixed(2)} {tx.currency}
                  </p>
                  <p
                    className={`text-xs ${
                      tx.status === 'completed'
                        ? 'text-green-600'
                        : tx.status === 'failed'
                          ? 'text-red-600'
                          : 'text-yellow-600'
                    }`}
                  >
                    {tx.status}
                  </p>
                </div>

                {tx.hederaTxId && (
                  <a
                    href={`${HEDERA_EXPLORER_URL}/${tx.hederaTxId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-foreground"
                    aria-label="Ver en explorador de Hedera"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
