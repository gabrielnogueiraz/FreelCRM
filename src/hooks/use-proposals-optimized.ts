'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { createClient } from '@/lib/supabase-client'
import { ProposalWithClient, ProposalInsert, ProposalUpdate } from '@/types/database'
import { useAuth } from '@/contexts/auth-context'

export function useProposalsOptimized() {
  const [proposals, setProposals] = useState<ProposalWithClient[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()
  const supabase = createClient()

  const fetchProposals = useCallback(async () => {
    if (!user) return

    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('proposals')
        .select(`
          *,
          clients (
            id,
            name,
            email,
            company
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setProposals(data || [])
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar propostas'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [user, supabase])

  const addProposal = useCallback(async (proposalData: ProposalInsert) => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('proposals')
        .insert([{ ...proposalData, user_id: user.id }])
        .select(`
          *,
          clients (
            id,
            name,
            email,
            company
          )
        `)
        .single()

      if (error) throw error
      setProposals(prev => [data, ...prev])
      return data
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao adicionar proposta'
      setError(errorMessage)
      throw err
    }
  }, [user, supabase])

  const updateProposal = useCallback(async (id: string, proposalData: ProposalUpdate) => {
    try {
      const { data, error } = await supabase
        .from('proposals')
        .update(proposalData)
        .eq('id', id)
        .select(`
          *,
          clients (
            id,
            name,
            email,
            company
          )
        `)
        .single()

      if (error) throw error
      setProposals(prev => prev.map(proposal => proposal.id === id ? data : proposal))
      return data
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar proposta'
      setError(errorMessage)
      throw err
    }
  }, [supabase])

  const updateProposalStatus = useCallback(async (id: string, status: 'Aberto' | 'Em negociação' | 'Fechado') => {
    try {
      // Validate status
      const validStatuses = ['Aberto', 'Em negociação', 'Fechado']
      if (!validStatuses.includes(status)) {
        throw new Error(`Status inválido: ${status}`)
      }

      // Test with a simple update first
      const { error } = await supabase
        .from('proposals')
        .update({ status })
        .eq('id', id)

      if (error) {
        throw error
      }
      
      // Update local state immediately for better UX
      setProposals(prev => prev.map(proposal => 
        proposal.id === id ? { ...proposal, status } : proposal
      ))
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar proposta'
      setError(errorMessage)
      throw err
    }
  }, [supabase])

  const deleteProposal = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from('proposals')
        .delete()
        .eq('id', id)

      if (error) throw error
      setProposals(prev => prev.filter(proposal => proposal.id !== id))
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao excluir proposta'
      setError(errorMessage)
      throw err
    }
  }, [supabase])

  // Memoized filtered proposals for search
  const getFilteredProposals = useCallback((searchTerm: string) => {
    if (!searchTerm) return proposals
    return proposals.filter(proposal =>
      proposal.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      proposal.clients?.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [proposals])

  // Memoized proposals by status
  const proposalsByStatus = useMemo(() => {
    return proposals.reduce((acc, proposal) => {
      if (!acc[proposal.status]) {
        acc[proposal.status] = []
      }
      acc[proposal.status].push(proposal)
      return acc
    }, {} as Record<string, ProposalWithClient[]>)
  }, [proposals])

  // Memoized stats
  const stats = useMemo(() => {
    const total = proposals.length
    const active = proposals.filter(p => p.status === 'Aberto' || p.status === 'Em negociação').length
    const closed = proposals.filter(p => p.status === 'Fechado').length
    const totalRevenue = proposals.reduce((sum, p) => sum + Number(p.amount), 0)
    const closedRevenue = proposals.filter(p => p.status === 'Fechado').reduce((sum, p) => sum + Number(p.amount), 0)
    const conversionRate = total > 0 ? (closed / total) * 100 : 0

    return {
      total,
      active,
      closed,
      totalRevenue,
      closedRevenue,
      conversionRate
    }
  }, [proposals])

  useEffect(() => {
    if (user) {
      fetchProposals()
      
      // Set up realtime subscription with optimized handling
      const channel = supabase
        .channel(`proposals-changes-${user.id}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'proposals',
            filter: `user_id=eq.${user.id}`
          },
          async (payload) => {
            switch (payload.eventType) {
              case 'INSERT':
                // Refetch to get full data with client info
                const { data: newProposal, error } = await supabase
                  .from('proposals')
                  .select(`
                    *,
                    clients (
                      id,
                      name,
                      email
                    )
                  `)
                  .eq('id', payload.new.id)
                  .single()
                
                if (!error && newProposal) {
                  setProposals(prev => [newProposal, ...prev])
                }
                break
              case 'UPDATE':
                setProposals(prev => prev.map(proposal => 
                  proposal.id === payload.new.id 
                    ? { ...proposal, ...payload.new }
                    : proposal
                ))
                break
              case 'DELETE':
                setProposals(prev => prev.filter(p => p.id !== payload.old.id))
                break
            }
          }
        )
        .subscribe()

      return () => {
        supabase.removeChannel(channel)
      }
    }
  }, [user, supabase, fetchProposals])

  return {
    proposals,
    loading,
    error,
    addProposal,
    updateProposal,
    updateProposalStatus,
    deleteProposal,
    getFilteredProposals,
    proposalsByStatus,
    stats,
    refetch: fetchProposals
  }
}
