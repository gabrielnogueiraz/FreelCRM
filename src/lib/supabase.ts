import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://zdvecomcbpxdhzvvxnmg.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpkdmVjb21jYnB4ZGh6dnZ4bm1nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkzMzQ0NDIsImV4cCI6MjA3NDkxMDQ0Mn0.v9KORDiELApE7FeTzW3aHQvZ0jwjWXbufM6FRSu2hiw'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
