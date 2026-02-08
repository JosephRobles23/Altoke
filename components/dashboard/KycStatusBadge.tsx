'use client';

import { useState } from 'react';
import { Shield, ShieldAlert, ShieldCheck, ChevronRight, Loader2 } from 'lucide-react';
import { KYC_LEVELS } from '@/lib/shared/constants';
import { initiateTransFiKYC } from '@/app/actions/onramp';

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

/**
 * Badge de estado KYC integrado con TransFi.
 *
 * Cuando el usuario no está verificado, permite iniciar el flujo de KYC
 * directamente con TransFi (via Sumsub), que abre en una nueva ventana.
 *
 * Niveles KYC de TransFi:
 * - Nivel 0 (Basic): Datos básicos (nombre, DOB, país, email, teléfono)
 * - Nivel 1 (Standard): ID, selfie, dirección, teléfono
 * - Nivel 2 (Enhanced): Prueba de origen de fondos, dirección
 */
export function KycStatusBadge({ kycStatus, kycLevel }: KycStatusBadgeProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const config = statusConfig[kycStatus];
  const Icon = config.icon;
  const levelInfo = KYC_LEVELS[kycLevel as keyof typeof KYC_LEVELS];

  const handleStartKYC = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await initiateTransFiKYC();

      if (!result.success) {
        setError(result.error || 'Error al iniciar verificación');
        return;
      }

      const kycUrl = result.data?.kycUrl as string;
      if (kycUrl) {
        // Abrir el widget de KYC de TransFi en nueva ventana
        const popup = window.open(
          kycUrl,
          'transfi-kyc',
          'width=500,height=750,menubar=no,toolbar=no'
        );
        if (!popup) {
          window.open(kycUrl, '_blank');
        }
      }
    } catch {
      setError('Error inesperado. Intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  // Si no está verificado, mostrar CTA para verificarse con TransFi KYC
  if (kycStatus === 'pending' && kycLevel === 0) {
    return (
      <div className={`rounded-lg border p-4 ${config.colorClass}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Icon className={`h-5 w-5 ${config.iconColor}`} />
            <div>
              <p className="font-medium">Identidad no verificada</p>
              <p className="text-sm opacity-80">
                Completa tu verificación para poder comprar, vender y enviar USDC.
              </p>
            </div>
          </div>
          <button
            onClick={handleStartKYC}
            disabled={isLoading}
            className="flex items-center gap-1 rounded-md bg-yellow-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-yellow-700 disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                Verificar KYC
                <ChevronRight className="h-4 w-4" />
              </>
            )}
          </button>
        </div>
        {error && (
          <p className="mt-2 text-sm text-red-600">{error}</p>
        )}
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
                ? 'Tu verificación con TransFi está siendo procesada.'
                : 'Tu verificación fue rechazada. Contacta soporte.'}
          </p>
        </div>
      </div>
    </div>
  );
}
