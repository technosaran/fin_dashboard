-- Add app_settings table
CREATE TABLE IF NOT EXISTS public.app_settings (
    id INTEGER PRIMARY KEY DEFAULT 1,
    brokerage_type TEXT NOT NULL DEFAULT 'percentage' CHECK (brokerage_type IN ('flat', 'percentage')),
    brokerage_value DECIMAL NOT NULL DEFAULT 0,
    stt_rate DECIMAL NOT NULL DEFAULT 0.1,
    transaction_charge_rate DECIMAL NOT NULL DEFAULT 0.00345,
    sebi_charge_rate DECIMAL NOT NULL DEFAULT 0.0001,
    stamp_duty_rate DECIMAL NOT NULL DEFAULT 0.015,
    gst_rate DECIMAL NOT NULL DEFAULT 18,
    dp_charges DECIMAL NOT NULL DEFAULT 15.93,
    auto_calculate_charges BOOLEAN NOT NULL DEFAULT true,
    default_stock_account_id BIGINT REFERENCES public.accounts(id),
    default_mf_account_id BIGINT REFERENCES public.accounts(id),
    default_salary_account_id BIGINT REFERENCES public.accounts(id),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Insert default settings row
INSERT INTO public.app_settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

-- RLS
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all for demo" ON public.app_settings FOR ALL USING (true);
