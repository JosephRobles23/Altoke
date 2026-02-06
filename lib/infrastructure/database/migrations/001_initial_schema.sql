-- ============================================
-- ALTOKE MVP - Migración inicial
-- ============================================

-- PROFILES TABLE
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone TEXT,
  country TEXT NOT NULL DEFAULT 'PE',
  kyc_status TEXT NOT NULL DEFAULT 'pending' CHECK (kyc_status IN ('pending', 'in_review', 'approved', 'rejected')),
  kyc_level INTEGER NOT NULL DEFAULT 0 CHECK (kyc_level BETWEEN 0 AND 3),
  kyc_data JSONB,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- WALLETS TABLE
CREATE TABLE public.wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  account_id TEXT NOT NULL UNIQUE,
  public_key TEXT NOT NULL,
  private_key_encrypted TEXT NOT NULL,
  balance_hbar NUMERIC(20, 8) NOT NULL DEFAULT 0,
  balance_usdc NUMERIC(20, 8) NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  network TEXT NOT NULL DEFAULT 'testnet' CHECK (network IN ('testnet', 'mainnet')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT one_wallet_per_user UNIQUE (user_id, network)
);

-- TRANSACTIONS TABLE
CREATE TABLE public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_user_id UUID NOT NULL REFERENCES public.profiles(id),
  to_user_id UUID REFERENCES public.profiles(id),
  to_account_id TEXT,
  type TEXT NOT NULL CHECK (type IN ('send', 'receive', 'buy', 'sell')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
  
  -- Amounts
  amount_usdc NUMERIC(20, 8) NOT NULL,
  amount_pen NUMERIC(20, 2),
  exchange_rate NUMERIC(10, 4),
  fee_usdc NUMERIC(20, 8) NOT NULL DEFAULT 0,
  fee_platform NUMERIC(20, 8) NOT NULL DEFAULT 0,
  
  -- Blockchain data
  hedera_tx_id TEXT UNIQUE,
  hedera_tx_hash TEXT,
  consensus_timestamp TEXT,
  
  -- Metadata
  description TEXT,
  metadata JSONB,
  error_message TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_amount CHECK (amount_usdc > 0),
  CONSTRAINT valid_to CHECK (
    (to_user_id IS NOT NULL AND to_account_id IS NULL) OR
    (to_user_id IS NULL AND to_account_id IS NOT NULL)
  )
);

-- ONRAMP_TRANSACTIONS TABLE
CREATE TABLE public.onramp_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id),
  provider TEXT NOT NULL CHECK (provider IN ('transak', 'ramp', 'moonpay')),
  provider_order_id TEXT UNIQUE NOT NULL,
  
  -- Amounts
  fiat_amount NUMERIC(20, 2) NOT NULL,
  fiat_currency TEXT NOT NULL,
  crypto_amount NUMERIC(20, 8),
  crypto_currency TEXT NOT NULL DEFAULT 'USDC',
  
  -- Status
  status TEXT NOT NULL DEFAULT 'initiated' CHECK (status IN (
    'initiated', 'pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded'
  )),
  
  -- Provider data
  provider_status TEXT,
  provider_data JSONB,
  webhook_data JSONB,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- EXCHANGE_RATES TABLE (Cache)
CREATE TABLE public.exchange_rates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_currency TEXT NOT NULL,
  to_currency TEXT NOT NULL,
  rate NUMERIC(10, 4) NOT NULL,
  provider TEXT NOT NULL,
  valid_until TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT unique_rate UNIQUE (from_currency, to_currency, provider)
);

-- NOTIFICATIONS TABLE
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id),
  type TEXT NOT NULL CHECK (type IN ('transaction', 'kyc', 'security', 'marketing')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX idx_wallets_user_id ON public.wallets(user_id);
CREATE INDEX idx_wallets_account_id ON public.wallets(account_id);
CREATE INDEX idx_transactions_from_user ON public.transactions(from_user_id);
CREATE INDEX idx_transactions_to_user ON public.transactions(to_user_id);
CREATE INDEX idx_transactions_status ON public.transactions(status);
CREATE INDEX idx_transactions_created_at ON public.transactions(created_at DESC);
CREATE INDEX idx_transactions_hedera_tx_id ON public.transactions(hedera_tx_id);
CREATE INDEX idx_onramp_user_id ON public.onramp_transactions(user_id);
CREATE INDEX idx_onramp_status ON public.onramp_transactions(status);
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id, is_read);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.onramp_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Profiles: usuarios solo pueden ver/editar su propio perfil
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Wallets: usuarios solo pueden ver su propio wallet
CREATE POLICY "Users can view own wallet"
  ON public.wallets FOR SELECT
  USING (auth.uid() = user_id);

-- Transactions: usuarios pueden ver transacciones donde participan
CREATE POLICY "Users can view own transactions"
  ON public.transactions FOR SELECT
  USING (auth.uid() = from_user_id OR auth.uid() = to_user_id);

CREATE POLICY "Users can create transactions"
  ON public.transactions FOR INSERT
  WITH CHECK (auth.uid() = from_user_id);

-- Onramp transactions
CREATE POLICY "Users can view own onramp transactions"
  ON public.onramp_transactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create onramp transactions"
  ON public.onramp_transactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Notifications
CREATE POLICY "Users can view own notifications"
  ON public.notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
  ON public.notifications FOR UPDATE
  USING (auth.uid() = user_id);

-- ============================================
-- TRIGGERS
-- ============================================

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_wallets_updated_at BEFORE UPDATE ON public.wallets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON public.transactions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_onramp_updated_at BEFORE UPDATE ON public.onramp_transactions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
