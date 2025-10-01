'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { createClient } from '@/lib/supabase-client'
import { Client, ClientInsert, ClientUpdate } from '@/types/database'
import { useAuth } from '@/contexts/auth-context'

export function useClientsOptimized() {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()
  const supabase = createClient()

  const fetchClients = useCallback(async () => {
    if (!user) return

    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setClients(data || [])
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar clientes'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [user, supabase])

  const addClient = useCallback(async (clientData: ClientInsert) => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('clients')
        .insert([{ ...clientData, user_id: user.id }])
        .select()
        .single()

      if (error) throw error
      setClients(prev => [data, ...prev])
      return data
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao adicionar cliente'
      setError(errorMessage)
      throw err
    }
  }, [user, supabase])

  const updateClient = useCallback(async (id: string, clientData: ClientUpdate) => {
    try {
      const { data, error } = await supabase
        .from('clients')
        .update(clientData)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      setClients(prev => prev.map(client => client.id === id ? data : client))
      return data
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar cliente'
      setError(errorMessage)
      throw err
    }
  }, [supabase])

  const deleteClient = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', id)

      if (error) throw error
      setClients(prev => prev.filter(client => client.id !== id))
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao excluir cliente'
      setError(errorMessage)
      throw err
    }
  }, [supabase])

  // Memoized filtered clients for search
  const getFilteredClients = useCallback((searchTerm: string) => {
    if (!searchTerm) return clients
    return clients.filter(client => 
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (client.company && client.company.toLowerCase().includes(searchTerm.toLowerCase()))
    )
  }, [clients])

  // Memoized stats
  const stats = useMemo(() => ({
    total: clients.length,
    withCompany: clients.filter(c => c.company).length,
    recent: clients.slice(0, 5)
  }), [clients])

  useEffect(() => {
    if (user) {
      fetchClients()
      
      // Set up realtime subscription with optimized handling
      const channel = supabase
        .channel(`clients-changes-${user.id}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'clients',
            filter: `user_id=eq.${user.id}`
          },
          (payload) => {
            switch (payload.eventType) {
              case 'INSERT':
                setClients(prev => [payload.new as Client, ...prev])
                break
              case 'UPDATE':
                setClients(prev => prev.map(client => 
                  client.id === payload.new.id 
                    ? payload.new as Client
                    : client
                ))
                break
              case 'DELETE':
                setClients(prev => prev.filter(c => c.id !== payload.old.id))
                break
            }
          }
        )
        .subscribe()

      return () => {
        supabase.removeChannel(channel)
      }
    }
  }, [user, supabase])

  return {
    clients,
    loading,
    error,
    addClient,
    updateClient,
    deleteClient,
    getFilteredClients,
    stats,
    refetch: fetchClients
  }
}
