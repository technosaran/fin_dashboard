-- Create mutual_funds table for tracking investments
CREATE TABLE mutual_funds (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    isin TEXT,
    scheme_code TEXT,
    category TEXT,
    units DECIMAL(15,4) NOT NULL DEFAULT 0,
    avg_nav DECIMAL(15,4) NOT NULL DEFAULT 0,
    current_nav DECIMAL(15,4) NOT NULL DEFAULT 0,
    investment_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
    current_value DECIMAL(15,2) NOT NULL DEFAULT 0,
    pnl DECIMAL(15,2) NOT NULL DEFAULT 0,
    pnl_percentage DECIMAL(8,2) NOT NULL DEFAULT 0,
    folio_number TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create mutual_fund_transactions table
CREATE TABLE mutual_fund_transactions (
    id BIGSERIAL PRIMARY KEY,
    mutual_fund_id BIGINT REFERENCES mutual_funds(id) ON DELETE CASCADE,
    transaction_type TEXT NOT NULL CHECK (transaction_type IN ('BUY', 'SELL', 'SIP')),
    units DECIMAL(15,4) NOT NULL,
    nav DECIMAL(15,4) NOT NULL,
    total_amount DECIMAL(15,2) NOT NULL,
    transaction_date DATE NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_mutual_funds_name ON mutual_funds(name);
CREATE INDEX idx_mutual_funds_scheme_code ON mutual_funds(scheme_code);
CREATE INDEX idx_mutual_fund_transactions_mf_id ON mutual_fund_transactions(mutual_fund_id);
CREATE INDEX idx_mutual_fund_transactions_date ON mutual_fund_transactions(transaction_date DESC);

-- Create triggers
CREATE TRIGGER update_mutual_funds_updated_at BEFORE UPDATE ON mutual_funds FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_mutual_fund_transactions_updated_at BEFORE UPDATE ON mutual_fund_transactions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Sample data
INSERT INTO mutual_funds (name, isin, scheme_code, category, units, avg_nav, current_nav, investment_amount, current_value, pnl, pnl_percentage) VALUES
('SBI Bluechip Fund - Direct Plan - Growth', 'INF200K01VW1', '103504', 'Equity - Large Cap', 150.5, 65.20, 72.45, 9812.60, 10903.72, 1091.12, 11.12),
('Parag Parikh Flexi Cap Fund - Direct Plan - Growth', 'INF200K01VW2', '122639', 'Equity - Flexi Cap', 85.2, 55.40, 62.15, 4720.08, 5295.18, 575.10, 12.18);
