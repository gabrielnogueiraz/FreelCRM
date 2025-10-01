import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Create optimized Supabase client with better performance settings
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  },
  global: {
    headers: {
      'X-Client-Info': 'freelcrm@1.0.0'
    }
  }
})

// Optimized query helpers
export const optimizedQueries = {
  // Get clients with minimal data for lists
  getClientsList: (userId: string) => 
    supabase
      .from('clients')
      .select('id, name, email, company, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false }),

  // Get proposals with client info for kanban
  getProposalsWithClients: (userId: string) =>
    supabase
      .from('proposals')
      .select(`
        id,
        title,
        amount,
        status,
        created_at,
        clients!inner(
          id,
          name,
          email,
          company
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false }),

  // Get dashboard stats in one query
  getDashboardStats: (userId: string) =>
    supabase
      .from('proposals')
      .select('amount, status')
      .eq('user_id', userId)
      .then(async (proposalsResult) => {
        const clientsResult = await supabase
          .from('clients')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', userId)

        const proposals = proposalsResult.data || []
        const totalClients = clientsResult.count || 0
        
        const totalProposals = proposals.length
        const activeProposals = proposals.filter(p => p.status === 'Aberto' || p.status === 'Em negociação').length
        const closedProposals = proposals.filter(p => p.status === 'Fechado').length
        const totalRevenue = proposals.filter(p => p.status === 'Fechado').reduce((sum, p) => sum + p.amount, 0)
        const conversionRate = totalProposals > 0 ? (closedProposals / totalProposals) * 100 : 0

        return {
          totalClients,
          totalProposals,
          activeProposals,
          closedProposals,
          totalRevenue,
          conversionRate
        }
      })
}

// Debounced update function to prevent excessive API calls
export const debouncedUpdate = (() => {
  const timeouts = new Map<string, NodeJS.Timeout>()
  
  return (key: string, fn: () => void, delay: number = 300) => {
    if (timeouts.has(key)) {
      clearTimeout(timeouts.get(key)!)
    }
    
    timeouts.set(key, setTimeout(() => {
      fn()
      timeouts.delete(key)
    }, delay))
  }
})()
