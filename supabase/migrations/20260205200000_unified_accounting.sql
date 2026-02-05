-- Unified Accounting System: Linking Investments to Ledger
-- This ensures every investment buy/sell automatically creates a transaction record in the ledger.

CREATE OR REPLACE FUNCTION public.sync_investment_to_ledger()
RETURNS TRIGGER AS $$
DECLARE
    v_desc TEXT;
    v_type TEXT;
    v_amount DECIMAL(15,2);
    v_symbol TEXT;
BEGIN
    -- 1. Determine details based on table
    IF TG_TABLE_NAME = 'stock_transactions' THEN
        SELECT symbol INTO v_symbol FROM public.stocks WHERE id = NEW.stock_id;
        v_desc := NEW.transaction_type || ' Stock: ' || v_symbol || ' (' || NEW.quantity || ' shares)';
        v_type := CASE WHEN NEW.transaction_type = 'BUY' THEN 'Expense' ELSE 'Income' END;
        v_amount := NEW.total_amount + COALESCE(NEW.brokerage, 0) + COALESCE(NEW.taxes, 0);
        
    ELSIF TG_TABLE_NAME = 'mutual_fund_transactions' THEN
        SELECT name INTO v_symbol FROM public.mutual_funds WHERE id = NEW.mutual_fund_id;
        v_desc := NEW.transaction_type || ' MF: ' || v_symbol || ' (' || NEW.units || ' units)';
        v_type := CASE WHEN NEW.transaction_type IN ('BUY', 'SIP') THEN 'Expense' ELSE 'Income' END;
        v_amount := NEW.total_amount;

    ELSIF TG_TABLE_NAME = 'fno_trades' THEN
        v_desc := 'FnO Settlement: ' || NEW.instrument;
        -- For FnO, we handle this slightly differently since it's entry/exit
        -- If status changed to CLOSED, we log the result
        IF (TG_OP = 'INSERT' AND NEW.status = 'OPEN') THEN
            v_desc := 'FnO Entry: ' || NEW.instrument;
            v_type := 'Expense';
            v_amount := NEW.avg_price * NEW.quantity;
        ELSIF (TG_OP = 'UPDATE' AND OLD.status = 'OPEN' AND NEW.status = 'CLOSED') THEN
            v_desc := 'FnO Exit: ' || NEW.instrument;
            v_type := 'Income';
            v_amount := (NEW.avg_price * NEW.quantity) + COALESCE(NEW.pnl, 0);
        ELSE
            RETURN NEW; -- Don't log if just updating notes/etc
        END IF;
    END IF;

    -- 2. Insert into transactions table if account_id is present
    -- This will fire the tr_update_balance_transactions trigger automatically
    IF NEW.account_id IS NOT NULL THEN
        INSERT INTO public.transactions (user_id, account_id, date, description, category, type, amount)
        VALUES (NEW.user_id, NEW.account_id, COALESCE(NEW.transaction_date, CURRENT_DATE), v_desc, 'Investments', v_type, v_amount);
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Replace direct balance update triggers with ledger sync triggers
DROP TRIGGER IF EXISTS tr_update_balance_stocks ON public.stock_transactions;
CREATE TRIGGER tr_sync_ledger_stocks
AFTER INSERT ON public.stock_transactions
FOR EACH ROW EXECUTE FUNCTION public.sync_investment_to_ledger();

DROP TRIGGER IF EXISTS tr_update_balance_mf ON public.mutual_fund_transactions;
CREATE TRIGGER tr_sync_ledger_mf
AFTER INSERT ON public.mutual_fund_transactions
FOR EACH ROW EXECUTE FUNCTION public.sync_investment_to_ledger();

DROP TRIGGER IF EXISTS tr_update_balance_fno ON public.fno_trades;
CREATE TRIGGER tr_sync_ledger_fno
AFTER INSERT OR UPDATE ON public.fno_trades
FOR EACH ROW EXECUTE FUNCTION public.sync_investment_to_ledger();
