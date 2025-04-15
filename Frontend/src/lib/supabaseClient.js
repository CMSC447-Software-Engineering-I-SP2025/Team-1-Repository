import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ibxxlcyqbpfmzohqrtma.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlieHhsY3lxYnBmbXpvaHFydG1hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM0MDk4MzQsImV4cCI6MjA1ODk4NTgzNH0.sLePr_FdaaLkjLOU7VgX8HEZrUx2m1Tcbhb4nBx4lRU'

export const supabase = createClient(supabaseUrl, supabaseKey)
