'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, FileText, DollarSign, User, Target } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useProposalsOptimized } from '@/hooks/use-proposals-optimized'
import { useClients } from '@/hooks/use-clients'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/contexts/auth-context'
import { proposalSchema, type ProposalFormData } from '@/lib/schemas'
import { Proposal } from '@/types/database'

interface ProposalFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  proposal?: Proposal | null
}

export function ProposalForm({ open, onOpenChange, proposal }: ProposalFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { addProposal, updateProposal } = useProposalsOptimized()
  const { clients } = useClients()
  const { toast } = useToast()
  const { user } = useAuth()

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProposalFormData>({
    resolver: zodResolver(proposalSchema),
    defaultValues: {
      title: '',
      amount: 0,
      status: 'Aberto' as const,
      client_id: '',
    },
  })

  const selectedClientId = watch('client_id')

  // Reset form when proposal changes
  useEffect(() => {
    if (proposal) {
      reset({
        title: proposal.title,
        amount: proposal.amount,
        status: proposal.status,
        client_id: proposal.client_id,
      })
    } else {
      reset({
        title: '',
        amount: 0,
        status: 'Aberto',
        client_id: '',
      })
    }
  }, [proposal, reset])

  const onSubmit = async (data: ProposalFormData) => {
    try {
      setIsLoading(true)
      
      if (proposal) {
        await updateProposal(proposal.id, data)
        toast({
          title: 'Sucesso!',
          description: 'Proposta atualizada com sucesso.',
        })
             } else {
               await addProposal(data)
        toast({
          title: 'Sucesso!',
          description: 'Proposta criada com sucesso.',
        })
      }
      
      onOpenChange(false)
      reset()
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao salvar proposta.'
      toast({
        title: 'Erro',
        description: errorMessage,
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      reset()
    }
    onOpenChange(open)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-xl">
                {proposal ? 'Editar Proposta' : 'Nova Proposta'}
              </DialogTitle>
              <DialogDescription className="text-sm">
                {proposal 
                  ? 'Atualize as informações da proposta.' 
                  : 'Crie uma nova proposta para um cliente.'
                }
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-medium flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Título *
            </Label>
            <Input
              id="title"
              placeholder="Título da proposta"
              {...register('title')}
              disabled={isLoading}
              className="h-12"
            />
            {errors.title && (
              <p className="text-sm text-destructive">{errors.title.message}</p>
            )}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="amount" className="text-sm font-medium flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Valor *
              </Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                placeholder="0.00"
                {...register('amount', { valueAsNumber: true })}
                disabled={isLoading}
                className="h-12"
              />
              {errors.amount && (
                <p className="text-sm text-destructive">{errors.amount.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="status" className="text-sm font-medium flex items-center gap-2">
                <Target className="h-4 w-4" />
                Status
              </Label>
              <Select
                value={watch('status')}
                onValueChange={(value: 'Aberto' | 'Em negociação' | 'Fechado') => setValue('status', value)}
                disabled={isLoading}
              >
                <SelectTrigger className="h-12">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Aberto">Aberto</SelectItem>
                  <SelectItem value="Em negociação">Em negociação</SelectItem>
                  <SelectItem value="Fechado">Fechado</SelectItem>
                </SelectContent>
              </Select>
              {errors.status && (
                <p className="text-sm text-destructive">{errors.status.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="client_id" className="text-sm font-medium flex items-center gap-2">
              <User className="h-4 w-4" />
              Cliente *
            </Label>
            <Select
              value={selectedClientId}
              onValueChange={(value) => setValue('client_id', value)}
              disabled={isLoading}
            >
              <SelectTrigger className="h-12">
                <SelectValue placeholder="Selecione um cliente" />
              </SelectTrigger>
              <SelectContent>
                {clients.map((client) => (
                  <SelectItem key={client.id} value={client.id}>
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-6 rounded-lg bg-muted flex items-center justify-center">
                        <User className="h-3 w-3" />
                      </div>
                      <div>
                        <div className="font-medium">{client.name}</div>
                        <div className="text-xs text-muted-foreground">{client.email}</div>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.client_id && (
              <p className="text-sm text-destructive">{errors.client_id.message}</p>
            )}
          </div>

          <DialogFooter className="gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isLoading}
              className="h-12"
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading} className="h-12">
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {proposal ? 'Atualizar Proposta' : 'Criar Proposta'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
