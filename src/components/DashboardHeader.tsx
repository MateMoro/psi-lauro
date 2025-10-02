import { SidebarTrigger } from "@/components/ui/sidebar";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HospitalSelector } from "./HospitalSelector";
export function DashboardHeader() {

  return (
    <header className="h-20 border-b border-slate-200/60 bg-gradient-to-r from-slate-50 to-white flex items-center justify-between px-6 shadow-sm sticky top-0 z-40 backdrop-blur-sm">
      <div className="flex items-center gap-2 md:gap-3">
        <SidebarTrigger className="text-slate-600 hover:text-slate-800 transition-colors" />
        <h1 className="text-base md:text-lg font-black text-slate-800 tracking-tight">
          IntegraRAPS<span className="hidden md:inline"> – Inteligência Analítica</span>
        </h1>
      </div>

      <div className="flex items-center gap-1 md:gap-2">
        {/* Emergency Logout Button - Visible on all devices */}
        <Button
          onClick={() => {
            console.log('🚨 EMERGENCY LOGOUT CLICKED');
            localStorage.clear();
            sessionStorage.clear();
            document.cookie.split(";").forEach(function(c) { document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); });
            window.location.href = '/login';
          }}
          variant="outline"
          size="sm"
          className="flex border-slate-300 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
        >
          <LogOut className="h-4 w-4" />
          <span className="hidden md:inline ml-1">SAIR</span>
        </Button>

        <div className="flex">
          <HospitalSelector />
        </div>

      </div>
    </header>
  );
}