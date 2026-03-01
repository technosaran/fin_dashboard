import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ztjijyybzhhtximqhpxx.supabase.co';
const SUPABASE_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp0amlqeXliemhodHhpbXFocHh4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAxOTE2NzYsImV4cCI6MjA4NTc2NzY3Nn0.Y7WA6DBAclc0XwHVaOqZFPxLM-sERf2xHycnf8ag1zo';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function checkTables() {
  console.log('Checking if bonds table exists...');
  const { error: bondsErr } = await supabase.from('bonds').select('id').limit(1);
  if (bondsErr && bondsErr.code === '42P01') {
    console.log('bonds table DOES NOT exist.');
  } else if (bondsErr) {
    console.log('bonds check error:', bondsErr.message);
  } else {
    console.log('bonds table EXISTS.');
  }

  console.log('Checking if bond_transactions table exists...');
  const { error: btErr } = await supabase.from('bond_transactions').select('id').limit(1);
  if (btErr && btErr.code === '42P01') {
    console.log('bond_transactions table DOES NOT exist.');
  } else if (btErr) {
    console.log('bond_transactions check error:', btErr.message);
  } else {
    console.log('bond_transactions table EXISTS.');
  }

  console.log('Checking if forex_transactions table exists...');
  const { error: forexErr } = await supabase.from('forex_transactions').select('id').limit(1);
  if (forexErr && forexErr.code === '42P01') {
    console.log('forex_transactions table DOES NOT exist.');
  } else if (forexErr) {
    console.log('forex_transactions check error:', forexErr.message);
  } else {
    console.log('forex_transactions table EXISTS.');
  }
}

checkTables();
