import { SidebarTrigger } from "@/components/ui/sidebar";
import { Bell, Settings, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
export function DashboardHeader() {
  return (
    <header className="h-18 sm:h-24 border-b border-border bg-card flex items-center justify-between px-2 sm:px-4 md:px-6 shadow-soft">
      <div className="flex items-center">
        <SidebarTrigger className="text-muted-foreground hover:text-foreground mr-2 sm:mr-4" />
      </div>
      
      <div className="text-center flex-1 px-1 sm:px-2 md:px-4 max-w-4xl">
        <h1 className="font-bold text-primary tracking-tight leading-tight" 
            style={{ fontSize: 'clamp(1.4rem, 3vw, 2rem)' }}>
          <span className="block sm:inline">Painel de Internações Psiquiátricas</span>
          <span className="hidden sm:inline"> – </span>
          <span className="block sm:inline">Hospital Planalto</span>
        </h1>
      </div>

      <div className="flex items-center gap-1 sm:gap-2">
        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground h-7 w-7 sm:h-8 sm:w-8">
          <Bell className="h-4 w-4" />
        </Button>
        
        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground h-7 w-7 sm:h-8 sm:w-8">
          <Settings className="h-4 w-4" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-1 sm:gap-2 h-auto py-1 sm:py-2 px-2 sm:px-3">
              <Avatar className="h-6 w-6 sm:h-8 sm:w-8">
                <AvatarFallback className="bg-primary text-primary-foreground text-xs sm:text-sm">
                  U
                </AvatarFallback>
              </Avatar>
              <span className="text-xs sm:text-sm font-medium text-foreground hidden sm:inline">Usuário</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              Perfil
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              Configurações
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive">
              Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}