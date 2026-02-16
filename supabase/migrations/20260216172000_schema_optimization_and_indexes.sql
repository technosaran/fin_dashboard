-- Database Schema Optimization and Performance Indexing
-- 20260216172000_schema_optimization_and_indexes.sql

-- 1. ADVICE: Performance Indexing for RLS (CRITICAL)
-- Adding indexes on user_id for all tables to ensure RLS policies don't perform full table scans.

CREATE INDEX IF NOT EXISTS idx_accounts_user_id ON public.accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_goals_user_id ON public.goals(user_id);
CREATE INDEX IF NOT EXISTS idx_family_transfers_user_id ON public.family_transfers(user_id);
CREATE INDEX IF NOT EXISTS idx_stocks_user_id ON public.stocks(user_id);
CREATE INDEX IF NOT EXISTS idx_stock_transactions_user_id ON public.stock_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_watchlist_user_id ON public.watchlist(user_id);
CREATE INDEX IF NOT EXISTS idx_mutual_funds_user_id ON public.mutual_funds(user_id);
CREATE INDEX IF NOT EXISTS idx_mutual_fund_transactions_user_id ON public.mutual_fund_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_fno_trades_user_id ON public.fno_trades(user_id);
CREATE INDEX IF NOT EXISTS idx_bonds_user_id ON public.bonds(user_id);
CREATE INDEX IF NOT EXISTS idx_bond_transactions_user_id ON public.bond_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_forex_transactions_user_id ON public.forex_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_recurring_schedules_user_id ON public.recurring_schedules(user_id);
CREATE INDEX IF NOT EXISTS idx_dividends_user_id ON public.dividends(user_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_snapshots_user_id ON public.portfolio_snapshots(user_id);

-- 2. Performance & Data Integrity
-- Adding indexes for commonly queried patterns.

CREATE INDEX IF NOT EXISTS idx_stocks_user_symbol ON public.stocks(user_id, symbol);
CREATE INDEX IF NOT EXISTS idx_mutual_funds_user_scheme ON public.mutual_funds(user_id, scheme_code);
CREATE INDEX IF NOT EXISTS idx_watchlist_user_symbol ON public.watchlist(user_id, symbol);

-- 3. Schema Enhancement: Extensibility
-- Add JSONB metadata to core tables for future-proofing without schema changes.

ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;
ALTER TABLE public.accounts ADD COLUMN IF NOT EXISTS provider_info JSONB DEFAULT '{}'::jsonb;
ALTER TABLE public.stocks ADD COLUMN IF NOT EXISTS tags TEXT[];
ALTER TABLE public.mutual_funds ADD COLUMN IF NOT EXISTS tags TEXT[];

-- 4. Financial Optimization: User Net Worth View
-- A unified view to get current portfolio value for a user.

CREATE OR REPLACE VIEW public.user_net_worth_overview AS
SELECT 
    u.id AS user_id,
    COALESCE(a.cash_balance, 0) AS total_cash,
    COALESCE(s.stock_value, 0) AS total_stocks,
    COALESCE(m.mf_value, 0) AS total_mfs,
    COALESCE(b.bond_value, 0) AS total_bonds,
    (COALESCE(a.cash_balance, 0) + COALESCE(s.stock_value, 0) + COALESCE(m.mf_value, 0) + COALESCE(b.bond_value, 0)) AS net_worth
FROM auth.users u
LEFT JOIN (
    SELECT user_id, SUM(balance) AS cash_balance 
    FROM public.accounts GROUP BY user_id
) a ON a.user_id = u.id
LEFT JOIN (
    SELECT user_id, SUM(current_value) AS stock_value 
    FROM public.stocks GROUP BY user_id
) s ON s.user_id = u.id
LEFT JOIN (
    SELECT user_id, SUM(current_value) AS mf_value 
    FROM public.mutual_funds GROUP BY user_id
) m ON m.user_id = u.id
LEFT JOIN (
    SELECT user_id, SUM(current_value) AS bond_value 
    FROM public.bonds GROUP BY user_id
) b ON b.user_id = u.id;

-- 5. Trigger for updated_at consistency
-- Ensure all tables use the update_updated_at_column function.

DO $$
DECLARE
    t text;
BEGIN
    FOR t IN 
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_type = 'BASE TABLE'
    LOOP
        -- Check if column exists
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = t AND column_name = 'updated_at') THEN
            EXECUTE format('DROP TRIGGER IF EXISTS tr_update_%I_updated_at ON public.%I', t, t);
            EXECUTE format('CREATE TRIGGER tr_update_%I_updated_at BEFORE UPDATE ON public.%I FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()', t, t);
        END IF;
    END LOOP;
END $$;
