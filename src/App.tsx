import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { DashboardLayout } from "./components/DashboardLayout";
import { ThemeProvider } from "./contexts/ThemeContext";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import PerfilEpidemiologico from "./pages/PerfilEpidemiologico";
import IndicadoresAssistenciais from "./pages/IndicadoresAssistenciais";
import Procedencia from "./pages/Procedencia";
import Interconsultas from "./pages/Interconsultas";
import SobreServico from "./pages/SobreServico";
import QualidadeSatisfacao from "./pages/QualidadeSatisfacao";

import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <DashboardLayout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/indicadores-assistenciais" element={<IndicadoresAssistenciais />} />
              <Route path="/perfil-epidemiologico" element={<PerfilEpidemiologico />} />
              <Route path="/procedencia" element={<Procedencia />} />
              <Route path="/interconsultas" element={<Interconsultas />} />
              <Route path="/qualidade-satisfacao" element={<QualidadeSatisfacao />} />
              <Route path="/sobre-servico" element={<SobreServico />} />
              
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </DashboardLayout>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
