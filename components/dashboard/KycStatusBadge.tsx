'use client';

import Link from 'next/link';
import { Shield, ShieldAlert, ShieldCheck, ChevronRight } from 'lucide-react';
import { KYC_LEVELS } from '@/lib/shared/constants';

interface KycStatusBadgeProps {
  kycStatus: 'pending' | 'in_review' | 'approved' | 'rejected';
  kycLevel: number;
}

const statusConfig = {
  pending: {
    icon: ShieldAlert,
    colorClass: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    iconColor: 'text-yellow-500',
    label: 'Sin verificar',
  },
  in_review: {
    icon: Shield,
    colorClass: 'bg-blue-50 border-blue-200 text-blue-800',
    iconColor: 'text-blue-500',
    label: 'En revisión',
  },
  approved: {
    icon: ShieldCheck,
    colorClass: 'bg-green-50 border-green-200 text-green-800',
    iconColor: 'text-green-500',
    label: 'Verificado',
  },
  rejected: {
    icon: ShieldAlert,
    colorClass: 'bg-red-50 border-red-200 text-red-800',
    iconColor: 'text-red-500',
    label: 'Rechazado',
  },
} as const;

export function KycStatusBadge({ kycStatus, kycLevel }: KycStatusBadgeProps) {
  const config = statusConfig[kycStatus];
  const Icon = config.icon;
  const levelInfo = KYC_LEVELS[kycLevel as keyof typeof KYC_LEVELS];

  // Si no está verificado, mostrar CTA para verificarse
  if (kycStatus === 'pending' && kycLevel === 0) {
    return (
      <div className={`rounded-lg border p-4 ${config.colorClass}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Icon className={`h-5 w-5 ${config.iconColor}`} />
            <div>
              <p className="font-medium">Identidad no verificada</p>
              <p className="text-sm opacity-80">
                Verifica tu identidad comprando USDC para poder enviar remesas.
              </p>
            </div>
          </div>
          <Link
            href="/buy"
            className="flex items-center gap-1 rounded-md bg-yellow-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-yellow-700"
          >
            Verificar
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    );
  }

  // Badge compacto para usuarios verificados o en otros estados
  return (
    <div className={`rounded-lg border p-4 ${config.colorClass}`}>
      <div className="flex items-center gap-3">
        <Icon className={`h-5 w-5 ${config.iconColor}`} />
        <div>
          <div className="flex items-center gap-2">
            <p className="font-medium">{config.label}</p>
            {kycStatus === 'approved' && (
              <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                Nivel {kycLevel}
              </span>
            )}
          </div>
          <p className="text-sm opacity-80">
            {kycStatus === 'approved'
              ? `${levelInfo?.label || 'Verificado'} — Transferencias hasta $${levelInfo?.maxTransfer?.toLocaleString() || '0'} USD`
              : kycStatus === 'in_review'
                ? 'Tu verificación está siendo procesada.'
                : 'Tu verificación fue rechazada. Contacta soporte.'}
          </p>
        </div>
      </div>
    </div>
  );
}
