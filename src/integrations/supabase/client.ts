import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://svpdrdiynveiykcfkaaf.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN2cGRyZGl5bnZlaXlrY2ZrYWFmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU1NjU5ODIsImV4cCI6MjA4MTE0MTk4Mn0.rfT3__h1fNcoS6RM3r485RxwKCyAONpHMmhFyTBmrVM';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  },
});
