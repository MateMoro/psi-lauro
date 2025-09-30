import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { DashboardHeader } from "./DashboardHeader";
import { DashboardFooter } from "./DashboardFooter";
import { MobileNavigation } from "./MobileNavigation";
import { HospitalProvider } from "@/contexts/HospitalContext";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <HospitalProvider>
      <SidebarProvider>
        <div className="min-h-screen flex w-full max-w-full overflow-x-hidden bg-background">
          {/* Sidebar - always present but styled differently for mobile/desktop */}
          <AppSidebar />

          <div className="flex-1 flex flex-col min-w-0 max-w-full">
            <DashboardHeader />
            <main className="flex-1 w-full max-w-full p-3 sm:p-4 md:p-6 lg:p-8 overflow-x-hidden overflow-y-auto pb-20 lg:pb-4">
              {children}
            </main>

            {/* Desktop Footer */}
            <div className="hidden lg:block">
              <DashboardFooter />
            </div>

            {/* Mobile Navigation */}
            <div className="lg:hidden">
              <MobileNavigation />
            </div>
          </div>
        </div>
      </SidebarProvider>
    </HospitalProvider>
  );
}