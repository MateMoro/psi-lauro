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
    description: ""
  },
  { 
    title: "Dados e Indicadores", 
    url: "/dashboard", 
    icon: BarChart3,
    description: ""
  },
  { 
    title: "Reinternações", 
    url: "/reinternacoes", 
    icon: RefreshCw,
    description: ""
  },
  { 
    title: "Tendências", 
    url: "/tendencias", 
    icon: TrendingUp,
    description: ""
  },
  { 
    title: "Sobre o Serviço", 
    url: "/sobre-servico", 
    icon: Stethoscope,
    description: ""
  },
  { 
    title: "Exportar", 
    url: "/exportar", 
    icon: Download,
    description: ""
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
      ? "bg-primary text-primary-foreground font-medium shadow-soft" 
      : "hover:bg-muted/50 text-foreground";

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

        <SidebarGroup className="px-2 py-4">
          <SidebarGroupLabel className="text-muted-foreground font-medium mb-2">
            {!collapsed && "Navegação"}
          </SidebarGroupLabel>
          
          <SidebarGroupContent>
            <SidebarMenu className="space-y-2">
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className="h-12">
                    <NavLink 
                      to={item.url} 
                      end 
                      className={getNavCls({ isActive: isActive(item.url) })}
                    >
                      <item.icon className="h-5 w-5" />
                      {!collapsed && (
                        <span className="font-medium">{item.title}</span>
                      )}
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