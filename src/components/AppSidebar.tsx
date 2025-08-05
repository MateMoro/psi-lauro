import { Home, BarChart3, Users, RefreshCw, Activity, TrendingUp, Stethoscope, Download } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
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

const navigationItems = [
  { 
    title: "Início", 
    url: "/", 
    icon: Home,
    description: "Tela inicial do sistema"
  },
  { 
    title: "Dashboard", 
    url: "/dashboard", 
    icon: BarChart3,
    description: "Visão geral dos dados e indicadores"
  },
  { 
    title: "Reinternações", 
    url: "/reinternacoes", 
    icon: RefreshCw,
    description: "Análise de pacientes com múltiplas internações"
  },
  { 
    title: "Tendências", 
    url: "/tendencias", 
    icon: TrendingUp,
    description: "Insights automáticos e análises clínicas"
  },
  { 
    title: "Sobre o Serviço", 
    url: "/sobre-servico", 
    icon: Stethoscope,
    description: "Informações institucionais e contexto"
  },
  { 
    title: "Exportar", 
    url: "/exportar", 
    icon: Download,
    description: "Gerar relatórios para download"
  },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;
  const collapsed = state === "collapsed";

  const isActive = (path: string) => currentPath === path;
  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive 
      ? "bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-semibold shadow-lg shadow-blue-500/25 rounded-xl border-0" 
      : "hover:bg-gradient-to-r hover:from-slate-100 hover:to-blue-50 text-slate-700 hover:text-slate-900 rounded-xl transition-all duration-200 hover:shadow-md";

  return (
    <Sidebar className={collapsed ? "w-16" : "w-72"} collapsible="icon">
      <SidebarContent className="bg-gradient-to-b from-slate-50 to-white border-r border-slate-200/60 backdrop-blur-sm">
        <div className="p-6 border-b border-slate-200/60">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 rounded-2xl shadow-xl shadow-blue-500/25 backdrop-blur-sm">
              <Activity className="h-7 w-7 text-white drop-shadow-sm" />
            </div>
            {!collapsed && (
              <div>
                <h2 className="text-xl font-black text-slate-800 tracking-tight">PSI Analytics</h2>
                <p className="text-sm text-slate-600 font-semibold">Hospital Planalto</p>
              </div>
            )}
          </div>
        </div>

        <SidebarGroup className="px-4 py-6">
          <SidebarGroupLabel className="text-slate-500 font-bold text-xs uppercase tracking-wider mb-4">
            {!collapsed && "Navegação Principal"}
          </SidebarGroupLabel>
          
          <SidebarGroupContent>
            <SidebarMenu className="space-y-3">
              {navigationItems.map((item) => (
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
                            <span className="font-bold text-sm tracking-wide">{item.title}</span>
                            <span className="text-xs opacity-75 truncate w-full">
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
      </SidebarContent>
    </Sidebar>
  );
}