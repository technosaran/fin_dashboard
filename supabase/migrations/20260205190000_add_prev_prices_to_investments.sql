-- Add previous price/NAV columns to investments for Day's P&L calculation
ALTER TABLE stocks ADD COLUMN IF NOT EXISTS previous_price DECIMAL(15,2);
ALTER TABLE mutual_funds ADD COLUMN IF NOT EXISTS previous_nav DECIMAL(15,4);

-- Update existing data to avoid NULLs (demonstration)
UPDATE stocks SET previous_price = current_price WHERE previous_price IS NULL;
UPDATE mutual_funds SET previous_nav = current_nav WHERE previous_nav IS NULL;
