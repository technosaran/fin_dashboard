-- Mega Fix for sync_investment_to_ledger Polymorphism
-- 20260218170500_fix_sync_ledger_polymorphism.sql

CREATE OR REPLACE FUNCTION public.sync_investment_to_ledger()
RETURNS TRIGGER AS $$
DECLARE
    v_desc TEXT;
    v_type TEXT;
    v_amount DECIMAL(15,2);
    v_symbol TEXT;
    v_date DATE;
    v_table TEXT := LOWER(TG_TABLE_NAME);
BEGIN
    -- 1. Resolve Date column safely based on table name
    IF v_table IN ('stock_transactions', 'mutual_fund_transactions', 'bond_transactions', 'forex_transactions') THEN
        v_date := NEW.transaction_date;
    ELSIF v_table IN ('family_transfers', 'dividends') THEN
        v_date := NEW.date;
    ELSIF v_table = 'fno_trades' THEN
        v_date := COALESCE(NEW.exit_date, NEW.entry_date)::DATE;
    ELSE
        v_date := CURRENT_DATE;
    END IF;

    -- 2. Determine details (Description, Type, Amount)
    IF v_table = 'stock_transactions' THEN
        SELECT symbol INTO v_symbol FROM public.stocks WHERE id = NEW.stock_id;
        v_desc := NEW.transaction_type || ' Stock: ' || COALESCE(v_symbol, 'Unknown') || ' (' || NEW.quantity || ' shares)';
        v_type := CASE WHEN NEW.transaction_type = 'BUY' THEN 'Expense' ELSE 'Income' END;
        v_amount := NEW.total_amount + COALESCE(NEW.brokerage, 0) + COALESCE(NEW.taxes, 0);
        
    ELSIF v_table = 'mutual_fund_transactions' THEN
        SELECT name INTO v_symbol FROM public.mutual_funds WHERE id = NEW.mutual_fund_id;
        v_desc := NEW.transaction_type || ' MF: ' || COALESCE(v_symbol, 'Unknown') || ' (' || NEW.units || ' units)';
        v_type := CASE WHEN NEW.transaction_type IN ('BUY', 'SIP') THEN 'Expense' ELSE 'Income' END;
        v_amount := NEW.total_amount;
 
    ELSIF v_table = 'fno_trades' THEN
        -- Special case for FnO: Entry vs Exit
        IF (TG_OP = 'INSERT' AND NEW.status = 'OPEN') THEN
            v_desc := 'FnO Entry: ' || NEW.instrument;
            v_type := 'Expense';
            v_amount := NEW.avg_price * NEW.quantity;
        ELSIF (TG_OP = 'INSERT' AND NEW.status = 'CLOSED') THEN
            -- Log Entry side immediately
            INSERT INTO public.transactions (user_id, account_id, date, description, category, type, amount)
            VALUES (NEW.user_id, NEW.account_id, (NEW.entry_date)::DATE, 'FnO Entry: ' || NEW.instrument, 'Investments', 'Expense', NEW.avg_price * NEW.quantity);
            -- Exit side (will be handled by the final insert below)
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

    ELSIF v_table = 'bond_transactions' THEN
        SELECT name INTO v_symbol FROM public.bonds WHERE id = NEW.bond_id;
        v_desc := NEW.transaction_type || ' Bond: ' || COALESCE(v_symbol, 'Unknown');
        v_type := CASE WHEN NEW.transaction_type = 'BUY' THEN 'Expense' ELSE 'Income' END;
        v_amount := NEW.total_amount;

    ELSIF v_table = 'forex_transactions' THEN
        v_desc := 'Forex ' || NEW.transaction_type || (CASE WHEN NEW.notes IS NOT NULL THEN ': ' || NEW.notes ELSE '' END);
        v_type := CASE WHEN NEW.transaction_type IN ('DEPOSIT', 'PROFIT') THEN 'Income' ELSE 'Expense' END;
        v_amount := NEW.amount;

    ELSIF v_table = 'family_transfers' THEN
        v_desc := 'Family Transfer: ' || NEW.recipient || ' (' || NEW.relationship || ')';
        v_type := 'Expense';
        v_amount := NEW.amount;

    ELSIF v_table = 'dividends' THEN
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

    -- 3. Always insert ledger entry
    INSERT INTO public.transactions (user_id, account_id, date, description, category, type, amount)
    VALUES (
        NEW.user_id, 
        NEW.account_id, 
        COALESCE(v_date, CURRENT_DATE), 
        v_desc, 
        CASE 
            WHEN v_table = 'family_transfers' THEN 'Family' 
            WHEN v_table = 'forex_transactions' THEN 'Forex'
            WHEN v_table = 'dividends' THEN 'Investment'
            ELSE 'Investments' 
        END, 
        v_type, 
        v_amount
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
