import { useState, useEffect } from "react";
import { Star, TrendingUp, AlertTriangle, CheckCircle, BarChart3 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { DashboardSkeleton } from "@/components/dashboard/LoadingSkeletons";
import { EmptyState } from "@/components/ui/empty-state";
import { MiniChart } from "@/components/dashboard/MiniChart";
import { useToast } from "@/hooks/use-toast";

export default function QualidadeSatisfacao() {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Dados de satisfação conforme solicitado
  const satisfactionData = [
    { name: "Mai/25", value: 96.9 },
    { name: "Jun/25", value: 90.25 },
    { name: "Jul/25", value: 96.25 }
  ];

  const calculateMetrics = () => {
    const averageSatisfaction = (satisfactionData.reduce((sum, item) => sum + item.value, 0) / satisfactionData.length);
    const minSatisfaction = Math.min(...satisfactionData.map(item => item.value));
    const maxSatisfaction = Math.max(...satisfactionData.map(item => item.value));

    return {
      averageSatisfaction: averageSatisfaction.toFixed(1),
      minSatisfaction,
      maxSatisfaction
    };
  };

  const metrics = calculateMetrics();

  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-emerald-50/20">
      <div className="space-y-8 p-6">
        
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-3">
            <div className="p-3 bg-gradient-to-br from-yellow-500 via-orange-600 to-amber-700 rounded-2xl shadow-xl shadow-yellow-500/25">
              <Star className="h-8 w-8 text-white drop-shadow-sm" />
            </div>
            <div>
              <h1 className="text-4xl font-black text-slate-800 tracking-tight">
                Qualidade e Satisfação
              </h1>
              <p className="text-lg text-slate-600 font-medium">
                Avaliação da experiência dos pacientes
              </p>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <MiniChart
            data={satisfactionData}
            title="Satisfação Geral do Paciente"
            subtitle="Evolução no trimestre (Mai-Jul 2025)"
            type="line"
            icon={BarChart3}
            showXAxisLabels={true}
            hideLegend={false}
          />

          <div className="bg-gradient-to-br from-slate-50 to-white shadow-lg backdrop-blur-sm ring-1 ring-slate-200/50 rounded-xl">
            <div className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-600 shadow-lg">
                  <Star className="h-4 w-4 text-white" />
                </div>
                <h3 className="text-sm font-bold text-slate-800 tracking-wide">Métricas de Satisfação</h3>
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-semibold text-slate-700">Satisfação Média</span>
                  <span className="text-lg font-bold text-green-600">{metrics.averageSatisfaction}%</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-xs font-semibold text-slate-700">Maior Índice</span>
                  <span className="text-sm font-bold text-green-600">{metrics.maxSatisfaction}% (Mai/25)</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-xs font-semibold text-slate-700">Menor Índice</span>
                  <span className="text-sm font-bold text-orange-600">{metrics.minSatisfaction}% (Jun/25)</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Analysis Card */}
        <div className="bg-gradient-to-br from-white to-slate-50/50 shadow-xl backdrop-blur-sm ring-1 ring-slate-200/50 rounded-xl">
          <div className="p-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex-shrink-0">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800 mb-3">Análise Crítica</h3>
                <p className="text-sm text-slate-700 leading-relaxed">
                  <strong>Satisfação (mai–jul/2025):</strong> A satisfação geral manteve-se em nível de excelência no trimestre (média 94,5%). 
                  Em junho, houve queda para 90,25%, puxada por piora na percepção sobre Atendimento Médico e Alimentação. 
                  Em julho, o índice voltou a 96,25%, indicando recuperação. Apesar do resultado positivo, a oscilação reforça a 
                  necessidade de monitoramento contínuo para manter a consistência dos padrões de qualidade.
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}