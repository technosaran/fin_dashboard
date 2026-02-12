-- Fix: Accurately calculate net amounts (including brokerage/taxes) for ledger and account balance
-- This ensures that sells correctly subtract charges and buys correctly add them.

-- 1. Correct sync_investment_to_ledger
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
        
        IF NEW.transaction_type = 'BUY' THEN
            v_type := 'Expense';
            v_amount := NEW.total_amount + COALESCE(NEW.brokerage, 0) + COALESCE(NEW.taxes, 0);
        ELSE
            v_type := 'Income';
            v_amount := NEW.total_amount - COALESCE(NEW.brokerage, 0) - COALESCE(NEW.taxes, 0);
        END IF;
        
    -- 2. Mutual Fund Transactions
    ELSIF TG_TABLE_NAME = 'mutual_fund_transactions' THEN
        SELECT name INTO v_symbol FROM public.mutual_funds WHERE id = NEW.mutual_fund_id;
        v_desc := NEW.transaction_type || ' MF: ' || COALESCE(v_symbol, 'Unknown') || ' (' || NEW.units || ' units)';
        v_type := CASE WHEN NEW.transaction_type IN ('BUY', 'SIP') THEN 'Expense' ELSE 'Income' END;
        v_amount := NEW.total_amount; -- MF transactions in this app don't store separate charges yet

    -- 3. F&O Trades
    ELSIF TG_TABLE_NAME = 'fno_trades' THEN
        IF (TG_OP = 'INSERT' AND NEW.status = 'OPEN') THEN
            v_desc := 'FnO Entry: ' || NEW.instrument;
            v_type := 'Expense';
            v_amount := NEW.avg_price * NEW.quantity;
        ELSIF (TG_OP = 'INSERT' AND NEW.status = 'CLOSED') THEN
            -- Entry Leg
            INSERT INTO public.transactions (user_id, account_id, date, description, category, type, amount)
            VALUES (NEW.user_id, NEW.account_id, NEW.entry_date, 'FnO Entry: ' || NEW.instrument, 'Investments', 'Expense', NEW.avg_price * NEW.quantity);
            -- Exit Leg
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
        IF NEW.transaction_type = 'BUY' THEN
            v_type := 'Expense';
            v_amount := NEW.total_amount;
        ELSE
            v_type := 'Income';
            v_amount := NEW.total_amount;
        END IF;
    END IF;

    -- 5. Final insert to ledger
    INSERT INTO public.transactions (user_id, account_id, date, description, category, type, amount)
    VALUES (NEW.user_id, NEW.account_id, COALESCE(NEW.transaction_date, CURRENT_DATE), v_desc, 'Investments', v_type, v_amount);

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. Correct update_account_on_investment
CREATE OR REPLACE FUNCTION public.update_account_on_investment()
RETURNS TRIGGER AS $$
DECLARE
    v_net_amount DECIMAL(15,2);
BEGIN
    IF TG_TABLE_NAME = 'stock_transactions' THEN
        IF NEW.transaction_type = 'BUY' THEN
            v_net_amount := -(NEW.total_amount + COALESCE(NEW.brokerage, 0) + COALESCE(NEW.taxes, 0));
        ELSE
            v_net_amount := NEW.total_amount - COALESCE(NEW.brokerage, 0) - COALESCE(NEW.taxes, 0);
        END IF;
    ELSIF TG_TABLE_NAME = 'mutual_fund_transactions' THEN
        v_net_amount := NEW.total_amount;
        IF NEW.transaction_type IN ('BUY', 'SIP') THEN v_net_amount := -v_net_amount; END IF;
    ELSIF TG_TABLE_NAME = 'bond_transactions' THEN
        v_net_amount := NEW.total_amount;
        IF NEW.transaction_type = 'BUY' THEN v_net_amount := -v_net_amount; END IF;
    END IF;

    IF NEW.account_id IS NOT NULL THEN
        UPDATE public.accounts SET balance = balance + v_net_amount WHERE id = NEW.account_id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
