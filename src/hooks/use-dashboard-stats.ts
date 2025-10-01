'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase-client'
import { useAuth } from '@/contexts/auth-context'

interface DashboardStats {
  totalClients: number
  totalProposals: number
  totalRevenue: number
  conversionRate: number
  activeProposals: number
  closedProposals: number
}

export function useDashboardStats() {
  const [stats, setStats] = useState<DashboardStats>({
    totalClients: 0,
    totalProposals: 0,
    totalRevenue: 0,
    conversionRate: 0,
    activeProposals: 0,
    closedProposals: 0
  })
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const supabase = createClient()

  const fetchStats = async () => {
    if (!user) return

    try {
      setLoading(true)

      // Fetch clients count
      const { count: clientsCount } = await supabase
        .from('clients')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)

      // Fetch proposals data
      const { data: proposals } = await supabase
        .from('proposals')
        .select('amount, status')
        .eq('user_id', user.id)

      const totalProposals = proposals?.length || 0
      const activeProposals = proposals?.filter(p => p.status === 'Aberto' || p.status === 'Em negociação').length || 0
      const closedProposals = proposals?.filter(p => p.status === 'Fechado').length || 0
      const totalRevenue = proposals?.filter(p => p.status === 'Fechado').reduce((sum, p) => sum + p.amount, 0) || 0
      const conversionRate = totalProposals > 0 ? (closedProposals / totalProposals) * 100 : 0

      setStats({
        totalClients: clientsCount || 0,
        totalProposals,
        totalRevenue,
        conversionRate,
        activeProposals,
        closedProposals
      })
    } catch (error) {
      console.error('Error fetching dashboard stats:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user) {
      fetchStats()
      
      // Set up realtime subscriptions for both tables
      const clientsChannel = supabase
        .channel('dashboard-clients-stats')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'clients',
            filter: `user_id=eq.${user.id}`
          },
          () => {
            fetchStats() // Refetch stats when clients change
          }
        )
        .subscribe()

      const proposalsChannel = supabase
        .channel('dashboard-proposals-stats')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'proposals',
            filter: `user_id=eq.${user.id}`
          },
          () => {
            fetchStats() // Refetch stats when proposals change
          }
        )
        .subscribe()

      return () => {
        supabase.removeChannel(clientsChannel)
        supabase.removeChannel(proposalsChannel)
      }
    }
  }, [user])

  return {
    stats,
    loading,
    refetch: fetchStats
  }
}
