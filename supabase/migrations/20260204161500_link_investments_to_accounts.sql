-- Add account_id to stock_transactions
ALTER TABLE stock_transactions ADD COLUMN account_id BIGINT REFERENCES accounts(id);

-- Add account_id to mutual_fund_transactions
ALTER TABLE mutual_fund_transactions ADD COLUMN account_id BIGINT REFERENCES accounts(id);

-- Add comments for clarity
COMMENT ON COLUMN stock_transactions.account_id IS 'The bank account used for this stock transaction';
COMMENT ON COLUMN mutual_fund_transactions.account_id IS 'The bank account used for this mutual fund transaction';
