'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, User, Mail, Phone, Building, FileText } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useClientsOptimized } from '@/hooks/use-clients-optimized'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/contexts/auth-context'
import { clientSchema, type ClientFormData } from '@/lib/schemas'
import { Client } from '@/types/database'

interface ClientFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  client?: Client | null
}

export function ClientForm({ open, onOpenChange, client }: ClientFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { addClient, updateClient } = useClientsOptimized()
  const { toast } = useToast()
  const { user } = useAuth()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      company: '',
      notes: '',
    },
  })

  // Reset form when client changes
  useEffect(() => {
    if (client) {
      reset({
        name: client.name,
        email: client.email,
        phone: client.phone || '',
        company: client.company || '',
        notes: client.notes || '',
      })
    } else {
      reset({
        name: '',
        email: '',
        phone: '',
        company: '',
        notes: '',
      })
    }
  }, [client, reset])

  const onSubmit = async (data: ClientFormData) => {
    try {
      setIsLoading(true)
      
      if (client) {
        await updateClient(client.id, data)
        toast({
          title: 'Sucesso!',
          description: 'Cliente atualizado com sucesso.',
        })
             } else {
               await addClient(data)
        toast({
          title: 'Sucesso!',
          description: 'Cliente criado com sucesso.',
        })
      }
      
      onOpenChange(false)
      reset()
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao salvar cliente.'
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
              <User className="h-5 w-5 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-xl">
                {client ? 'Editar Cliente' : 'Novo Cliente'}
              </DialogTitle>
              <DialogDescription className="text-sm">
                {client 
                  ? 'Atualize as informações do cliente.' 
                  : 'Adicione um novo cliente ao seu CRM.'
                }
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium flex items-center gap-2">
                <User className="h-4 w-4" />
                Nome *
              </Label>
              <Input
                id="name"
                placeholder="Nome do cliente"
                {...register('name')}
                disabled={isLoading}
                className="h-12"
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email *
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="email@exemplo.com"
                {...register('email')}
                disabled={isLoading}
                className="h-12"
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-sm font-medium flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Telefone
              </Label>
              <Input
                id="phone"
                placeholder="(11) 99999-9999"
                {...register('phone')}
                disabled={isLoading}
                className="h-12"
              />
              {errors.phone && (
                <p className="text-sm text-destructive">{errors.phone.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="company" className="text-sm font-medium flex items-center gap-2">
                <Building className="h-4 w-4" />
                Empresa
              </Label>
              <Input
                id="company"
                placeholder="Nome da empresa"
                {...register('company')}
                disabled={isLoading}
                className="h-12"
              />
              {errors.company && (
                <p className="text-sm text-destructive">{errors.company.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes" className="text-sm font-medium flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Observações
            </Label>
            <Textarea
              id="notes"
              placeholder="Observações sobre o cliente..."
              {...register('notes')}
              disabled={isLoading}
              className="min-h-[100px]"
            />
            {errors.notes && (
              <p className="text-sm text-destructive">{errors.notes.message}</p>
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
              {client ? 'Atualizar Cliente' : 'Criar Cliente'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
