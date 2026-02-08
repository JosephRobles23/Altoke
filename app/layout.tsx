import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from 'sonner';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Altoke - Remesas rápidas con blockchain',
  description:
    'Plataforma de remesas USD → PEN utilizando Base (L2) y TransFi. Envía dinero de forma rápida, segura y económica.',
  keywords: ['remesas', 'blockchain', 'Base', 'USDC', 'transferencias', 'Perú', 'TransFi'],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={inter.className}>
        {children}
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
