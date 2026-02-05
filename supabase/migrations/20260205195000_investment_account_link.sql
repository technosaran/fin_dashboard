-- Link Goals and Family Transfers to Accounts
ALTER TABLE public.family_transfers ADD COLUMN IF NOT EXISTS account_id BIGINT REFERENCES public.accounts(id);
ALTER TABLE public.goals ADD COLUMN IF NOT EXISTS account_id BIGINT REFERENCES public.accounts(id);

-- Add comments
COMMENT ON COLUMN public.family_transfers.account_id IS 'Source account for family support transfers';
COMMENT ON COLUMN public.goals.account_id IS 'Target account where savings for this goal are kept';

-- Create advanced triggers for Stock and Mutual Fund Transactions too
CREATE OR REPLACE FUNCTION public.update_account_on_investment()
RETURNS TRIGGER AS $$
DECLARE
    v_amount DECIMAL(15,2);
BEGIN
    IF TG_TABLE_NAME = 'stock_transactions' THEN
        v_amount := NEW.total_amount;
        IF NEW.transaction_type = 'BUY' THEN v_amount := -v_amount; END IF;
    ELSIF TG_TABLE_NAME = 'mutual_fund_transactions' THEN
        v_amount := NEW.total_amount;
        IF NEW.transaction_type IN ('BUY', 'SIP') THEN v_amount := -v_amount; END IF;
    END IF;

    IF NEW.account_id IS NOT NULL THEN
        UPDATE public.accounts SET balance = balance + v_amount WHERE id = NEW.account_id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_update_balance_stocks ON public.stock_transactions;
CREATE TRIGGER tr_update_balance_stocks 
AFTER INSERT ON public.stock_transactions
FOR EACH ROW EXECUTE FUNCTION public.update_account_on_investment();

DROP TRIGGER IF EXISTS tr_update_balance_mf ON public.mutual_fund_transactions;
CREATE TRIGGER tr_update_balance_mf 
AFTER INSERT ON public.mutual_fund_transactions
FOR EACH ROW EXECUTE FUNCTION public.update_account_on_investment();

-- Fixed Trigger for FnO
CREATE OR REPLACE FUNCTION public.update_account_on_fno()
RETURNS TRIGGER AS $$
DECLARE
    v_investment DECIMAL(15,2);
    v_proceeds DECIMAL(15,2);
BEGIN
    -- Entry: If newly created as OPEN
    IF (TG_OP = 'INSERT' AND NEW.status = 'OPEN') THEN
        v_investment := NEW.avg_price * NEW.quantity;
        IF NEW.account_id IS NOT NULL THEN
            UPDATE public.accounts SET balance = balance - v_investment WHERE id = NEW.account_id;
        END IF;
    END IF;

    -- Exit: If status changed to CLOSED
    IF (TG_OP = 'UPDATE' AND OLD.status = 'OPEN' AND NEW.status = 'CLOSED') THEN
        v_investment := NEW.avg_price * NEW.quantity;
        v_proceeds := v_investment + COALESCE(NEW.pnl, 0);
        IF NEW.account_id IS NOT NULL THEN
            UPDATE public.accounts SET balance = balance + v_proceeds WHERE id = NEW.account_id;
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_update_balance_fno ON public.fno_trades;
CREATE TRIGGER tr_update_balance_fno
AFTER INSERT OR UPDATE ON public.fno_trades
FOR EACH ROW
EXECUTE FUNCTION public.update_account_on_fno();
