import { Home, BarChart3, Users, RefreshCw, Activity, TrendingUp, Info, Download, PieChart } from "lucide-react";
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

const navigationGroups = [
  {
    label: "Dados e Análises",
    items: [
      { 
        title: "Início", 
        url: "/", 
        icon: Home,
        description: "Tela inicial do sistema"
      },
      { 
        title: "Dashboard", 
        url: "/dashboard", 
        icon: PieChart,
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
      }
    ]
  },
  {
    label: "Suporte e Informações",
    items: [
      { 
        title: "Sobre o Serviço", 
        url: "/sobre-servico", 
        icon: Info,
        description: "Informações institucionais e contexto"
      },
      { 
        title: "Exportar", 
        url: "/exportar", 
        icon: Download,
        description: "Gerar relatórios para download"
      }
    ]
  }
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;
  const collapsed = state === "collapsed";

  const isActive = (path: string) => currentPath === path;
  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive 
      ? "bg-primary text-primary-foreground font-medium shadow-soft border-l-4 border-l-accent" 
      : "hover:bg-muted/50 text-foreground transition-all duration-200";

  return (
    <Sidebar className={collapsed ? "w-16" : "w-64"} collapsible="icon">
      <SidebarContent className="bg-card border-r border-border">
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-primary rounded-lg shadow-medium">
              <Activity className="h-6 w-6 text-white" />
            </div>
            {!collapsed && (
              <div>
                <h2 className="text-lg font-bold text-foreground">Sistema de Análise</h2>
                <p className="text-sm text-muted-foreground">Hospital Planalto</p>
              </div>
            )}
          </div>
        </div>

        {navigationGroups.map((group) => (
          <SidebarGroup key={group.label} className="px-2 py-3">
            <SidebarGroupLabel className="text-muted-foreground font-semibold mb-3 text-xs uppercase tracking-wide">
              {!collapsed && group.label}
            </SidebarGroupLabel>
            
            <SidebarGroupContent>
              <SidebarMenu className="space-y-1">
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild className="h-12">
                      <NavLink 
                        to={item.url} 
                        end 
                        className={getNavCls({ isActive: isActive(item.url) })}
                      >
                        <item.icon className="h-5 w-5 flex-shrink-0" />
                        {!collapsed && (
                          <div className="flex flex-col ml-3">
                            <span className="font-medium text-sm">{item.title}</span>
                            <span className="text-xs text-muted-foreground">
                              {item.description}
                            </span>
                          </div>
                        )}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
    </Sidebar>
  );
}