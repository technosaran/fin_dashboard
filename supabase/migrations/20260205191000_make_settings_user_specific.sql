-- Add user_id to app_settings and make it user-specific
ALTER TABLE public.app_settings ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) DEFAULT auth.uid();

-- Update existing row to belong to current user if possible, or delete it
DELETE FROM public.app_settings WHERE id = 1;

-- Change primary key to be user_id (one settings row per user)
ALTER TABLE public.app_settings DROP CONSTRAINT IF EXISTS app_settings_pkey;
ALTER TABLE public.app_settings ADD PRIMARY KEY (user_id);

-- Update RLS policies
DROP POLICY IF EXISTS "Allow all for demo" ON public.app_settings;
CREATE POLICY "Users can only see their own settings" ON public.app_settings
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can only update their own settings" ON public.app_settings
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can only insert their own settings" ON public.app_settings
    FOR INSERT WITH CHECK (auth.uid() = user_id);
