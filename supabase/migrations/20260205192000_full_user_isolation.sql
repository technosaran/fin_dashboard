-- Migrate all tables to include user_id and enable RLS

-- 1. Accounts
ALTER TABLE public.accounts ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) DEFAULT auth.uid();
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can only see their own accounts" ON public.accounts;
CREATE POLICY "Users can only see their own accounts" ON public.accounts FOR ALL USING (auth.uid() = user_id);

-- 2. Transactions
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) DEFAULT auth.uid();
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can only see their own transactions" ON public.transactions;
CREATE POLICY "Users can only see their own transactions" ON public.transactions FOR ALL USING (auth.uid() = user_id);

-- 3. Goals
ALTER TABLE public.goals ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) DEFAULT auth.uid();
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can only see their own goals" ON public.goals;
CREATE POLICY "Users can only see their own goals" ON public.goals FOR ALL USING (auth.uid() = user_id);

-- 4. Family Transfers
ALTER TABLE public.family_transfers ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) DEFAULT auth.uid();
ALTER TABLE public.family_transfers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can only see their own family transfers" ON public.family_transfers;
CREATE POLICY "Users can only see their own family transfers" ON public.family_transfers FOR ALL USING (auth.uid() = user_id);

-- 5. Stocks
ALTER TABLE public.stocks ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) DEFAULT auth.uid();
ALTER TABLE public.stocks ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can only see their own stocks" ON public.stocks;
CREATE POLICY "Users can only see their own stocks" ON public.stocks FOR ALL USING (auth.uid() = user_id);

-- 6. Stock Transactions
ALTER TABLE public.stock_transactions ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) DEFAULT auth.uid();
ALTER TABLE public.stock_transactions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can only see their own stock transactions" ON public.stock_transactions;
CREATE POLICY "Users can only see their own stock transactions" ON public.stock_transactions FOR ALL USING (auth.uid() = user_id);

-- 7. Watchlist
ALTER TABLE public.watchlist ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) DEFAULT auth.uid();
ALTER TABLE public.watchlist ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can only see their own watchlist" ON public.watchlist;
CREATE POLICY "Users can only see their own watchlist" ON public.watchlist FOR ALL USING (auth.uid() = user_id);

-- 8. Mutual Funds
ALTER TABLE public.mutual_funds ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) DEFAULT auth.uid();
ALTER TABLE public.mutual_funds ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can only see their own mutual funds" ON public.mutual_funds;
CREATE POLICY "Users can only see their own mutual funds" ON public.mutual_funds FOR ALL USING (auth.uid() = user_id);

-- 9. Mutual Fund Transactions
ALTER TABLE public.mutual_fund_transactions ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) DEFAULT auth.uid();
ALTER TABLE public.mutual_fund_transactions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can only see their own mutual fund transactions" ON public.mutual_fund_transactions;
CREATE POLICY "Users can only see their own mutual fund transactions" ON public.mutual_fund_transactions FOR ALL USING (auth.uid() = user_id);

-- 10. FnO Trades (Create table if not exists and add user_id)
CREATE TABLE IF NOT EXISTS public.fno_trades (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) DEFAULT auth.uid(),
    instrument TEXT NOT NULL,
    trade_type TEXT NOT NULL CHECK (trade_type IN ('BUY', 'SELL')),
    product TEXT NOT NULL CHECK (product IN ('NRML', 'MIS')),
    quantity INTEGER NOT NULL,
    avg_price DECIMAL(15,2) NOT NULL,
    exit_price DECIMAL(15,2),
    entry_date TIMESTAMP WITH TIME ZONE NOT NULL,
    exit_date TIMESTAMP WITH TIME ZONE,
    status TEXT NOT NULL CHECK (status IN ('OPEN', 'CLOSED')),
    pnl DECIMAL(15,2) DEFAULT 0,
    notes TEXT,
    account_id BIGINT REFERENCES public.accounts(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE public.fno_trades ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can only see their own fno trades" ON public.fno_trades;
CREATE POLICY "Users can only see their own fno trades" ON public.fno_trades FOR ALL USING (auth.uid() = user_id);
