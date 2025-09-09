import { Home, BarChart3, Users, RefreshCw, Activity, TrendingUp, Stethoscope, MapPin, MessageCircle, Building2, Star, Settings, LogOut, Download, GitCompare, Bell, UserPlus } from "lucide-react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useAuth } from "@/hooks/useAuth";
import { canAccessPage, getRoleDisplayName } from "@/utils/permissions";

const navigationItems = [
  { 
    title: "Visão Geral", 
    url: "/dashboard", 
    icon: BarChart3,
    description: "Dashboard principal com métricas gerais"
  },
  { 
    title: "Indicadores Assistenciais", 
    url: "/indicadores-assistenciais", 
    icon: Activity,
    description: "Métricas de qualidade e desempenho"
  },
  { 
    title: "Perfil Epidemiológico", 
    url: "/perfil-epidemiologico", 
    icon: Users,
    description: "Características demográficas dos pacientes"
  },
  { 
    title: "CAPS – Comparações e Rankings", 
    url: "/caps-comparacoes", 
    icon: GitCompare,
    description: "Comparações entre CAPS e rankings"
  },
  { 
    title: "Reinternações e Risco", 
    url: "/reinternacoes", 
    icon: RefreshCw,
    description: "Análise de reinternações e fatores de risco"
  },
  { 
    title: "Pacientes", 
    url: "/pacientes", 
    icon: UserPlus,
    description: "Gestão e visualização de pacientes"
  },
  { 
    title: "Central de Notificações", 
    url: "/notificacoes", 
    icon: Bell,
    description: "Alertas e notificações do sistema"
  },
  { 
    title: "Sobre o IntegraRAPS", 
    url: "/sobre-integraraps", 
    icon: Building2,
    description: "Informações sobre o sistema IntegraRAPS"
  },
  { 
    title: "Configurações", 
    url: "/configuracoes", 
    icon: Settings,
    description: "Configurações do sistema (apenas coordenador)"
  },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, getUserRole, profile, signOut } = useAuth();
  const currentPath = location.pathname;
  const collapsed = state === "collapsed";

  const userRole = getUserRole();
  
  // Filter navigation items based on user role
  const accessibleItems = navigationItems.filter(item => 
    canAccessPage(userRole, item.url)
  );

  const handleLogout = async () => {
    console.log('🚪 AppSidebar: Logout button clicked');
    try {
      console.log('🔄 AppSidebar: Calling signOut...');
      await signOut();
      console.log('✅ AppSidebar: SignOut successful');
      
      // Try multiple redirect methods
      console.log('🎯 AppSidebar: Attempting redirect to /login');
      
      // Method 1: React Router navigate
      navigate('/login', { replace: true });
      
      // Method 2: Force reload after a delay (fallback)
      setTimeout(() => {
        console.log('🔄 AppSidebar: Fallback redirect with window.location');
        window.location.href = '/login';
      }, 1000);
      
    } catch (error) {
      console.error('❌ AppSidebar: Logout error:', error);
      // Even if signOut fails, try to redirect
      console.log('🚨 AppSidebar: Force redirect despite error');
      window.location.href = '/login';
    }
  };

  const isActive = (path: string) => currentPath === path;
  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive 
      ? "bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-semibold shadow-lg shadow-blue-500/25 rounded-xl border-0" 
      : "hover:bg-gradient-to-r hover:from-slate-100 hover:to-blue-50 text-slate-700 hover:text-slate-900 rounded-xl transition-all duration-200 hover:shadow-md";

  return (
    <Sidebar 
      className={`${collapsed ? "w-16" : "w-72"}`} 
      collapsible="icon"
    >
      <SidebarContent className="bg-gradient-to-b from-slate-50 to-white border-r border-slate-200/60 backdrop-blur-sm h-full">
        <div className="p-6 border-b border-slate-200/60">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 rounded-2xl shadow-xl shadow-blue-500/25 backdrop-blur-sm">
              <Activity className="h-7 w-7 text-white drop-shadow-sm" />
            </div>
            {!collapsed && (
              <div className="flex flex-col">
                <h2 className="text-lg font-black text-slate-800 tracking-tight leading-tight">IntegraRAPS</h2>
                <p className="text-sm text-slate-600 font-medium">Hospital Planalto e CAPS</p>
                {user && userRole && (
                  <div className="mt-1">
                    <p className="text-xs text-slate-600 font-medium">
                      {profile?.nome || user.email}
                    </p>
                    <p className="text-xs text-slate-500">
                      {getRoleDisplayName(userRole)}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <SidebarGroup className="px-4 py-6">
          <SidebarGroupLabel className="text-slate-500 font-bold text-xs uppercase tracking-wider mb-4">
            {!collapsed && "NAVEGAÇÃO PRINCIPAL"}
          </SidebarGroupLabel>
          
          <SidebarGroupContent>
            <SidebarMenu className="space-y-3">
              {accessibleItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className="h-14 px-4">
                    <NavLink 
                      to={item.url} 
                      end 
                      className={getNavCls({ isActive: isActive(item.url) })}
                    >
                      <div className="flex items-center gap-4 w-full">
                        <item.icon className="h-6 w-6 flex-shrink-0" />
                        {!collapsed && (
                          <div className="flex flex-col items-start flex-1 min-w-0">
                            <span className="font-bold text-sm tracking-wide leading-tight">{item.title}</span>
                            <span className="text-xs opacity-75 truncate w-full mt-0.5">
                              {item.description}
                            </span>
                          </div>
                        )}
                      </div>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Logout Button */}
        {user && (
          <div className="mt-auto px-4 py-6 border-t border-slate-200/60">
            <button
              onClick={handleLogout}
              className="flex items-center gap-4 w-full p-3 text-slate-700 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200 hover:shadow-md"
            >
              <LogOut className="h-5 w-5 flex-shrink-0" />
              {!collapsed && (
                <span className="font-medium text-sm">Sair</span>
              )}
            </button>
          </div>
        )}
      </SidebarContent>
    </Sidebar>
  );
}