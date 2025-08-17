import { MessageCircle, Clock, TrendingUp } from "lucide-react";
import { MultiLineChart } from "@/components/dashboard/charts/MultiLineChart";
import { Card, CardContent } from "@/components/ui/card";

export default function Interconsultas() {
  const getInterconsultationData = () => {
    return [
      { month: 'Jan/2024', interconsultas: 31 },
      { month: 'Fev/2024', interconsultas: 23 },
      { month: 'Mar/2024', interconsultas: 22 },
      { month: 'Abr/2024', interconsultas: 31 },
      { month: 'Mai/2024', interconsultas: 30 },
      { month: 'Jun/2024', interconsultas: 25 },
      { month: 'Jul/2024', interconsultas: 50 },
      { month: 'Ago/2024', interconsultas: 45 },
      { month: 'Set/2024', interconsultas: 51 },
      { month: 'Out/2024', interconsultas: 48 },
      { month: 'Nov/2024', interconsultas: 38 },
      { month: 'Dez/2024', interconsultas: 58 },
      { month: 'Jan/2025', interconsultas: 102 },
      { month: 'Fev/2025', interconsultas: 103 },
      { month: 'Mar/2025', interconsultas: 93 },
      { month: 'Abr/2025', interconsultas: 86 },
      { month: 'Mai/2025', interconsultas: 97 },
      { month: 'Jun/2025', interconsultas: 103 },
      { month: 'Jul/2025', interconsultas: null }
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
                Interconsultas – Volume e tempo de resposta
              </h1>
              <p className="text-lg text-slate-600 font-medium">
                Análise do volume de pedidos e eficiência do tempo de resposta
              </p>
            </div>
          </div>
        </div>

        {/* Main Chart */}
        <div className="w-full">
          <MultiLineChart
            data={getInterconsultationData()}
            title="Pedidos de Interconsultas por Mês"
            description="Evolução temporal jan/2024 → jul/2025"
            lines={[
              {
                dataKey: "interconsultas",
                name: "Pedidos de Interconsultas",
                color: "#3b82f6"
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
          <Card className="bg-gradient-to-br from-white to-slate-50/50 shadow-xl backdrop-blur-sm ring-1 ring-slate-200/50 rounded-2xl">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg">
                  <Clock className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-800">Tempo de Resposta</h3>
                  <p className="text-sm text-slate-600">Percentual cumprido por tempo</p>
                </div>
              </div>
              
              <div className="space-y-4">
                {getResponseTimeData().map((item) => (
                  <div key={item.name} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-slate-700">{item.name}</span>
                      <span className="text-sm font-bold text-slate-800">{item.value}%</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all duration-500 ease-out"
                        style={{ 
                          width: `${item.value}%`, 
                          backgroundColor: item.color,
                          background: `linear-gradient(90deg, ${item.color}, ${item.color}dd)`
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}