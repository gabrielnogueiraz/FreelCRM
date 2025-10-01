'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Edit, Trash2, DollarSign, User, MoreHorizontal, Calendar, FileText, Target, Building2 } from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { ProposalWithClient } from '@/types/database'

interface ProposalCardProps {
  proposal: ProposalWithClient
  onEdit: () => void
  onDelete: () => void
  isDragging?: boolean
}

export function ProposalCard({ proposal, onEdit, onDelete, isDragging = false }: ProposalCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({
    id: proposal.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(amount)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Aberto':
        return 'bg-blue-500/10 text-blue-600 border-blue-200'
      case 'Em negociação':
        return 'bg-yellow-500/10 text-yellow-600 border-yellow-200'
      case 'Fechado':
        return 'bg-green-500/10 text-green-600 border-green-200'
      default:
        return 'bg-muted text-muted-foreground border-border'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Aberto':
        return <Target className="h-3 w-3" />
      case 'Em negociação':
        return <Calendar className="h-3 w-3" />
      case 'Fechado':
        return <DollarSign className="h-3 w-3" />
      default:
        return <Target className="h-3 w-3" />
    }
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  }

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={`group hover:shadow-lg transition-all duration-200 border-border/50 hover:border-border ${
        isDragging || isSortableDragging ? 'opacity-50 rotate-2 scale-105' : ''
      }`}
      {...attributes}
      {...listeners}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <FileText className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-lg font-semibold leading-tight">{proposal.title}</CardTitle>
            <CardDescription className="flex items-center gap-2 text-sm mt-1">
              <User className="h-4 w-4 flex-shrink-0" />
              <span className="truncate">{proposal.clients?.name || 'Cliente não encontrado'}</span>
            </CardDescription>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border ${getStatusColor(proposal.status)}`}>
            {getStatusIcon(proposal.status)}
            {proposal.status}
          </span>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon-sm" 
                className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-accent"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={onEdit} className="gap-2">
                <Edit className="h-4 w-4" />
                Editar Proposta
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={onDelete}
                className="gap-2 text-destructive focus:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
                Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-green-500/10 flex items-center justify-center">
              <DollarSign className="h-4 w-4 text-green-600" />
            </div>
            <div>
              <div className="text-2xl font-bold">{formatCurrency(Number(proposal.amount))}</div>
              <div className="text-xs text-muted-foreground">Valor da proposta</div>
            </div>
          </div>
        </div>
        
        <div className="pt-3 border-t border-border/50">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>Criado em {formatDate(proposal.created_at)}</span>
            </div>
            {proposal.clients?.company && (
              <div className="flex items-center gap-1.5">
                <Building2 className="h-3 w-3" />
                <span className="text-xs">{proposal.clients.company}</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
