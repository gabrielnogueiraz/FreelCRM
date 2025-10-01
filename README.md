# Mini CRM para Freelancers

Um Mini CRM moderno e funcional para freelancers gerenciarem clientes e propostas, construído com Next.js 14, TypeScript e Supabase.

## 🚀 Funcionalidades

- **Autenticação completa** com Supabase Auth
- **Gestão de clientes** com CRUD completo
- **Pipeline de propostas** com Kanban drag & drop
- **Dashboard responsivo** com estatísticas
- **Dark mode** integrado
- **Interface moderna** inspirada no Notion/Linear

## 🛠️ Stack Tecnológica

- **Frontend**: Next.js 14 (App Router), TypeScript, TailwindCSS
- **UI Components**: shadcn/ui, Radix UI
- **Backend**: Supabase (Auth, Database, Realtime)
- **Formulários**: React Hook Form + Zod
- **Drag & Drop**: @dnd-kit
- **Animações**: Framer Motion
- **Ícones**: Lucide React

## 📦 Instalação

1. **Clone o repositório**
```bash
git clone <seu-repositorio>
cd freelcrm
```

2. **Instale as dependências**
```bash
npm install
```

3. **Configure as variáveis de ambiente**
Crie um arquivo `.env.local` na raiz do projeto:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. **Configure o banco de dados**
Execute as migrações do Supabase na pasta `supabase/migrations/` para criar as tabelas e políticas de segurança.

5. **Execute o projeto**
```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000) no seu navegador.

## 🗄️ Estrutura do Banco de Dados

### Tabela `clients`
- `id` (UUID, PK)
- `user_id` (UUID, FK → auth.users.id)
- `name` (TEXT)
- `email` (TEXT)
- `phone` (TEXT, opcional)
- `company` (TEXT, opcional)
- `notes` (TEXT, opcional)
- `created_at` (TIMESTAMP)

### Tabela `proposals`
- `id` (UUID, PK)
- `user_id` (UUID, FK → auth.users.id)
- `client_id` (UUID, FK → clients.id)
- `title` (TEXT)
- `amount` (NUMERIC)
- `status` (ENUM: 'Aberto', 'Em negociação', 'Fechado')
- `created_at` (TIMESTAMP)

## 🎨 Funcionalidades Principais

### Autenticação
- Login e cadastro com email/senha
- Proteção de rotas automática
- Redirecionamento inteligente

### Dashboard
- Estatísticas em tempo real
- Cards com métricas importantes
- Layout responsivo

### Clientes
- Lista de clientes em cards
- Formulário de criação/edição
- Validação com Zod
- Exclusão com confirmação

### Propostas
- Pipeline Kanban com 3 colunas
- Drag & drop entre status
- Formulário completo
- Validação de dados

### Perfil
- Edição de informações pessoais
- Visualização de dados da conta

## 🚀 Deploy

### Vercel (Recomendado)
1. Conecte seu repositório ao Vercel
2. Configure as variáveis de ambiente
3. Deploy automático

### Outras plataformas
O projeto é compatível com qualquer plataforma que suporte Next.js.

## 🔧 Scripts Disponíveis

```bash
npm run dev          # Desenvolvimento
npm run build        # Build de produção
npm run start        # Servidor de produção
npm run lint         # Linting
```

## 📱 Responsividade

O projeto é totalmente responsivo e funciona perfeitamente em:
- Desktop
- Tablet
- Mobile

## 📄 Licença

MIT License - veja o arquivo LICENSE para detalhes.

## 🤝 Contribuição

Contribuições são bem-vindas! Sinta-se à vontade para abrir issues e pull requests.

---

Desenvolvido com ❤️ para freelancers que querem organizar seus negócios.