-- Fix: Add bond_transactions to ledger sync trigger
-- Fix: Handle F&O trades inserted directly as CLOSED (not just OPEN→CLOSED updates)

-- 1. Update sync_investment_to_ledger to handle bond_transactions and direct CLOSED F&O inserts
CREATE OR REPLACE FUNCTION public.sync_investment_to_ledger()
RETURNS TRIGGER AS $$
DECLARE
    v_desc TEXT;
    v_type TEXT;
    v_amount DECIMAL(15,2);
    v_symbol TEXT;
BEGIN
    -- 1. Stock Transactions
    IF TG_TABLE_NAME = 'stock_transactions' THEN
        SELECT symbol INTO v_symbol FROM public.stocks WHERE id = NEW.stock_id;
        v_desc := NEW.transaction_type || ' Stock: ' || COALESCE(v_symbol, 'Unknown') || ' (' || NEW.quantity || ' shares)';
        v_type := CASE WHEN NEW.transaction_type = 'BUY' THEN 'Expense' ELSE 'Income' END;
        v_amount := NEW.total_amount + COALESCE(NEW.brokerage, 0) + COALESCE(NEW.taxes, 0);
        
    -- 2. Mutual Fund Transactions
    ELSIF TG_TABLE_NAME = 'mutual_fund_transactions' THEN
        SELECT name INTO v_symbol FROM public.mutual_funds WHERE id = NEW.mutual_fund_id;
        v_desc := NEW.transaction_type || ' MF: ' || COALESCE(v_symbol, 'Unknown') || ' (' || NEW.units || ' units)';
        v_type := CASE WHEN NEW.transaction_type IN ('BUY', 'SIP') THEN 'Expense' ELSE 'Income' END;
        v_amount := NEW.total_amount;

    -- 3. F&O Trades (handles both INSERT OPEN, INSERT CLOSED, and UPDATE OPEN→CLOSED)
    ELSIF TG_TABLE_NAME = 'fno_trades' THEN
        IF (TG_OP = 'INSERT' AND NEW.status = 'OPEN') THEN
            -- New open position: margin/investment deducted
            v_desc := 'FnO Entry: ' || NEW.instrument;
            v_type := 'Expense';
            v_amount := NEW.avg_price * NEW.quantity;
        ELSIF (TG_OP = 'INSERT' AND NEW.status = 'CLOSED') THEN
            -- Trade logged directly as closed (e.g. intraday already settled)
            -- Log 2 entries: the entry cost + the exit proceeds
            -- Entry
            INSERT INTO public.transactions (user_id, account_id, date, description, category, type, amount)
            VALUES (NEW.user_id, NEW.account_id, NEW.entry_date, 'FnO Entry: ' || NEW.instrument, 'Investments', 'Expense', NEW.avg_price * NEW.quantity);
            -- Exit
            v_desc := 'FnO Exit: ' || NEW.instrument;
            v_type := 'Income';
            v_amount := (NEW.avg_price * NEW.quantity) + COALESCE(NEW.pnl, 0);
        ELSIF (TG_OP = 'UPDATE' AND OLD.status = 'OPEN' AND NEW.status = 'CLOSED') THEN
            -- Closing an existing open position
            v_desc := 'FnO Exit: ' || NEW.instrument;
            v_type := 'Income';
            v_amount := (NEW.avg_price * NEW.quantity) + COALESCE(NEW.pnl, 0);
        ELSE
            RETURN NEW; -- Don't log for other updates (notes, etc)
        END IF;

    -- 4. Bond Transactions
    ELSIF TG_TABLE_NAME = 'bond_transactions' THEN
        SELECT name INTO v_symbol FROM public.bonds WHERE id = NEW.bond_id;
        v_desc := NEW.transaction_type || ' Bond: ' || COALESCE(v_symbol, 'Unknown');
        IF NEW.transaction_type = 'BUY' THEN
            v_type := 'Expense';
        ELSIF NEW.transaction_type IN ('SELL', 'MATURITY', 'INTEREST') THEN
            v_type := 'Income';
        ELSE
            v_type := 'Expense';
        END IF;
        v_amount := NEW.total_amount;
    END IF;

    -- 5. Always insert ledger entry (account_id can be NULL for ledger-only entries)
    INSERT INTO public.transactions (user_id, account_id, date, description, category, type, amount)
    VALUES (NEW.user_id, NEW.account_id, COALESCE(NEW.transaction_date, CURRENT_DATE), v_desc, 'Investments', v_type, v_amount);

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. Update account balance function to also handle bond_transactions
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
    ELSIF TG_TABLE_NAME = 'bond_transactions' THEN
        v_amount := NEW.total_amount;
        IF NEW.transaction_type = 'BUY' THEN v_amount := -v_amount; END IF;
        -- SELL, MATURITY, INTEREST all add to balance
    END IF;

    IF NEW.account_id IS NOT NULL THEN
        UPDATE public.accounts SET balance = balance + v_amount WHERE id = NEW.account_id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Add triggers for bond_transactions (ledger sync + account balance)
DROP TRIGGER IF EXISTS tr_sync_ledger_bonds ON public.bond_transactions;
CREATE TRIGGER tr_sync_ledger_bonds
AFTER INSERT ON public.bond_transactions
FOR EACH ROW EXECUTE FUNCTION public.sync_investment_to_ledger();

DROP TRIGGER IF EXISTS tr_update_balance_bonds ON public.bond_transactions;
CREATE TRIGGER tr_update_balance_bonds 
AFTER INSERT ON public.bond_transactions
FOR EACH ROW EXECUTE FUNCTION public.update_account_on_investment();

-- 4. Recreate existing triggers to use the updated function
DROP TRIGGER IF EXISTS tr_sync_ledger_stocks ON public.stock_transactions;
CREATE TRIGGER tr_sync_ledger_stocks
AFTER INSERT ON public.stock_transactions
FOR EACH ROW EXECUTE FUNCTION public.sync_investment_to_ledger();

DROP TRIGGER IF EXISTS tr_sync_ledger_mf ON public.mutual_fund_transactions;
CREATE TRIGGER tr_sync_ledger_mf
AFTER INSERT ON public.mutual_fund_transactions
FOR EACH ROW EXECUTE FUNCTION public.sync_investment_to_ledger();

DROP TRIGGER IF EXISTS tr_sync_ledger_fno ON public.fno_trades;
CREATE TRIGGER tr_sync_ledger_fno
AFTER INSERT OR UPDATE ON public.fno_trades
FOR EACH ROW EXECUTE FUNCTION public.sync_investment_to_ledger();
