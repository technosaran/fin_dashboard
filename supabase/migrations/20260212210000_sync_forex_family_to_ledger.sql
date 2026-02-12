-- Migration to sync Forex transactions and Family transfers to the ledger
-- 20260212210000_sync_forex_family_to_ledger.sql

-- 1. Update sync_investment_to_ledger to handle forex and family transfers
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

    -- 3. F&O Trades
    ELSIF TG_TABLE_NAME = 'fno_trades' THEN
        IF (TG_OP = 'INSERT' AND NEW.status = 'OPEN') THEN
            v_desc := 'FnO Entry: ' || NEW.instrument;
            v_type := 'Expense';
            v_amount := NEW.avg_price * NEW.quantity;
        ELSIF (TG_OP = 'INSERT' AND NEW.status = 'CLOSED') THEN
            INSERT INTO public.transactions (user_id, account_id, date, description, category, type, amount)
            VALUES (NEW.user_id, NEW.account_id, NEW.entry_date, 'FnO Entry: ' || NEW.instrument, 'Investments', 'Expense', NEW.avg_price * NEW.quantity);
            v_desc := 'FnO Exit: ' || NEW.instrument;
            v_type := 'Income';
            v_amount := (NEW.avg_price * NEW.quantity) + COALESCE(NEW.pnl, 0);
        ELSIF (TG_OP = 'UPDATE' AND OLD.status = 'OPEN' AND NEW.status = 'CLOSED') THEN
            v_desc := 'FnO Exit: ' || NEW.instrument;
            v_type := 'Income';
            v_amount := (NEW.avg_price * NEW.quantity) + COALESCE(NEW.pnl, 0);
        ELSE
            RETURN NEW;
        END IF;

    -- 4. Bond Transactions
    ELSIF TG_TABLE_NAME = 'bond_transactions' THEN
        SELECT name INTO v_symbol FROM public.bonds WHERE id = NEW.bond_id;
        v_desc := NEW.transaction_type || ' Bond: ' || COALESCE(v_symbol, 'Unknown');
        v_type := CASE WHEN NEW.transaction_type = 'BUY' THEN 'Expense' ELSE 'Income' END;
        v_amount := NEW.total_amount;

    -- 5. Forex Transactions (NEW)
    ELSIF TG_TABLE_NAME = 'forex_transactions' THEN
        v_desc := 'Forex ' || NEW.transaction_type || (CASE WHEN NEW.notes IS NOT NULL THEN ': ' || NEW.notes ELSE '' END);
        v_type := CASE WHEN NEW.transaction_type IN ('DEPOSIT', 'PROFIT') THEN 'Income' ELSE 'Expense' END;
        v_amount := NEW.amount;

    -- 6. Family Transfers (NEW)
    ELSIF TG_TABLE_NAME = 'family_transfers' THEN
        v_desc := 'Family Transfer: ' || NEW.recipient || ' (' || NEW.relationship || ')';
        v_type := 'Expense';
        v_amount := NEW.amount;

    -- 7. Dividends (NEW)
    ELSIF TG_TABLE_NAME = 'dividends' THEN
        IF NEW.stock_id IS NOT NULL THEN
            SELECT symbol INTO v_symbol FROM public.stocks WHERE id = NEW.stock_id;
            v_desc := 'Stock Dividend: ' || v_symbol;
        ELSIF NEW.mf_id IS NOT NULL THEN
            SELECT name INTO v_symbol FROM public.mutual_funds WHERE id = NEW.mf_id;
            v_desc := 'MF Dividend: ' || v_symbol;
        ELSE
            v_desc := 'Dividend Payment';
        END IF;
        v_type := 'Income';
        v_amount := NEW.amount;
    END IF;

    -- Always insert ledger entry
    INSERT INTO public.transactions (user_id, account_id, date, description, category, type, amount)
    VALUES (
        NEW.user_id, 
        NEW.account_id, 
        COALESCE(NEW.transaction_date, NEW.date, CURRENT_DATE), 
        v_desc, 
        CASE 
            WHEN TG_TABLE_NAME = 'family_transfers' THEN 'Family' 
            WHEN TG_TABLE_NAME = 'forex_transactions' THEN 'Forex'
            WHEN TG_TABLE_NAME = 'dividends' THEN 'Investment'
            ELSE 'Investments' 
        END, 
        v_type, 
        v_amount
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. Add triggers for forex_transactions
DROP TRIGGER IF EXISTS tr_sync_ledger_forex ON public.forex_transactions;
CREATE TRIGGER tr_sync_ledger_forex
AFTER INSERT ON public.forex_transactions
FOR EACH ROW EXECUTE FUNCTION public.sync_investment_to_ledger();

-- 3. Add triggers for family_transfers
DROP TRIGGER IF EXISTS tr_sync_ledger_family ON public.family_transfers;
CREATE TRIGGER tr_sync_ledger_family
AFTER INSERT ON public.family_transfers
FOR EACH ROW EXECUTE FUNCTION public.sync_investment_to_ledger();

-- 4. Add triggers for dividends
DROP TRIGGER IF EXISTS tr_sync_ledger_dividends ON public.dividends;
CREATE TRIGGER tr_sync_ledger_dividends
AFTER INSERT ON public.dividends
FOR EACH ROW EXECUTE FUNCTION public.sync_investment_to_ledger();
