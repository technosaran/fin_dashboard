-- Final Backend Power-up: Advanced Logic, Triggers, and Missing Hubs

-- 1. Recurring Transactions Table (SIPs, Salary, Rent)
CREATE TABLE IF NOT EXISTS public.recurring_schedules (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) DEFAULT auth.uid(),
    name TEXT NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('Income', 'Expense')),
    category TEXT NOT NULL,
    frequency TEXT NOT NULL CHECK (frequency IN ('Daily', 'Weekly', 'Monthly', 'Quarterly', 'Yearly')),
    start_date DATE NOT NULL,
    next_date DATE NOT NULL,
    end_date DATE,
    account_id BIGINT REFERENCES public.accounts(id),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE public.recurring_schedules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own recurring schedules" ON public.recurring_schedules FOR ALL USING (auth.uid() = user_id);

-- 2. Dividends & Corporate Actions Hub
CREATE TABLE IF NOT EXISTS public.dividends (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) DEFAULT auth.uid(),
    stock_id BIGINT REFERENCES public.stocks(id) ON DELETE SET NULL,
    mf_id BIGINT REFERENCES public.mutual_funds(id) ON DELETE SET NULL,
    amount DECIMAL(15,2) NOT NULL,
    date DATE NOT NULL,
    account_id BIGINT REFERENCES public.accounts(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE public.dividends ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own dividends" ON public.dividends FOR ALL USING (auth.uid() = user_id);

-- 3. Portfolio Snapshots (Daily Net Worth Tracking)
CREATE TABLE IF NOT EXISTS public.portfolio_snapshots (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) DEFAULT auth.uid(),
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    total_net_worth DECIMAL(15,2) NOT NULL,
    cash_value DECIMAL(15,2) NOT NULL,
    stock_value DECIMAL(15,2) NOT NULL,
    mf_value DECIMAL(15,2) NOT NULL,
    fno_margin DECIMAL(15,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, date)
);
ALTER TABLE public.portfolio_snapshots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can see their own snapshots" ON public.portfolio_snapshots FOR SELECT USING (auth.uid() = user_id);

-- 4. Advanced Database Trigger: Automatic Account Balance Sync
-- This makes the DB the ultimate source of truth for balances

CREATE OR REPLACE FUNCTION public.update_account_balance_on_transaction()
RETURNS TRIGGER AS $$
DECLARE
    delta DECIMAL(15,2);
BEGIN
    -- Determine the change in balance
    IF TG_OP = 'INSERT' THEN
        delta := CASE WHEN NEW.type = 'Income' THEN NEW.amount ELSE -NEW.amount END;
    ELSIF TG_OP = 'UPDATE' THEN
        -- Subtract old amount and add new amount
        delta := (CASE WHEN NEW.type = 'Income' THEN NEW.amount ELSE -NEW.amount END) - 
                 (CASE WHEN OLD.type = 'Income' THEN OLD.amount ELSE -OLD.amount END);
    ELSIF TG_OP = 'DELETE' THEN
        delta := CASE WHEN OLD.type = 'Income' THEN -OLD.amount ELSE OLD.amount END;
    END IF;

    -- Update the account if account_id is present
    IF (TG_OP = 'INSERT' OR TG_OP = 'UPDATE') AND NEW.account_id IS NOT NULL THEN
        UPDATE public.accounts SET balance = balance + delta WHERE id = NEW.account_id;
    ELSIF TG_OP = 'DELETE' AND OLD.account_id IS NOT NULL THEN
        UPDATE public.accounts SET balance = balance + delta WHERE id = OLD.account_id;
    END IF;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger for Transactions
DROP TRIGGER IF EXISTS tr_update_balance_transactions ON public.transactions;
CREATE TRIGGER tr_update_balance_transactions 
AFTER INSERT OR UPDATE OR DELETE ON public.transactions
FOR EACH ROW EXECUTE FUNCTION public.update_account_balance_on_transaction();

-- 5. Helper Function to populate initial snapshots (Can be called by API)
CREATE OR REPLACE FUNCTION public.capture_daily_snapshot(target_user_id UUID)
RETURNS void AS $$
DECLARE
    v_cash DECIMAL(15,2);
    v_stocks DECIMAL(15,2);
    v_mfs DECIMAL(15,2);
BEGIN
    SELECT COALESCE(SUM(balance), 0) INTO v_cash FROM public.accounts WHERE user_id = target_user_id;
    SELECT COALESCE(SUM(current_value), 0) INTO v_stocks FROM public.stocks WHERE user_id = target_user_id;
    SELECT COALESCE(SUM(current_value), 0) INTO v_mfs FROM public.mutual_funds WHERE user_id = target_user_id;

    INSERT INTO public.portfolio_snapshots (user_id, date, total_net_worth, cash_value, stock_value, mf_value)
    VALUES (target_user_id, CURRENT_DATE, v_cash + v_stocks + v_mfs, v_cash, v_stocks, v_mfs)
    ON CONFLICT (user_id, date) DO UPDATE SET
        total_net_worth = EXCLUDED.total_net_worth,
        cash_value = EXCLUDED.cash_value,
        stock_value = EXCLUDED.stock_value,
        mf_value = EXCLUDED.mf_value;
END;
$$ LANGUAGE plpgsql;
