'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase-client'
import { ProposalInsert, ProposalUpdate, ProposalWithClient } from '@/types/database'
import { useAuth } from '@/contexts/auth-context'

export function useProposals() {
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
            email
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

  const createProposal = async (proposalData: ProposalInsert) => {
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
            email
          )
        `)
        .single()

      if (error) throw error
      setProposals(prev => [data, ...prev])
      return data
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar propostas'
      setError(errorMessage)
      throw err
    }
  }

  const updateProposal = async (id: string, proposalData: ProposalUpdate) => {
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
            email
          )
        `)
        .single()

      if (error) throw error
      setProposals(prev => prev.map(proposal => proposal.id === id ? data : proposal))
      return data
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar propostas'
      setError(errorMessage)
      throw err
    }
  }

  const deleteProposal = async (id: string) => {
    try {
      const { error } = await supabase
        .from('proposals')
        .delete()
        .eq('id', id)

      if (error) throw error
      setProposals(prev => prev.filter(proposal => proposal.id !== id))
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar propostas'
      setError(errorMessage)
      throw err
    }
  }

  const updateProposalStatus = async (id: string, status: 'Aberto' | 'Em negociação' | 'Fechado') => {
    try {
      const { error } = await supabase
        .from('proposals')
        .update({ status })
        .eq('id', id)

      if (error) throw error
      
      // Update local state immediately for better UX
      setProposals(prev => prev.map(proposal => 
        proposal.id === id ? { ...proposal, status } : proposal
      ))
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar proposta'
      setError(errorMessage)
      throw err
    }
  }

  useEffect(() => {
    if (user) {
      fetchProposals()
      
      // Set up realtime subscription
      const supabase = createClient()
      const channel = supabase
        .channel('proposals-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'proposals',
            filter: `user_id=eq.${user.id}`
          },
          async (payload) => {
            console.log('Proposal change received:', payload)
            
            switch (payload.eventType) {
              case 'INSERT':
                // Fetch the full proposal with client data
                const { data: newProposal } = await supabase
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
                  .eq('id', payload.new.id)
                  .single()
                
                if (newProposal) {
                  setProposals(prev => [newProposal as ProposalWithClient, ...prev])
                }
                break
              case 'UPDATE':
                setProposals(prev => prev.map(proposal => 
                  proposal.id === payload.new.id ? { ...proposal, ...payload.new } : proposal
                ))
                break
              case 'DELETE':
                setProposals(prev => prev.filter(proposal => proposal.id !== payload.old.id))
                break
            }
          }
        )
        .subscribe()

      return () => {
        supabase.removeChannel(channel)
      }
    }
  }, [user, fetchProposals])

  return {
    proposals,
    loading,
    error,
    createProposal,
    updateProposal,
    deleteProposal,
    updateProposalStatus,
    refetch: fetchProposals,
  }
}
