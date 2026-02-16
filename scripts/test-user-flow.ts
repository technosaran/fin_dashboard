
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Load env vars from .env.local manually since we are running via ts-node
const envPath = path.resolve(__dirname, '../.env.local');
if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, 'utf-8');
    envConfig.split('\n').forEach((line) => {
        const [key, value] = line.split('=');
        if (key && value) {
            process.env[key.trim()] = value.trim();
        }
    });
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function runTests() {
    console.log('Starting integration tests...');

    // 1. Authentication
    const email = `test.user.${Date.now()}@example.com`;
    const password = 'TestUser123!';

    console.log(`Creating test user: ${email}`);

    const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
    });

    if (authError) {
        console.error('Auth Error:', authError.message);
        // If rate limited or restricted, we might need manual credentials
        return;
    }

    if (!authData.user) {
        console.error('User creation failed (no user returned).');
        return;
    }

    // If session is null, it typically means email confirmation is required
    if (!authData.session) {
        console.log('User created but no session. Email confirmation likely required.');
        console.log('Trying to sign in (in case confirmation is off)...');

        // Attempt sign in
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (signInError || !signInData.session) {
            console.error('Cannot sign in. Email confirmation is probably required.');
            console.error('Skipping CRUD tests as we cannot authenticate.');
            return;
        }

        console.log('Sign in successful.');
    } else {
        console.log('User created and signed in successfully.');
    }

    const userId = authData.user.id;
    console.log('User ID:', userId);

    try {
        // 2. Add Account (Bank)
        console.log('\n--- Testing Accounts ---');
        const accountData = {
            name: 'Integration Test Bank',
            bank_name: 'Test Bank',
            type: 'Savings',
            balance: 100000,
            currency: 'INR',
            user_id: userId // Explicitly passing might be needed if triggers aren't perfect, but usually defaulting to auth.uid()
        };

        // Note: The migration adds "DEFAULT auth.uid()" to user_id. 
        // Since we are signed in, the client sends the token, so auth.uid() should work.
        // We will exclude user_id from insert to test the default behavior.

        const { data: accData, error: accError } = await supabase
            .from('accounts')
            .insert({
                name: accountData.name,
                bank_name: accountData.bank_name,
                type: accountData.type,
                balance: accountData.balance,
                currency: accountData.currency
            })
            .select()
            .single();

        if (accError) throw new Error(`Add Account Failed: ${accError.message}`);
        console.log('✅ Add Account: PASS');
        const accountId = accData.id;

        // 3. Add Stock
        console.log('\n--- Testing Stocks ---');
        const stockData = {
            symbol: 'TESTSTOCK',
            company_name: 'Test Company Ltd',
            quantity: 10,
            avg_price: 1500,
            current_price: 1550,
            exchange: 'NSE',
            investment_amount: 15000,
            current_value: 15500,
            pnl: 500,
            pnl_percentage: 3.33
        };

        const { data: stData, error: stError } = await supabase
            .from('stocks')
            .insert(stockData)
            .select()
            .single();

        if (stError) throw new Error(`Add Stock Failed: ${stError.message}`);
        console.log('✅ Add Stock: PASS');

        // 4. Add Mutual Fund
        console.log('\n--- Testing Mutual Funds ---');
        const mfData = {
            name: 'Test Mutual Fund',
            scheme_code: 'TESTMF001',
            category: 'Equity Large Cap',
            units: 100,
            avg_nav: 50,
            current_nav: 55,
            investment_amount: 5000,
            current_value: 5500,
            pnl: 500,
            pnl_percentage: 10
        };

        const { data: mfRes, error: mfError } = await supabase
            .from('mutual_funds')
            .insert(mfData)
            .select()
            .single();

        if (mfError) throw new Error(`Add Mutual Fund Failed: ${mfError.message}`);
        console.log('✅ Add Mutual Fund: PASS');

        // 5. Add Bond
        console.log('\n--- Testing Bonds ---');
        const bondData = {
            name: 'Test Bond 2030',
            isin: 'INE123456789',
            company_name: 'Test Bond Corp',
            face_value: 1000,
            quantity: 5,
            avg_price: 1000,
            current_price: 1010,
            investment_amount: 5000,
            current_value: 5050,
            status: 'ACTIVE'
        };

        const { data: bondRes, error: bondError } = await supabase
            .from('bonds')
            .insert(bondData)
            .select()
            .single();

        if (bondError) throw new Error(`Add Bond Failed: ${bondError.message}`);
        console.log('✅ Add Bond: PASS');

        // 6. Add F&O Trade
        console.log('\n--- Testing F&O ---');
        const fnoData = {
            instrument: 'NIFTY 25FEB 22000 CE',
            trade_type: 'BUY',
            product: 'NRML',
            quantity: 50,
            avg_price: 100,
            status: 'OPEN',
            account_id: accountId,
            entry_date: new Date().toISOString()
        };

        const { data: fnoRes, error: fnoError } = await supabase
            .from('fno_trades')
            .insert(fnoData)
            .select()
            .single();

        if (fnoError) throw new Error(`Add F&O Trade Failed: ${fnoError.message}`);
        console.log('✅ Add F&O Trade: PASS');

        // Cleanup
        console.log('\n--- Cleanup ---');
        // We should delete the user to clean up everything (Cascade)
        // But client SDK usually does not allow deleting users (requires service role).
        // So we delete data manually.

        await supabase.from('fno_trades').delete().eq('id', fnoRes.id);
        await supabase.from('bonds').delete().eq('id', bondRes.id);
        await supabase.from('mutual_funds').delete().eq('id', mfRes.id);
        await supabase.from('stocks').delete().eq('id', stData.id);
        await supabase.from('accounts').delete().eq('id', accountId);

        console.log('✅ Cleanup completed successfully.');

    } catch (err: any) {
        console.error('❌ Test Failed:', err.message);
    }
}

runTests().catch(console.error);
