'use client'

import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { useSidebar } from '@/contexts/sidebar-context'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { 
  LogOut, 
  User, 
  Settings, 
  Menu,
  ChevronDown
} from 'lucide-react'

export function Navbar() {
  const { user, signOut } = useAuth()
  const { isOpen, toggle } = useSidebar()
  const router = useRouter()

  const handleSignOut = async () => {
    try {
      await signOut()
      router.push('/login')
    } catch (error) {
      console.error('Erro ao fazer logout:', error)
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="flex h-16 items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon-sm"
            className="hover:bg-accent"
            onClick={toggle}
          >
            <Menu className="h-4 w-4" />
          </Button>
          
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-xl bg-primary flex items-center justify-center shadow-sm">
              <span className="text-primary-foreground font-semibold text-sm">F</span>
            </div>
            <span className="font-semibold text-lg tracking-tight">FreelCRM</span>
          </div>
        </div>

               <div className="flex items-center gap-2">
                 <ThemeToggle />
                 
                 <DropdownMenu>
                   <DropdownMenuTrigger asChild>
                     <Button 
                       variant="ghost" 
                       className="h-9 px-3 gap-2 hover:bg-accent"
                     >
                       <div className="h-6 w-6 rounded-lg bg-muted flex items-center justify-center">
                         <User className="h-3 w-3" />
                       </div>
                       <span className="text-sm font-medium">{user?.email?.split('@')[0]}</span>
                       <ChevronDown className="h-3 w-3 opacity-50" />
                     </Button>
                   </DropdownMenuTrigger>
                   <DropdownMenuContent align="end" className="w-64">
                     <div className="flex items-center gap-3 p-3">
                       <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center">
                         <User className="h-4 w-4" />
                       </div>
                       <div className="flex flex-col space-y-1">
                         <p className="text-sm font-medium">{user?.email}</p>
                         <p className="text-xs text-muted-foreground">
                           Freelancer
                         </p>
                       </div>
                     </div>
                     <DropdownMenuSeparator />
                     <DropdownMenuItem onClick={() => router.push('/profile')} className="gap-2">
                       <Settings className="h-4 w-4" />
                       Perfil
                     </DropdownMenuItem>
                     <DropdownMenuSeparator />
                     <DropdownMenuItem onClick={handleSignOut} className="gap-2 text-destructive focus:text-destructive">
                       <LogOut className="h-4 w-4" />
                       Sair
                     </DropdownMenuItem>
                   </DropdownMenuContent>
                 </DropdownMenu>
               </div>
      </div>
    </header>
  )
}
