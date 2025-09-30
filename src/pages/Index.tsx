import { useNavigate } from "react-router-dom";
import { 
  Play, 
  BarChart3, 
  TrendingUp, 
  Stethoscope, 
  Download,
  LogOut 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function Index() {
  const navigate = useNavigate();


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-emerald-50/20 flex items-center justify-center p-6">
      <div className="w-full max-w-6xl space-y-12">
        
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="p-4 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 rounded-3xl shadow-2xl shadow-blue-500/25">
              <Stethoscope className="h-12 w-12 text-white drop-shadow-sm" />
            </div>
          </div>
          <h1 className="text-5xl font-black text-slate-800 tracking-tight mb-4">
            IntegraRAPS
          </h1>
        </div>

        {/* Information Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card className="group transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl border-0 bg-gradient-to-br from-white to-slate-50/50 shadow-xl backdrop-blur-sm ring-1 ring-slate-200/50 rounded-2xl">
            <div className="p-8 space-y-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg">
                  <span className="text-2xl">📊</span>
                </div>
                <h3 className="text-2xl font-black text-slate-800 tracking-tight">Objetivo do Sistema</h3>
              </div>
              <p className="text-slate-600 leading-relaxed font-medium">
                Acompanhamento técnico e analítico das internações psiquiátricas. Focado em indicadores clínico-administrativos, apoia a gestão da assistência e orienta melhorias em articulação com a Rede de Atenção Psicossocial (RAPS).
              </p>
            </div>
          </Card>

          <Card className="group transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl border-0 bg-gradient-to-br from-white to-slate-50/50 shadow-xl backdrop-blur-sm ring-1 ring-slate-200/50 rounded-2xl">
            <div className="p-8 space-y-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl shadow-lg">
                  <span className="text-2xl">🔬</span>
                </div>
                <h3 className="text-2xl font-black text-slate-800 tracking-tight">Metodologia</h3>
              </div>
              <p className="text-slate-600 leading-relaxed font-medium">
                Dados integrados da Rede de Atenção Psicossocial incluindo Hospital Planalto e CAPS. Análise institucional retroativa com finalidade técnica e gerencial para qualificação do cuidado em saúde mental.
              </p>
            </div>
          </Card>

          <Card className="group transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl border-0 bg-gradient-to-br from-white to-slate-50/50 shadow-xl backdrop-blur-sm ring-1 ring-slate-200/50 rounded-2xl">
            <div className="p-8 space-y-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-gradient-to-br from-orange-500 to-amber-600 rounded-2xl shadow-lg">
                  <span className="text-2xl">📅</span>
                </div>
                <h3 className="text-2xl font-black text-slate-800 tracking-tight">Período dos Dados</h3>
              </div>
              <p className="text-slate-600 leading-relaxed font-medium">
                Internações entre <strong>11/06/2024</strong> e <strong>24/07/2025</strong>
              </p>
            </div>
          </Card>

          <Card className="group transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl border-0 bg-gradient-to-br from-white to-slate-50/50 shadow-xl backdrop-blur-sm ring-1 ring-slate-200/50 rounded-2xl">
            <div className="p-8 space-y-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-gradient-to-br from-purple-500 to-violet-600 rounded-2xl shadow-lg">
                  <span className="text-2xl">⚡</span>
                </div>
                <h3 className="text-2xl font-black text-slate-800 tracking-tight">Versão do Sistema</h3>
              </div>
              <p className="text-slate-600 leading-relaxed font-medium">
                <strong>Versão 1.0</strong><br />
                Última atualização: <strong>30/07/2025</strong>
              </p>
            </div>
          </Card>
        </div>

        {/* Exit Button */}
        <div className="flex justify-center pt-8">
          <Button 
            variant="outline" 
            className="px-8 py-4 text-lg font-semibold text-slate-600 border-2 border-slate-300 hover:bg-slate-100 hover:border-slate-400 rounded-2xl transition-all duration-200 hover:scale-105"
            onClick={() => window.history.back()}
          >
            <LogOut className="h-5 w-5 mr-3" />
            Sair do Sistema
          </Button>
        </div>
      </div>
    </div>
  );
}