'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Wallet } from 'lucide-react';

interface BalanceCardProps {
  hbar?: number;
  usdc?: number;
  accountId?: string;
}

export function BalanceCard({ hbar = 0, usdc = 0, accountId }: BalanceCardProps) {
  return (
    <Card className="col-span-1 lg:col-span-2">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Tu Wallet</CardTitle>
        <Wallet className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {accountId && (
            <p className="text-xs text-muted-foreground">
              Account ID: <span className="font-mono">{accountId}</span>
            </p>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg bg-muted/50 p-4">
              <p className="text-sm text-muted-foreground">USDC</p>
              <p className="text-2xl font-bold">${usdc.toFixed(2)}</p>
            </div>
            <div className="rounded-lg bg-muted/50 p-4">
              <p className="text-sm text-muted-foreground">HBAR</p>
              <p className="text-2xl font-bold">{hbar.toFixed(4)}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
