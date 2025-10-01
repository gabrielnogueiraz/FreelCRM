'use client'

import { ProtectedRoute } from '@/components/auth/protected-route'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AnimatedCard } from '@/components/ui/animated-card'
import { useDashboardStats } from '@/hooks/use-dashboard-stats'
import { useClientsOptimized } from '@/hooks/use-clients-optimized'
import { useProposalsOptimized } from '@/hooks/use-proposals-optimized'
import { 
  Users, 
  FileText, 
  DollarSign, 
  TrendingUp, 
  Plus,
  ArrowRight,
  Calendar,
  Target,
  CheckCircle2,
  Clock
} from 'lucide-react'
import Link from 'next/link'

export default function DashboardPage() {
  const { stats, loading } = useDashboardStats()
  const { stats: clientStats } = useClientsOptimized()
  const { stats: proposalStats } = useProposalsOptimized()

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(amount)
  }

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold tracking-tight">Dashboard</h1>
              <p className="text-muted-foreground text-lg mt-2">
                Visão geral do seu negócio
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" asChild>
                <Link href="/dashboard/clients">
                  <Users className="h-4 w-4 mr-2" />
                  Clientes
                </Link>
              </Button>
              <Button asChild>
                <Link href="/dashboard/proposals">
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Proposta
                </Link>
              </Button>
            </div>
          </div>

                 {/* Stats Grid */}
                 <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                   <AnimatedCard delay={0.1} scale>
                     <Card className="hover:shadow-lg transition-shadow duration-200">
                       <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                         <CardTitle className="text-sm font-medium text-muted-foreground">
                           Total de Clientes
                         </CardTitle>
                         <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                           <Users className="h-5 w-5 text-primary" />
                         </div>
                       </CardHeader>
                       <CardContent>
                         <div className="text-3xl font-bold">
                           {loading ? '...' : stats.totalClients}
                         </div>
                         <p className="text-sm text-muted-foreground mt-1">
                           <span className="text-green-600">+0%</span> este mês
                         </p>
                       </CardContent>
                     </Card>
                   </AnimatedCard>

                   <AnimatedCard delay={0.2} scale>
                     <Card className="hover:shadow-lg transition-shadow duration-200">
                       <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                         <CardTitle className="text-sm font-medium text-muted-foreground">
                           Propostas Ativas
                         </CardTitle>
                         <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                           <FileText className="h-5 w-5 text-blue-500" />
                         </div>
                       </CardHeader>
                       <CardContent>
                         <div className="text-3xl font-bold">
                           {loading ? '...' : stats.activeProposals}
                         </div>
                         <p className="text-sm text-muted-foreground mt-1">
                           <span className="text-green-600">+0%</span> este mês
                         </p>
                       </CardContent>
                     </Card>
                   </AnimatedCard>

                   <AnimatedCard delay={0.3} scale>
                     <Card className="hover:shadow-lg transition-shadow duration-200">
                       <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                         <CardTitle className="text-sm font-medium text-muted-foreground">
                           Receita Total
                         </CardTitle>
                         <div className="h-10 w-10 rounded-xl bg-green-500/10 flex items-center justify-center">
                           <DollarSign className="h-5 w-5 text-green-500" />
                         </div>
                       </CardHeader>
                       <CardContent>
                         <div className="text-3xl font-bold">
                           {loading ? '...' : formatCurrency(stats.totalRevenue)}
                         </div>
                         <p className="text-sm text-muted-foreground mt-1">
                           <span className="text-green-600">+0%</span> este mês
                         </p>
                       </CardContent>
                     </Card>
                   </AnimatedCard>

                   <AnimatedCard delay={0.4} scale>
                     <Card className="hover:shadow-lg transition-shadow duration-200">
                       <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                         <CardTitle className="text-sm font-medium text-muted-foreground">
                           Taxa de Conversão
                         </CardTitle>
                         <div className="h-10 w-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                           <TrendingUp className="h-5 w-5 text-purple-500" />
                         </div>
                       </CardHeader>
                       <CardContent>
                         <div className="text-3xl font-bold">
                           {loading ? '...' : `${stats.conversionRate.toFixed(1)}%`}
                         </div>
                         <p className="text-sm text-muted-foreground mt-1">
                           <span className="text-green-600">+0%</span> este mês
                         </p>
                       </CardContent>
                     </Card>
                   </AnimatedCard>
                 </div>

                 {/* Recent Activity */}
                 <div className="grid gap-6 md:grid-cols-2">
                   <AnimatedCard delay={0.6}>
                     <Card>
                       <CardHeader>
                         <CardTitle className="text-xl">Clientes Recentes</CardTitle>
                         <CardDescription>
                           Seus clientes mais recentes
                         </CardDescription>
                       </CardHeader>
                       <CardContent>
                         {clientStats.recent.length > 0 ? (
                           <div className="space-y-4">
                             {clientStats.recent.map((client, index) => (
                               <div key={client.id} className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                                 <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                   <Users className="h-5 w-5 text-primary" />
                                 </div>
                                 <div className="flex-1 min-w-0">
                                   <p className="font-medium truncate">{client.name}</p>
                                   <p className="text-sm text-muted-foreground truncate">{client.email}</p>
                                 </div>
                               </div>
                             ))}
                             <Button variant="outline" className="w-full" asChild>
                               <Link href="/dashboard/clients">
                                 Ver todos os clientes
                               </Link>
                             </Button>
                           </div>
                         ) : (
                           <div className="text-center py-12">
                             <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                             <h3 className="text-lg font-medium mb-2">Nenhum cliente ainda</h3>
                             <p className="text-muted-foreground mb-4">
                               Comece adicionando seu primeiro cliente
                             </p>
                             <Button asChild>
                               <Link href="/dashboard/clients">
                                 <Plus className="h-4 w-4 mr-2" />
                                 Adicionar Cliente
                               </Link>
                             </Button>
                           </div>
                         )}
                       </CardContent>
                     </Card>
                   </AnimatedCard>

                   <AnimatedCard delay={0.7}>
                     <Card>
                       <CardHeader>
                         <CardTitle className="text-xl">Propostas Recentes</CardTitle>
                         <CardDescription>
                           Suas propostas mais recentes
                         </CardDescription>
                       </CardHeader>
                       <CardContent>
                         {proposalStats.total > 0 ? (
                           <div className="space-y-4">
                             {proposalStats.total > 0 && (
                               <div className="space-y-3">
                                 <div className="flex items-center justify-between text-sm">
                                   <span className="text-muted-foreground">Total de propostas</span>
                                   <span className="font-medium">{proposalStats.total}</span>
                                 </div>
                                 <div className="flex items-center justify-between text-sm">
                                   <span className="text-muted-foreground">Ativas</span>
                                   <span className="font-medium text-blue-600">{proposalStats.active}</span>
                                 </div>
                                 <div className="flex items-center justify-between text-sm">
                                   <span className="text-muted-foreground">Fechadas</span>
                                   <span className="font-medium text-green-600">{proposalStats.closed}</span>
                                 </div>
                                 <div className="flex items-center justify-between text-sm">
                                   <span className="text-muted-foreground">Receita total</span>
                                   <span className="font-medium text-green-600">
                                     {formatCurrency(
                                       typeof proposalStats.totalRevenue === 'number'
                                         ? proposalStats.totalRevenue
                                         : 0
                                     )}
                                   </span>
                                 </div>
                               </div>
                             )}
                             <Button variant="outline" className="w-full" asChild>
                               <Link href="/dashboard/proposals">
                                 Ver pipeline de propostas
                               </Link>
                             </Button>
                           </div>
                         ) : (
                           <div className="text-center py-12">
                             <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                             <h3 className="text-lg font-medium mb-2">Nenhuma proposta ainda</h3>
                             <p className="text-muted-foreground mb-4">
                               Crie sua primeira proposta para começar
                             </p>
                             <Button asChild>
                               <Link href="/dashboard/proposals">
                                 <Plus className="h-4 w-4 mr-2" />
                                 Criar Proposta
                               </Link>
                             </Button>
                           </div>
                         )}
                       </CardContent>
                     </Card>
                   </AnimatedCard>
                 </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
}
