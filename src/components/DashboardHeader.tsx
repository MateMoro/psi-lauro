import { SidebarTrigger } from "@/components/ui/sidebar";
export function DashboardHeader() {
  return (
    <header className="h-20 border-b border-border bg-card flex items-center justify-between px-4 shadow-soft relative z-[200]">
      <div className="flex items-center gap-4">
        <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
      </div>
      
      <div className="text-center flex-1 px-4">
        {/* Title removed - now appears only on Index page */}
      </div>

      <div className="flex items-center gap-3">
        {/* Header actions removed per user request */}
      </div>
    </header>
  );
}