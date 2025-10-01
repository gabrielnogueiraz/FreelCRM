'use client'

import { useState, useMemo } from 'react'
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, PointerSensor, useSensor, useSensors, useDroppable } from '@dnd-kit/core'
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { Edit, Trash2, DollarSign, User, MoreHorizontal, FileText, Clock, CheckCircle2, AlertCircle } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { useProposalsOptimized } from '@/hooks/use-proposals-optimized'
import { useToast } from '@/hooks/use-toast'
import { Proposal, ProposalWithClient } from '@/types/database'
import { ProposalCard } from './proposal-card'

interface ProposalsKanbanProps {
  onEditProposal: (proposal: Proposal) => void
  searchTerm?: string
}

const statusColumns = [
  { 
    id: 'Aberto', 
    title: 'Aberto', 
    color: 'bg-blue-500',
    bgColor: 'bg-blue-50 dark:bg-blue-950/20',
    textColor: 'text-blue-700 dark:text-blue-300',
    icon: AlertCircle
  },
  { 
    id: 'Em negociação', 
    title: 'Em negociação', 
    color: 'bg-yellow-500',
    bgColor: 'bg-yellow-50 dark:bg-yellow-950/20',
    textColor: 'text-yellow-700 dark:text-yellow-300',
    icon: Clock
  },
  { 
    id: 'Fechado', 
    title: 'Fechado', 
    color: 'bg-green-500',
    bgColor: 'bg-green-50 dark:bg-green-950/20',
    textColor: 'text-green-700 dark:text-green-300',
    icon: CheckCircle2
  },
]

// Componente para cada coluna com Droppable
function DroppableColumn({ 
  column, 
  proposals, 
  onEditProposal, 
  onDelete 
}: { 
  column: typeof statusColumns[0]
  proposals: ProposalWithClient[]
  onEditProposal: (proposal: ProposalWithClient) => void
  onDelete: (proposal: ProposalWithClient) => void
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
  })

  const Icon = column.icon

  return (
    <div className="space-y-4">
      <Card className={`p-4 ${column.bgColor} border-0`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`h-3 w-3 rounded-full ${column.color}`}></div>
            <h3 className={`font-semibold ${column.textColor}`}>{column.title}</h3>
          </div>
          <div className={`h-8 w-8 rounded-xl ${column.bgColor} flex items-center justify-center`}>
            <Icon className={`h-4 w-4 ${column.textColor}`} />
          </div>
        </div>
        <div className="mt-2">
          <span className={`text-sm font-medium ${column.textColor}`}>
            {proposals.length} proposta{proposals.length !== 1 ? 's' : ''}
          </span>
        </div>
      </Card>
      
      <SortableContext
        items={proposals.map(p => p.id)}
        strategy={verticalListSortingStrategy}
      >
        <div 
          ref={setNodeRef}
          className={`space-y-3 min-h-[300px] p-2 rounded-lg transition-colors ${
            isOver ? 'bg-primary/5 border-2 border-dashed border-primary' : ''
          }`}
        >
          {proposals.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="text-center py-12">
                <div className="mx-auto h-12 w-12 rounded-xl bg-muted flex items-center justify-center mb-4">
                  <FileText className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground">
                  Nenhuma proposta nesta coluna
                </p>
              </CardContent>
            </Card>
          ) : (
            proposals.map((proposal) => (
              <ProposalCard
                key={proposal.id}
                proposal={proposal}
                onEdit={() => onEditProposal(proposal)}
                onDelete={() => onDelete(proposal)}
              />
            ))
          )}
        </div>
      </SortableContext>
    </div>
  )
}

export function ProposalsKanban({ onEditProposal, searchTerm = '' }: ProposalsKanbanProps) {
  const { proposals, getFilteredProposals, proposalsByStatus, loading, updateProposalStatus, deleteProposal } = useProposalsOptimized()
  const { toast } = useToast()
  const [activeId, setActiveId] = useState<string | null>(null)
  const [draggedProposal, setDraggedProposal] = useState<Proposal | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  )

  const filteredProposals = useMemo(() => {
    return getFilteredProposals(searchTerm)
  }, [getFilteredProposals, searchTerm])

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event
    setActiveId(active.id as string)
    const proposal = proposals.find(p => p.id === active.id)
    setDraggedProposal(proposal || null)
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    setActiveId(null)
    setDraggedProposal(null)

    if (!over) {
      return
    }

    const proposal = proposals.find(p => p.id === active.id)
    if (!proposal) {
      return
    }

    // Verificar se o over.id é um status válido ou se é o ID de uma proposta
    const validStatuses = ['Aberto', 'Em negociação', 'Fechado']
    let newStatus: 'Aberto' | 'Em negociação' | 'Fechado'

    if (validStatuses.includes(over.id as string)) {
      // Se over.id é um status válido, usar diretamente
      newStatus = over.id as 'Aberto' | 'Em negociação' | 'Fechado'
    } else {
      // Se over.id é o ID de uma proposta, encontrar a coluna de destino
      const targetProposal = proposals.find(p => p.id === over.id)
      if (targetProposal) {
        newStatus = targetProposal.status
      } else {
        return
      }
    }
    
    if (proposal.status !== newStatus) {
      try {
        await updateProposalStatus(proposal.id, newStatus)
        toast({
          title: 'Sucesso!',
          description: `Proposta movida para ${newStatus.toLowerCase()}.`,
        })
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Erro ao atualizar status da proposta.'
        toast({
          title: 'Erro',
          description: errorMessage,
          variant: 'destructive',
        })
      }
    }
  }

  const handleDelete = async (proposal: Proposal) => {
    if (confirm(`Tem certeza que deseja excluir a proposta "${proposal.title}"?`)) {
      try {
        await deleteProposal(proposal.id)
        toast({
          title: 'Sucesso!',
          description: 'Proposta excluída com sucesso.',
        })
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Erro ao excluir proposta.'
        toast({
          title: 'Erro',
          description: errorMessage,
          variant: 'destructive',
        })
      }
    }
  }

  if (loading) {
    return (
      <div className="grid gap-6 md:grid-cols-3">
        {statusColumns.map((column) => (
          <div key={column.id} className="space-y-4">
            <Card className="p-4">
              <div className="flex items-center gap-3 mb-4">
                <div className={`h-3 w-3 rounded-full ${column.color}`}></div>
                <h3 className="font-semibold">{column.title}</h3>
                <div className="h-6 w-6 bg-muted rounded-full animate-pulse"></div>
              </div>
            </Card>
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader className="pb-3">
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-3 bg-muted rounded w-2/3"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (filteredProposals.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-16">
          <div className="mx-auto h-16 w-16 rounded-2xl bg-muted flex items-center justify-center mb-6">
            <FileText className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold mb-2">
            {searchTerm ? 'Nenhuma proposta encontrada' : 'Nenhuma proposta ainda'}
          </h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            {searchTerm 
              ? 'Tente ajustar sua busca ou filtros para encontrar o que procura.'
              : 'Comece criando sua primeira proposta para organizar seu pipeline.'
            }
          </p>
          {!searchTerm && (
            <Button size="lg">
              <FileText className="mr-2 h-5 w-5" />
              Criar Primeira Proposta
            </Button>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="grid gap-6 md:grid-cols-3">
        {statusColumns.map((column) => {
          const columnProposals = proposalsByStatus[column.id] || []
          
          return (
            <DroppableColumn
              key={column.id}
              column={column}
              proposals={columnProposals}
              onEditProposal={onEditProposal}
              onDelete={handleDelete}
            />
          )
        })}
      </div>

      <DragOverlay>
        {draggedProposal ? (
          <ProposalCard
            proposal={draggedProposal}
            onEdit={() => {}}
            onDelete={() => {}}
            isDragging
          />
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}
