-- Create stocks table for tracking investments
CREATE TABLE stocks (
    id BIGSERIAL PRIMARY KEY,
    symbol TEXT NOT NULL,
    company_name TEXT NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 0,
    avg_price DECIMAL(15,2) NOT NULL DEFAULT 0,
    current_price DECIMAL(15,2) NOT NULL DEFAULT 0,
    sector TEXT,
    exchange TEXT NOT NULL DEFAULT 'NSE',
    investment_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
    current_value DECIMAL(15,2) NOT NULL DEFAULT 0,
    pnl DECIMAL(15,2) NOT NULL DEFAULT 0,
    pnl_percentage DECIMAL(8,2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create stock_transactions table for tracking buy/sell transactions
CREATE TABLE stock_transactions (
    id BIGSERIAL PRIMARY KEY,
    stock_id BIGINT REFERENCES stocks(id) ON DELETE CASCADE,
    transaction_type TEXT NOT NULL CHECK (transaction_type IN ('BUY', 'SELL')),
    quantity INTEGER NOT NULL,
    price DECIMAL(15,2) NOT NULL,
    total_amount DECIMAL(15,2) NOT NULL,
    brokerage DECIMAL(15,2) DEFAULT 0,
    taxes DECIMAL(15,2) DEFAULT 0,
    transaction_date DATE NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create watchlist table for tracking stocks to watch
CREATE TABLE watchlist (
    id BIGSERIAL PRIMARY KEY,
    symbol TEXT NOT NULL,
    company_name TEXT NOT NULL,
    target_price DECIMAL(15,2),
    current_price DECIMAL(15,2),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_stocks_symbol ON stocks(symbol);
CREATE INDEX idx_stocks_sector ON stocks(sector);
CREATE INDEX idx_stock_transactions_stock_id ON stock_transactions(stock_id);
CREATE INDEX idx_stock_transactions_date ON stock_transactions(transaction_date DESC);
CREATE INDEX idx_stock_transactions_type ON stock_transactions(transaction_type);
CREATE INDEX idx_watchlist_symbol ON watchlist(symbol);

-- Create triggers for updated_at
CREATE TRIGGER update_stocks_updated_at BEFORE UPDATE ON stocks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_stock_transactions_updated_at BEFORE UPDATE ON stock_transactions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_watchlist_updated_at BEFORE UPDATE ON watchlist FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert some sample data for demonstration
INSERT INTO stocks (symbol, company_name, quantity, avg_price, current_price, sector, exchange, investment_amount, current_value, pnl, pnl_percentage) VALUES
('RELIANCE', 'Reliance Industries Ltd', 10, 2450.00, 2520.00, 'Oil & Gas', 'NSE', 24500.00, 25200.00, 700.00, 2.86),
('TCS', 'Tata Consultancy Services', 5, 3200.00, 3350.00, 'IT Services', 'NSE', 16000.00, 16750.00, 750.00, 4.69),
('INFY', 'Infosys Ltd', 8, 1450.00, 1520.00, 'IT Services', 'NSE', 11600.00, 12160.00, 560.00, 4.83);

INSERT INTO watchlist (symbol, company_name, target_price, current_price, notes) VALUES
('HDFC', 'HDFC Bank Ltd', 1600.00, 1580.00, 'Good banking stock for long term'),
('ICICIBANK', 'ICICI Bank Ltd', 950.00, 920.00, 'Waiting for dip to buy'),
('WIPRO', 'Wipro Ltd', 400.00, 385.00, 'IT sector consolidation play');