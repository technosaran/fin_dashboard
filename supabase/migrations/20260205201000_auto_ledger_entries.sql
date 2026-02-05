-- Auto Ledger Entries: Remove account_id requirement for ledger logging
-- This ensures all investment transactions automatically create ledger entries

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

    -- 2. ALWAYS insert into transactions table to create ledger entry
    -- account_id is optional - can be NULL for ledger-only entries
    -- This will fire the tr_update_balance_transactions trigger automatically only if account_id is present
    INSERT INTO public.transactions (user_id, account_id, date, description, category, type, amount)
    VALUES (NEW.user_id, NEW.account_id, COALESCE(NEW.transaction_date, CURRENT_DATE), v_desc, 'Investments', v_type, v_amount);

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Note: Triggers already exist from previous migration, no need to recreate them
