import { z } from 'zod'

export const clientSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  phone: z.string().optional(),
  company: z.string().optional(),
  notes: z.string().optional(),
})

export const proposalSchema = z.object({
  title: z.string().min(2, 'Título deve ter pelo menos 2 caracteres'),
  amount: z.number().min(0, 'Valor deve ser positivo'),
  status: z.enum(['Aberto', 'Em negociação', 'Fechado']),
  client_id: z.string().uuid('ID do cliente inválido'),
})

export const authSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
})

export const profileSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  avatar_url: z.string().url().optional().or(z.literal('')),
})

export type ClientFormData = z.infer<typeof clientSchema>
export type ProposalFormData = z.infer<typeof proposalSchema>
export type AuthFormData = z.infer<typeof authSchema>
export type ProfileFormData = z.infer<typeof profileSchema>
