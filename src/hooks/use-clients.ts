'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase-client'
import { Client, ClientInsert, ClientUpdate } from '@/types/database'
import { useAuth } from '@/contexts/auth-context'

export function useClients() {
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

  const addClient = async (clientData: ClientInsert) => {
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
  }

  const updateClient = async (id: string, clientData: ClientUpdate) => {
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
      const errorMessage = err instanceof Error ? err.message : 'Erro ao adicionar cliente'
      setError(errorMessage)
      throw err
    }
  }

  const deleteClient = async (id: string) => {
    try {
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', id)

      if (error) throw error
      setClients(prev => prev.filter(client => client.id !== id))
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao adicionar cliente'
      setError(errorMessage)
      throw err
    }
  }

  useEffect(() => {
    if (user) {
      fetchClients()
      
      // Set up realtime subscription
      const supabase = createClient()
      const channel = supabase
        .channel('clients-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'clients',
            filter: `user_id=eq.${user.id}`
          },
          (payload) => {
            console.log('Client change received:', payload)
            
            switch (payload.eventType) {
              case 'INSERT':
                setClients(prev => [payload.new as Client, ...prev])
                break
              case 'UPDATE':
                setClients(prev => prev.map(client => 
                  client.id === payload.new.id ? payload.new as Client : client
                ))
                break
              case 'DELETE':
                setClients(prev => prev.filter(client => client.id !== payload.old.id))
                break
            }
          }
        )
        .subscribe()

      return () => {
        supabase.removeChannel(channel)
      }
    }
  }, [user, fetchClients])

  return {
    clients,
    loading,
    error,
    createClient: addClient,
    updateClient,
    deleteClient,
    refetch: fetchClients,
  }
}
