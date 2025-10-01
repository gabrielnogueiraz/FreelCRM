'use client'

import { useMemo } from 'react'
import { Edit, Trash2, Mail, Phone, Building, MoreHorizontal, User, Calendar } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AnimatedCard } from '@/components/ui/animated-card'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { useClientsOptimized } from '@/hooks/use-clients-optimized'
import { useToast } from '@/hooks/use-toast'
import { Client } from '@/types/database'

interface ClientsListProps {
  onEditClient: (client: Client) => void
  searchTerm?: string
}

export function ClientsList({ onEditClient, searchTerm = '' }: ClientsListProps) {
  const { getFilteredClients, loading, deleteClient } = useClientsOptimized()
  const { toast } = useToast()

  const filteredClients = useMemo(() => {
    return getFilteredClients(searchTerm)
  }, [getFilteredClients, searchTerm])

  const handleDelete = async (client: Client) => {
    if (confirm(`Tem certeza que deseja excluir o cliente ${client.name}?`)) {
      try {
        await deleteClient(client.id)
        toast({
          title: 'Sucesso!',
          description: 'Cliente excluído com sucesso.',
        })
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Erro ao excluir cliente.'
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
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-4">
              <div className="flex items-start gap-3">
                <div className="h-12 w-12 bg-muted rounded-xl"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="h-3 bg-muted rounded"></div>
                <div className="h-3 bg-muted rounded w-2/3"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (filteredClients.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-16">
          <div className="mx-auto h-16 w-16 rounded-2xl bg-muted flex items-center justify-center mb-6">
            <Building className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold mb-2">
            {searchTerm ? 'Nenhum cliente encontrado' : 'Nenhum cliente ainda'}
          </h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            {searchTerm 
              ? 'Tente ajustar sua busca ou filtros para encontrar o que procura.'
              : 'Comece adicionando seu primeiro cliente para organizar seu negócio.'
            }
          </p>
          {!searchTerm && (
            <Button size="lg">
              <User className="mr-2 h-5 w-5" />
              Adicionar Primeiro Cliente
            </Button>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {filteredClients.map((client, index) => (
        <AnimatedCard key={client.id} delay={index * 0.1} scale>
          <Card className="hover:shadow-lg transition-all duration-200 group">
            <CardHeader className="pb-4">
              <div className="flex items-start gap-3">
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <User className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-lg truncate">{client.name}</CardTitle>
                  <CardDescription className="flex items-center gap-1 mt-1">
                    <Mail className="h-3 w-3 flex-shrink-0" />
                    <span className="truncate">{client.email}</span>
                  </CardDescription>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon-sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onEditClient(client)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Editar
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={() => handleDelete(client)}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Excluir
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3">
                {client.phone && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="h-4 w-4 flex-shrink-0" />
                    <span className="truncate">{client.phone}</span>
                  </div>
                )}
                {client.company && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Building className="h-4 w-4 flex-shrink-0" />
                    <span className="truncate">{client.company}</span>
                  </div>
                )}
                {client.notes && (
                  <div className="pt-2 border-t border-border">
                    <p className="text-xs text-muted-foreground line-clamp-2">{client.notes}</p>
                  </div>
                )}
                <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2">
                  <Calendar className="h-3 w-3" />
                  <span>Adicionado recentemente</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </AnimatedCard>
      ))}
    </div>
  )
}
