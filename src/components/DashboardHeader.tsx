import { SidebarTrigger } from "@/components/ui/sidebar";
import { Bell, Settings, User, Activity } from "lucide-react";
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
    <header className="h-20 border-b border-slate-200/60 bg-gradient-to-r from-slate-50 to-white flex items-center justify-between px-6 shadow-sm sticky top-0 z-40 backdrop-blur-sm">
      <div className="flex items-center gap-3">
        <SidebarTrigger className="text-slate-600 hover:text-slate-800 transition-colors" />
        <h1 className="text-lg font-black text-slate-800 tracking-tight">
          Panorama Assistencial e Estratégico – Psiquiatria
        </h1>
      </div>

      <div className="flex items-center gap-1 lg:gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="flex items-center gap-1 lg:gap-2 h-8 lg:h-10 px-2 lg:px-3">
              <Avatar className="h-6 w-6 lg:h-8 lg:w-8">
                <AvatarFallback className="bg-primary text-primary-foreground text-xs lg:text-sm">
                  U
                </AvatarFallback>
              </Avatar>
              <span className="text-xs lg:text-sm font-medium text-foreground hidden sm:inline">Usuário</span>
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