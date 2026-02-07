'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Wallet, Copy, ExternalLink, Check } from 'lucide-react';
import { useState } from 'react';

interface BalanceCardProps {
  eth?: number;
  usdc?: number;
  address?: string;
  network?: string;
}

const EXPLORER_BASE_URL =
  process.env.NEXT_PUBLIC_BASESCAN_URL || 'https://sepolia.basescan.org';

export function BalanceCard({
  eth = 0,
  usdc = 0,
  address,
  network,
}: BalanceCardProps) {
  const [copied, setCopied] = useState(false);

  const truncatedAddress = address
    ? `${address.slice(0, 6)}...${address.slice(-4)}`
    : '';

  const handleCopy = async () => {
    if (!address) return;
    await navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="col-span-1 lg:col-span-2">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Tu Wallet</CardTitle>
        <Wallet className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {address && (
            <div className="flex items-center gap-2">
              <p className="text-xs text-muted-foreground">
                Dirección:{' '}
                <span className="font-mono">{truncatedAddress}</span>
              </p>
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5"
                onClick={handleCopy}
                title="Copiar dirección completa"
              >
                {copied ? (
                  <Check className="h-3 w-3 text-green-600" />
                ) : (
                  <Copy className="h-3 w-3" />
                )}
              </Button>
              <a
                href={`${EXPLORER_BASE_URL}/address/${address}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground"
                title="Ver en BaseScan"
              >
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          )}

          {network && (
            <p className="text-xs text-muted-foreground">
              Red:{' '}
              <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
                {network}
              </span>
            </p>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg bg-muted/50 p-4">
              <p className="text-sm text-muted-foreground">USDC</p>
              <p className="text-2xl font-bold">${usdc.toFixed(2)}</p>
            </div>
            <div className="rounded-lg bg-muted/50 p-4">
              <p className="text-sm text-muted-foreground">ETH (gas)</p>
              <p className="text-2xl font-bold">{eth.toFixed(6)}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
