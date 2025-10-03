'use client'

import { useState } from 'react'
import { Plus, Search, Filter, FileText, TrendingUp, DollarSign, Target } from 'lucide-react'

import { ProtectedRoute } from '@/components/auth/protected-route'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ProposalForm } from '@/components/proposals/proposal-form'
import { ProposalsKanban } from '@/components/proposals/proposals-kanban'
import { useDebounce } from '@/hooks/use-debounce'
import { useProposalsOptimized } from '@/hooks/use-proposals-optimized'
import { Proposal } from '@/types/database'

export default function ProposalsPage() {
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingProposal, setEditingProposal] = useState<Proposal | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const debouncedSearchTerm = useDebounce(searchTerm, 300)
  const { proposals, stats } = useProposalsOptimized()

  // Calculate metrics
  const totalProposals = stats.total
  const totalRevenue = stats.closedRevenue // Apenas propostas fechadas
  const allProposalsRevenue = stats.totalRevenue // Todas as propostas
  const activeProposals = stats.active
  const closedProposals = stats.closed
  const conversionRate = totalProposals > 0 ? Math.round((closedProposals / totalProposals) * 100) : 0
  
  const thisMonthProposals = proposals.filter(proposal => {
    const proposalDate = new Date(proposal.created_at)
    const now = new Date()
    return proposalDate.getMonth() === now.getMonth() && proposalDate.getFullYear() === now.getFullYear()
  }).length

  const thisMonthRevenue = proposals
    .filter(proposal => {
      const proposalDate = new Date(proposal.created_at)
      const now = new Date()
      return proposalDate.getMonth() === now.getMonth() && proposalDate.getFullYear() === now.getFullYear()
    })
    .reduce((sum, proposal) => sum + Number(proposal.amount), 0)

  const handleEditProposal = (proposal: Proposal) => {
    setEditingProposal(proposal)
    setIsFormOpen(true)
  }

  const handleCloseForm = () => {
    setIsFormOpen(false)
    setEditingProposal(null)
  }

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6 sm:space-y-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Propostas</h1>
              <p className="text-muted-foreground text-base sm:text-lg mt-2">
                Gerencie seu pipeline de propostas com drag & drop
              </p>
            </div>
            <Button onClick={() => setIsFormOpen(true)} size="lg" className="w-full sm:w-auto">
              <Plus className="mr-2 h-5 w-5" />
              Nova Proposta
            </Button>
          </div>

          {/* Stats */}
          <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total de Propostas
                </CardTitle>
                <FileText className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalProposals}</div>
                <p className="text-xs text-muted-foreground">
                  +{thisMonthProposals} este mês
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Receita Fechada
                </CardTitle>
                <DollarSign className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  R$ {totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <p className="text-xs text-muted-foreground">
                  R$ {allProposalsRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} pipeline total
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Taxa de Conversão
                </CardTitle>
                <TrendingUp className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{conversionRate}%</div>
                <p className="text-xs text-muted-foreground">
                  {closedProposals} de {totalProposals} fechadas
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Propostas Ativas
                </CardTitle>
                <Target className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{activeProposals}</div>
                <p className="text-xs text-muted-foreground">
                  {activeProposals > 0 ? `${Math.round((activeProposals / totalProposals) * 100)}%` : '0%'} do total
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Kanban Board */}
          <ProposalsKanban onEditProposal={handleEditProposal} searchTerm={debouncedSearchTerm} />

          <ProposalForm
            open={isFormOpen}
            onOpenChange={handleCloseForm}
            proposal={editingProposal}
          />
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
}
