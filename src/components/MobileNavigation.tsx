import { BarChart3, Users, Activity, MoreHorizontal, Building2, RefreshCw, UserPlus, GitCompare, Bell, Settings } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/useAuth";
import { canAccessPage } from "@/utils/permissions";

const primaryNavItems = [
  {
    title: "Visão Geral",
    url: "/dashboard",
    icon: BarChart3
  },
  {
    title: "Indicadores",
    url: "/indicadores-assistenciais",
    icon: Activity
  },
  {
    title: "Perfil",
    url: "/perfil-epidemiologico",
    icon: Users
  },
  {
    title: "Reinternações",
    url: "/reinternacoes",
    icon: RefreshCw
  }
];

const secondaryNavItems = [
  {
    title: "CAPS – Comparações",
    url: "/caps-comparacoes",
    icon: GitCompare
  },
  {
    title: "Pacientes",
    url: "/pacientes",
    icon: UserPlus
  },
  {
    title: "Notificações",
    url: "/notificacoes",
    icon: Bell
  },
  {
    title: "Sobre IntegraRAPS",
    url: "/sobre-integraraps",
    icon: Building2
  },
  {
    title: "Configurações",
    url: "/configuracoes",
    icon: Settings
  },
];

export function MobileNavigation() {
  const location = useLocation();
  const currentPath = location.pathname;
  const { getUserRole } = useAuth();

  const userRole = getUserRole();

  // Filter navigation items based on user role
  const accessiblePrimaryItems = primaryNavItems.filter(item =>
    canAccessPage(userRole, item.url)
  );

  const accessibleSecondaryItems = secondaryNavItems.filter(item =>
    canAccessPage(userRole, item.url)
  );

  const isActive = (path: string) => currentPath === path;
  const isSecondaryActive = accessibleSecondaryItems.some(item => isActive(item.url));

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-1 py-2 z-50 lg:hidden shadow-lg">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {accessiblePrimaryItems.map((item) => (
          <NavLink
            key={item.title}
            to={item.url}
            className={`flex flex-col items-center gap-1 px-2 py-1 rounded-lg min-w-0 flex-1 transition-all duration-200 ${
              isActive(item.url)
                ? "text-blue-600 bg-blue-50"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
            }`}
          >
            <item.icon className="h-5 w-5 flex-shrink-0" />
            <span className="text-xs font-medium truncate w-full text-center">
              {item.title}
            </span>
          </NavLink>
        ))}

        {/* More menu */}
        {accessibleSecondaryItems.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className={`flex flex-col items-center gap-1 px-2 py-1 h-auto min-w-0 flex-1 transition-all duration-200 ${
                  isSecondaryActive
                    ? "text-blue-600 bg-blue-50"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                <MoreHorizontal className="h-5 w-5 flex-shrink-0" />
                <span className="text-xs font-medium truncate w-full text-center">
                  Mais
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52 mb-2 max-h-96 overflow-y-auto">
              {accessibleSecondaryItems.map((item) => (
                <DropdownMenuItem key={item.title} asChild>
                  <NavLink
                    to={item.url}
                    className={`flex items-center gap-2 w-full ${
                      isActive(item.url) ? "bg-blue-50 text-blue-600" : ""
                    }`}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.title}
                  </NavLink>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </nav>
  );
}