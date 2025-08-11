import { MessageCircle, Clock, TrendingUp } from "lucide-react";
import { MultiLineChart } from "@/components/dashboard/charts/MultiLineChart";
import { Card, CardContent } from "@/components/ui/card";
import { MiniChart } from "@/components/dashboard/MiniChart";

export default function Interconsultas() {
  const getInterconsultationData = () => {
    return [
      { month: 'Janeiro', interconsultas2024: 31, interconsultas2025: 102 },
      { month: 'Fevereiro', interconsultas2024: 23, interconsultas2025: 103 },
      { month: 'Março', interconsultas2024: 22, interconsultas2025: 93 },
      { month: 'Abril', interconsultas2024: 31, interconsultas2025: 86 },
      { month: 'Maio', interconsultas2024: 30, interconsultas2025: 97 },
      { month: 'Junho', interconsultas2024: 25, interconsultas2025: 103 },
      { month: 'Julho', interconsultas2024: 50, interconsultas2025: null },
      { month: 'Agosto', interconsultas2024: 45, interconsultas2025: null },
      { month: 'Setembro', interconsultas2024: 51, interconsultas2025: null },
      { month: 'Outubro', interconsultas2024: 48, interconsultas2025: null },
      { month: 'Novembro', interconsultas2024: 38, interconsultas2025: null },
      { month: 'Dezembro', interconsultas2024: 58, interconsultas2025: null }
    ];
  };

  const getResponseTimeData = () => {
    return [
      { name: '≤ 60 minutos', value: 66.7, color: '#3b82f6' },
      { name: '≤ 90 minutos', value: 76.2, color: '#1d4ed8' },
      { name: '≤ 120 minutos', value: 85.7, color: '#1e40af' }
    ];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-emerald-50/20">
      <div className="space-y-8 p-6">
        
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-3">
            <div className="p-3 bg-gradient-to-br from-cyan-500 via-blue-600 to-indigo-700 rounded-2xl shadow-xl shadow-cyan-500/25">
              <MessageCircle className="h-8 w-8 text-white drop-shadow-sm" />
            </div>
            <div>
              <h1 className="text-4xl font-black text-slate-800 tracking-tight">
                Pedidos de Interconsultas
              </h1>
              <p className="text-lg text-slate-600 font-medium">
                Evolução mensal dos pedidos de interconsulta 2024-2025
              </p>
            </div>
          </div>
        </div>

        {/* Main Chart */}
        <div className="w-full">
          <MultiLineChart
            data={getInterconsultationData()}
            title="Pedidos de Interconsultas por Mês"
            description="Comparação entre 2024 e 2025"
            lines={[
              {
                dataKey: "interconsultas2024",
                name: "Interconsultas (2024)",
                color: "#3b82f6"
              },
              {
                dataKey: "interconsultas2025", 
                name: "Interconsultas (2025)",
                color: "#10b981"
              }
            ]}
          />
        </div>

        {/* Analysis Summary and Response Time */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Summary Card */}
          <Card className="bg-gradient-to-br from-white to-slate-50/50 shadow-xl backdrop-blur-sm ring-1 ring-slate-200/50 rounded-2xl">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg">
                  <TrendingUp className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-lg font-bold text-slate-800">Análise do Período</h3>
              </div>
              <p className="text-slate-700 leading-relaxed">
                Demanda crescente, sobretudo de pacientes da 'porta', com aumento de cerca de <strong>232%</strong> no período analisado. Ainda assim, <strong>2/3 dos pedidos</strong> são atendidos em até 1h e quase <strong>86%</strong> em até 2h, garantindo agilidade e liberação rápida de pacientes com pendência exclusivamente psiquiátrica.
              </p>
            </CardContent>
          </Card>

          {/* Response Time Chart */}
          <MiniChart
            data={getResponseTimeData()}
            title="Tempo de Resposta"
            subtitle="Percentual cumprido por tempo limite"
            type="bar"
            icon={Clock}
            showXAxisLabels={true}
            hideLegend={true}
          />
        </div>
      </div>
    </div>
  );
}