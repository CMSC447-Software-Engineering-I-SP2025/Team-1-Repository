import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ibxxlcyqbpfmzohqrtma.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlieHhsY3lxYnBmbXpvaHFydG1hIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MzQwOTgzNCwiZXhwIjoyMDU4OTg1ODM0fQ.F0iyO-IUVv1aYNUymhQroI2EliHggHHoxUqY_1EnHQQ'

export const supabase = createClient(supabaseUrl, supabaseKey)
