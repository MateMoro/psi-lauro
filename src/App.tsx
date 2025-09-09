import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { DashboardLayout } from "./components/DashboardLayout";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AuthProvider } from "./contexts/AuthContext";
import { UserManagementProvider } from "./contexts/UserManagementContext";
import { RoleGuard } from "./components/auth/ProtectedRoute";
import Login from "./pages/Login";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import PerfilEpidemiologico from "./pages/PerfilEpidemiologico";
import IndicadoresAssistenciais from "./pages/IndicadoresAssistenciais";
import Procedencia from "./pages/Procedencia";
import Interconsultas from "./pages/Interconsultas";
import SobreServico from "./pages/SobreServico";
import QualidadeSatisfacao from "./pages/QualidadeSatisfacao";
import Configuracoes from "./pages/Configuracoes";
import Exportar from "./pages/Exportar";
import CapsComparacoes from "./pages/CapsComparacoes";
import Pacientes from "./pages/Pacientes";
import Notificacoes from "./pages/Notificacoes";
import SobreIntegraRAPS from "./pages/SobreIntegraRAPS";
import Reinternacoes from "./pages/Reinternacoes";
import Perfil from "./pages/Perfil";

import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <UserManagementProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
            <Routes>
              {/* Login route - outside DashboardLayout */}
              <Route path="/login" element={<Login />} />
              
              {/* Protected routes - inside DashboardLayout */}
              <Route path="/*" element={
                <DashboardLayout>
                  <Routes>
                    <Route 
                      path="/" 
                      element={
                        <RoleGuard>
                          <Dashboard />
                        </RoleGuard>
                      } 
                    />
                    <Route 
                      path="/dashboard" 
                      element={
                        <RoleGuard>
                          <Dashboard />
                        </RoleGuard>
                      } 
                    />
                    <Route 
                      path="/indicadores-assistenciais" 
                      element={
                        <RoleGuard>
                          <IndicadoresAssistenciais />
                        </RoleGuard>
                      } 
                    />
                    <Route 
                      path="/perfil-epidemiologico" 
                      element={
                        <RoleGuard>
                          <PerfilEpidemiologico />
                        </RoleGuard>
                      } 
                    />
                    <Route 
                      path="/caps-comparacoes" 
                      element={
                        <RoleGuard>
                          <CapsComparacoes />
                        </RoleGuard>
                      } 
                    />
                    <Route 
                      path="/reinternacoes" 
                      element={
                        <RoleGuard>
                          <Reinternacoes />
                        </RoleGuard>
                      } 
                    />
                    <Route 
                      path="/pacientes" 
                      element={
                        <RoleGuard>
                          <Pacientes />
                        </RoleGuard>
                      } 
                    />
                    <Route 
                      path="/notificacoes" 
                      element={
                        <RoleGuard>
                          <Notificacoes />
                        </RoleGuard>
                      } 
                    />
                    <Route 
                      path="/sobre-integraraps" 
                      element={
                        <RoleGuard>
                          <SobreIntegraRAPS />
                        </RoleGuard>
                      } 
                    />
                    <Route 
                      path="/configuracoes" 
                      element={
                        <RoleGuard requiredRole="coordenador">
                          <Configuracoes />
                        </RoleGuard>
                      } 
                    />
                    <Route 
                      path="/exportar" 
                      element={
                        <RoleGuard>
                          <Exportar />
                        </RoleGuard>
                      } 
                    />
                    <Route 
                      path="/qualidade-satisfacao" 
                      element={
                        <RoleGuard>
                          <QualidadeSatisfacao />
                        </RoleGuard>
                      } 
                    />
                    <Route 
                      path="/procedencia" 
                      element={
                        <RoleGuard>
                          <Procedencia />
                        </RoleGuard>
                      } 
                    />
                    <Route 
                      path="/interconsultas" 
                      element={
                        <RoleGuard>
                          <Interconsultas />
                        </RoleGuard>
                      } 
                    />
                    <Route 
                      path="/sobre-servico" 
                      element={
                        <RoleGuard>
                          <SobreServico />
                        </RoleGuard>
                      } 
                    />
                    <Route 
                      path="/perfil" 
                      element={
                        <RoleGuard>
                          <Perfil />
                        </RoleGuard>
                      } 
                    />
                    
                    {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </DashboardLayout>
              } />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
        </UserManagementProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
