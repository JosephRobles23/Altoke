# Altoke — Plataforma de Remesas USD → PEN en Base (Coinbase L2)

Plataforma de remesas que permite transferencias USD a PEN utilizando **Base** (L2 de Coinbase) como capa de liquidación con USDC, **Coinbase CDP** como on/off-ramp con 0% de comisión, Next.js 14+ como frontend, y Supabase como backend.

## Stack Tecnológico

- **Frontend:** Next.js 14+ (App Router, Server Actions, TypeScript)
- **Backend:** Supabase (PostgreSQL, Auth, Edge Functions, Storage)
- **Blockchain:** Base (Coinbase L2 — EVM compatible)
- **On/Off-Ramp:** Coinbase Developer Platform (CDP) — Widget embebido, 0% fee USDC
- **Wallet SDK:** viem + @coinbase/onchainkit
- **Styling:** Tailwind CSS + shadcn/ui
- **Estado:** Zustand (opcional)
- **Validación:** Zod
- **Testing:** Vitest + Playwright

## Requisitos Previos

- Node.js 20+
- npm o pnpm
- Cuenta en [Supabase](https://supabase.com)
- Cuenta en [Coinbase Developer Platform](https://portal.cdp.coinbase.com) (para On/Off-Ramp)
- ETH en Base Sepolia para gas ([Faucet](https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet))

## Instalación

1. **Clonar el repositorio:**
   ```bash
   git clone <repo-url>
   cd Altoke-mvp
   ```

2. **Instalar dependencias:**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno:**
   ```bash
   cp .env.local.example .env.local
   ```
   Edita `.env.local` con tus credenciales de Supabase, Coinbase CDP y demás.

4. **Configurar base de datos:**
   Ejecuta la migración SQL en tu proyecto de Supabase:
   ```
   lib/infrastructure/database/migrations/001_initial_schema.sql
   ```

5. **Iniciar el servidor de desarrollo:**
   ```bash
   npm run dev
   ```

6. **Abrir en el navegador:**
   [http://localhost:3000](http://localhost:3000)

## Scripts Disponibles

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Inicia el servidor de desarrollo |
| `npm run build` | Construye la aplicación para producción |
| `npm run start` | Inicia el servidor de producción |
| `npm run lint` | Ejecuta ESLint |
| `npm run format` | Formatea el código con Prettier |
| `npm run type-check` | Verifica tipos TypeScript |
| `npm run test` | Ejecuta tests unitarios con Vitest |
| `npm run test:ui` | Ejecuta tests con interfaz visual |
| `npm run test:coverage` | Ejecuta tests con reporte de cobertura |
| `npm run test:e2e` | Ejecuta tests E2E con Playwright |

## Estructura del Proyecto

```
Altoke-mvp/
├── app/                    # Next.js App Router
│   ├── (auth)/             # Rutas de autenticación
│   ├── (dashboard)/        # Rutas protegidas (dashboard)
│   ├── actions/            # Server Actions
│   └── api/                # API Routes (webhooks Coinbase)
├── components/             # Componentes UI
│   ├── ui/                 # shadcn/ui base components
│   ├── auth/               # Componentes de autenticación
│   ├── dashboard/          # Componentes del dashboard
│   ├── onramp/             # Widgets Coinbase CDP (On/Off-Ramp)
│   ├── layout/             # Header, Sidebar, Footer
│   └── shared/             # Componentes compartidos
├── lib/                    # Lógica de negocio
│   ├── domain/             # Domain Layer (entidades, value objects)
│   ├── application/        # Application Layer (use cases, servicios)
│   ├── infrastructure/     # Infrastructure Layer (DB, Base/viem, Coinbase CDP)
│   ├── shared/             # Código compartido (errores, tipos, utils)
│   └── config/             # Configuración y variables de entorno
├── hooks/                  # Custom React Hooks
├── __tests__/              # Tests (unit, integration, e2e)
└── middleware.ts           # Next.js Middleware
```

## Arquitectura

El proyecto sigue principios de **Clean Architecture** y **SOLID**:

- **Domain Layer:** Entidades, Value Objects, Interfaces de Repositorio
- **Application Layer:** Use Cases, Servicios de Aplicación
- **Infrastructure Layer:** Implementaciones concretas (Supabase, Base/viem, Coinbase CDP)
- **Presentation Layer:** Pages, Components, Server Actions

## Flujo de Remesa

```
1. Remitente compra USDC con tarjeta (Coinbase CDP — 0% fee)
2. USDC se transfiere por red Base al destinatario (~$0.001 gas)
3. Destinatario vende USDC por USD (Coinbase CDP — 0% fee)
4. Calculadora muestra equivalente USD → PEN en tiempo real
```

## Seguridad

- Private keys encriptados con AES-256-GCM
- Row Level Security (RLS) en todas las tablas de Supabase
- Validación de input con Zod
- Rate limiting implementado
- Variables sensibles en `.env.local`
- KYC gestionado por Coinbase (no almacenamos datos sensibles de pago)

## Testing

```bash
# Tests unitarios
npm run test

# Tests con cobertura
npm run test:coverage

# Tests E2E
npm run test:e2e
```

## Deployment

El proyecto está configurado para deploy automático en Vercel a través de GitHub Actions.

1. Configura las variables de entorno en Vercel
2. Conecta el repositorio a Vercel
3. Los pushes a `main` despliegan a producción automáticamente

## Links Útiles

- [Base Documentation](https://docs.base.org)
- [Coinbase CDP Docs](https://docs.cdp.coinbase.com)
- [BaseScan Explorer](https://basescan.org)
- [Base Sepolia Faucet](https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet)
- [viem Documentation](https://viem.sh)

## Licencia

Proyecto privado — Todos los derechos reservados.
