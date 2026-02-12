-- Sync Portfolio Holdings: Update the main asset tables (stocks, mutual_funds, bonds)
-- whenever a corresponding transaction is added.

-- 1. Stocks Sync Function
CREATE OR REPLACE FUNCTION public.sync_stock_holdings()
RETURNS TRIGGER AS $$
DECLARE
    v_old_qty DECIMAL;
    v_old_avg DECIMAL;
    v_new_qty DECIMAL;
    v_new_avg DECIMAL;
    v_current_price DECIMAL;
BEGIN
    SELECT quantity, avg_price, current_price INTO v_old_qty, v_old_avg, v_current_price FROM public.stocks WHERE id = NEW.stock_id;
    
    IF NEW.transaction_type = 'BUY' THEN
        v_new_qty := COALESCE(v_old_qty, 0) + NEW.quantity;
        IF v_new_qty > 0 THEN
            -- Average Price calculation after Buy
            v_new_avg := ((COALESCE(v_old_qty, 0) * COALESCE(v_old_avg, 0)) + (NEW.quantity * NEW.price)) / v_new_qty;
        ELSE
            v_new_avg := NEW.price;
        END IF;
    ELSE -- SELL
        v_new_qty := COALESCE(v_old_qty, 0) - NEW.quantity;
        v_new_avg := COALESCE(v_old_avg, 0); -- Avg price doesn't change on sell in delivery
    END IF;

    UPDATE public.stocks SET 
        quantity = v_new_qty,
        avg_price = v_new_avg,
        investment_amount = v_new_qty * v_new_avg,
        current_value = v_new_qty * COALESCE(v_current_price, v_new_avg),
        pnl = (v_new_qty * COALESCE(v_current_price, v_new_avg)) - (v_new_qty * v_new_avg),
        pnl_percentage = CASE WHEN (v_new_qty * v_new_avg) > 0 THEN (((v_new_qty * COALESCE(v_current_price, v_new_avg)) - (v_new_qty * v_new_avg)) / (v_new_qty * v_new_avg)) * 100 ELSE 0 END,
        updated_at = NOW()
    WHERE id = NEW.stock_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. Mutual Funds Sync Function
CREATE OR REPLACE FUNCTION public.sync_mf_holdings()
RETURNS TRIGGER AS $$
DECLARE
    v_old_units DECIMAL;
    v_old_avg DECIMAL;
    v_new_units DECIMAL;
    v_new_avg DECIMAL;
    v_current_nav DECIMAL;
BEGIN
    SELECT units, avg_nav, current_nav INTO v_old_units, v_old_avg, v_current_nav FROM public.mutual_funds WHERE id = NEW.mutual_fund_id;
    
    IF NEW.transaction_type IN ('BUY', 'SIP') THEN
        v_new_units := COALESCE(v_old_units, 0) + NEW.units;
        IF v_new_units > 0 THEN
            v_new_avg := ((COALESCE(v_old_units, 0) * COALESCE(v_old_avg, 0)) + (NEW.units * NEW.nav)) / v_new_units;
        ELSE
            v_new_avg := NEW.nav;
        END IF;
    ELSE -- SELL
        v_new_units := COALESCE(v_old_units, 0) - NEW.units;
        v_new_avg := COALESCE(v_old_avg, 0);
    END IF;

    UPDATE public.mutual_funds SET 
        units = v_new_units,
        avg_nav = v_new_avg,
        investment_amount = v_new_units * v_new_avg,
        current_value = v_new_units * COALESCE(v_current_nav, v_new_avg),
        pnl = (v_new_units * COALESCE(v_current_nav, v_new_avg)) - (v_new_units * v_new_avg),
        pnl_percentage = CASE WHEN (v_new_units * v_new_avg) != 0 THEN (((v_new_units * COALESCE(v_current_nav, v_new_avg)) - (v_new_units * v_new_avg)) / (v_new_units * v_new_avg)) * 100 ELSE 0 END,
        updated_at = NOW()
    WHERE id = NEW.mutual_fund_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Bonds Sync Function
CREATE OR REPLACE FUNCTION public.sync_bond_holdings()
RETURNS TRIGGER AS $$
DECLARE
    v_old_qty DECIMAL;
    v_old_avg DECIMAL;
    v_new_qty DECIMAL;
    v_new_avg DECIMAL;
    v_current_price DECIMAL;
BEGIN
    SELECT quantity, avg_price, current_price INTO v_old_qty, v_old_avg, v_current_price FROM public.bonds WHERE id = NEW.bond_id;
    
    IF NEW.transaction_type = 'BUY' THEN
        v_new_qty := COALESCE(v_old_qty, 0) + NEW.quantity;
        IF v_new_qty > 0 THEN
            v_new_avg := ((COALESCE(v_old_qty, 0) * COALESCE(v_old_avg, 0)) + (NEW.quantity * NEW.price)) / v_new_qty;
        ELSE
            v_new_avg := NEW.price;
        END IF;
    ELSIF NEW.transaction_type = 'SELL' THEN
        v_new_qty := COALESCE(v_old_qty, 0) - NEW.quantity;
        v_new_avg := COALESCE(v_old_avg, 0);
    ELSE
        -- MATURITY or INTEREST
        IF NEW.transaction_type = 'MATURITY' THEN v_new_qty := 0; ELSE v_new_qty := COALESCE(v_old_qty, 0); END IF;
        v_new_avg := COALESCE(v_old_avg, 0);
    END IF;

    UPDATE public.bonds SET 
        quantity = v_new_qty,
        avg_price = v_new_avg,
        investment_amount = v_new_qty * v_new_avg,
        current_value = v_new_qty * COALESCE(v_current_price, v_new_avg),
        pnl = (v_new_qty * COALESCE(v_current_price, v_new_avg)) - (v_new_qty * v_new_avg),
        pnl_percentage = CASE WHEN (v_new_qty * v_new_avg) != 0 THEN (((v_new_qty * COALESCE(v_current_price, v_new_avg)) - (v_new_qty * v_new_avg)) / (v_new_qty * v_new_avg)) * 100 ELSE 0 END,
        updated_at = NOW(),
        status = CASE WHEN v_new_qty <= 0 AND NEW.transaction_type != 'INTEREST' THEN 'SOLD' ELSE status END
    WHERE id = NEW.bond_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers
DROP TRIGGER IF EXISTS tr_sync_stock_holdings ON public.stock_transactions;
CREATE TRIGGER tr_sync_stock_holdings
AFTER INSERT ON public.stock_transactions
FOR EACH ROW EXECUTE FUNCTION public.sync_stock_holdings();

DROP TRIGGER IF EXISTS tr_sync_mf_holdings ON public.mutual_fund_transactions;
CREATE TRIGGER tr_sync_mf_holdings
AFTER INSERT ON public.mutual_fund_transactions
FOR EACH ROW EXECUTE FUNCTION public.sync_mf_holdings();

DROP TRIGGER IF EXISTS tr_sync_bond_holdings ON public.bond_transactions;
CREATE TRIGGER tr_sync_bond_holdings
AFTER INSERT ON public.bond_transactions
FOR EACH ROW EXECUTE FUNCTION public.sync_bond_holdings();
