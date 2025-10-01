export interface Database {
  public: {
    Tables: {
      clients: {
        Row: {
          id: string
          user_id: string
          name: string
          email: string
          phone: string | null
          company: string | null
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          email: string
          phone?: string | null
          company?: string | null
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          email?: string
          phone?: string | null
          company?: string | null
          notes?: string | null
          created_at?: string
        }
      }
      proposals: {
        Row: {
          id: string
          user_id: string
          client_id: string
          title: string
          amount: string
          status: 'Aberto' | 'Em negociação' | 'Fechado'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          client_id: string
          title: string
          amount: string
          status?: 'Aberto' | 'Em negociação' | 'Fechado'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          client_id?: string
          title?: string
          amount?: string
          status?: 'Aberto' | 'Em negociação' | 'Fechado'
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}

export type Client = Database['public']['Tables']['clients']['Row']
export type ClientInsert = Database['public']['Tables']['clients']['Insert']
export type ClientUpdate = Database['public']['Tables']['clients']['Update']

export type Proposal = Database['public']['Tables']['proposals']['Row']
export type ProposalInsert = Database['public']['Tables']['proposals']['Insert']
export type ProposalUpdate = Database['public']['Tables']['proposals']['Update']

// Extended types with relations
export type ProposalWithClient = Proposal & {
  clients?: {
    id: string
    name: string
    email: string
    company?: string | null
  } | null
}