'use client'

import { useState } from 'react'
import { Plus, Search, Filter, Users, Building2 } from 'lucide-react'

import { ProtectedRoute } from '@/components/auth/protected-route'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ClientForm } from '@/components/clients/client-form'
import { ClientsList } from '@/components/clients/clients-list'
import { useDebounce } from '@/hooks/use-debounce'
import { useClientsOptimized } from '@/hooks/use-clients-optimized'
import { Client } from '@/types/database'

export default function ClientsPage() {
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingClient, setEditingClient] = useState<Client | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const debouncedSearchTerm = useDebounce(searchTerm, 300)
  const { clients, stats } = useClientsOptimized()

  // Calculate metrics
  const totalClients = stats.total
  const companiesCount = clients.filter(client => client.company && client.company.trim() !== '').length
  const thisMonthClients = clients.filter(client => {
    const clientDate = new Date(client.created_at)
    const now = new Date()
    return clientDate.getMonth() === now.getMonth() && clientDate.getFullYear() === now.getFullYear()
  }).length

  const handleEditClient = (client: Client) => {
    setEditingClient(client)
    setIsFormOpen(true)
  }

  const handleCloseForm = () => {
    setIsFormOpen(false)
    setEditingClient(null)
  }

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold tracking-tight">Clientes</h1>
              <p className="text-muted-foreground text-lg mt-2">
                Gerencie seus clientes e suas informações
              </p>
            </div>
            <Button onClick={() => setIsFormOpen(true)} size="lg">
              <Plus className="mr-2 h-5 w-5" />
              Novo Cliente
            </Button>
          </div>

          {/* Search and Filters */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar clientes..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stats */}
          <div className="grid gap-6 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total de Clientes
                </CardTitle>
                <Users className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalClients}</div>
                <p className="text-xs text-muted-foreground">
                  +{thisMonthClients} este mês
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Empresas
                </CardTitle>
                <Building2 className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{companiesCount}</div>
                <p className="text-xs text-muted-foreground">
                  {totalClients > 0 ? `${Math.round((companiesCount / totalClients) * 100)}%` : '0%'} com empresa
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Crescimento
                </CardTitle>
                <Users className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {thisMonthClients > 0 ? `+${thisMonthClients}` : '0'}
                </div>
                <p className="text-xs text-muted-foreground">
                  novos este mês
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Clients List */}
          <ClientsList onEditClient={handleEditClient} searchTerm={debouncedSearchTerm} />

          <ClientForm
            open={isFormOpen}
            onOpenChange={handleCloseForm}
            client={editingClient}
          />
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
}
