import { SidebarTrigger } from "@/components/ui/sidebar";
import { Bell, Settings, User, Activity, LogOut } from "lucide-react";
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
import { HospitalSelector } from "./HospitalSelector";
import { useAuth } from "@/hooks/useAuth";
import { getRoleDisplayName, canAccessSettings } from "@/utils/permissions";
import { useNavigate } from "react-router-dom";
export function DashboardHeader() {
  const { user, profile, getUserRole, signOut } = useAuth();
  const navigate = useNavigate();
  
  const userRole = getUserRole();
  const displayName = profile?.nome || (user?.email?.split('@')[0]) || 'Usuário';
  const userInitials = displayName
    .split(' ')
    .map(name => name.charAt(0))
    .join('')
    .toUpperCase()
    .substring(0, 2);

  const handleLogout = async () => {
    console.log('🚪 DashboardHeader: Logout clicked from dropdown');
    try {
      console.log('🔄 DashboardHeader: Calling signOut...');
      await signOut();
      console.log('✅ DashboardHeader: SignOut successful, navigating...');
      navigate('/login', { replace: true });
      
      // Fallback
      setTimeout(() => {
        console.log('🔄 DashboardHeader: Fallback redirect');
        window.location.href = '/login';
      }, 1000);
    } catch (error) {
      console.error('❌ DashboardHeader: Logout error:', error);
      // Force redirect even on error
      window.location.href = '/login';
    }
  };

  const handleSettings = () => {
    if (canAccessSettings(userRole)) {
      navigate('/configuracoes');
    }
  };

  const handleProfile = () => {
    navigate('/perfil');
  };

  return (
    <header className="h-20 border-b border-slate-200/60 bg-gradient-to-r from-slate-50 to-white flex items-center justify-between px-6 shadow-sm sticky top-0 z-40 backdrop-blur-sm">
      <div className="flex items-center gap-3">
        <SidebarTrigger className="text-slate-600 hover:text-slate-800 transition-colors" />
        <h1 className="text-lg font-black text-slate-800 tracking-tight">
          IntegraRAPS – Ferramenta de Apoio à Rede de Atenção Psicossocial
        </h1>
      </div>

      <div className="flex items-center gap-1 lg:gap-2">
        {/* Emergency Logout Button */}
        <Button
          onClick={() => {
            console.log('🚨 EMERGENCY LOGOUT CLICKED');
            localStorage.clear();
            sessionStorage.clear();
            document.cookie.split(";").forEach(function(c) { document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); });
            window.location.href = '/login';
          }}
          variant="destructive"
          size="sm"
          className="bg-red-600 hover:bg-red-700 text-white"
        >
          <LogOut className="h-4 w-4 mr-1" />
          SAIR
        </Button>
        
        <div className="hidden md:block mr-4">
          <HospitalSelector />
        </div>
        
        {user && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="flex items-center gap-1 lg:gap-2 h-8 lg:h-10 px-2 lg:px-3 hover:bg-slate-100">
                <Avatar className="h-6 w-6 lg:h-8 lg:w-8">
                  <AvatarFallback className="bg-gradient-to-br from-blue-600 to-indigo-600 text-white text-xs lg:text-sm font-semibold">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden sm:flex flex-col items-start">
                  <span className="text-xs lg:text-sm font-medium text-slate-800 leading-tight">
                    {displayName.split(' ').slice(0, 2).join(' ')}
                  </span>
                  {userRole && (
                    <span className="text-xs text-slate-500 leading-tight">
                      {getRoleDisplayName(userRole)}
                    </span>
                  )}
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{displayName}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user.email}
                  </p>
                  {userRole && (
                    <p className="text-xs leading-none text-muted-foreground">
                      {getRoleDisplayName(userRole)}
                    </p>
                  )}
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleProfile}>
                <User className="mr-2 h-4 w-4" />
                <span>Perfil</span>
              </DropdownMenuItem>
              {canAccessSettings(userRole) && (
                <DropdownMenuItem onClick={handleSettings}>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Configurações</span>
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="text-red-600 focus:text-red-600 focus:bg-red-50"
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sair</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </header>
  );
}