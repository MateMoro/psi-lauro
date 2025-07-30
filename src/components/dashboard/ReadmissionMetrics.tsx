import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarDays, TrendingDown, Clock, BarChart3 } from "lucide-react";
import { MetricCard } from "./MetricCard";
import { HorizontalBarChart } from "./charts/HorizontalBarChart";

const readmissionData = [
  { name: "≤ 7 dias", value: 2.4 },
  { name: "8-15 dias", value: 2.93 },
  { name: "16-30 dias", value: 5.33 },
  { name: "> 30 dias", value: 3.2 }
];

export function ReadmissionMetrics() {
  return (
    <div className="space-y-6">
      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Reinternação ≤ 7 dias"
          value="2,4%"
          description="Taxa de reinternação precoce"
          icon={Clock}
          variant="success"
        />
        <MetricCard
          title="Reinternação ≤ 15 dias"
          value="2,93%"
          description="Indicador de qualidade"
          icon={CalendarDays}
          variant="info"
        />
        <MetricCard
          title="Reinternação ≤ 30 dias"
          value="5,33%"
          description="Taxa mensal acumulada"
          icon={TrendingDown}
          variant="warning"
        />
        <MetricCard
          title="Reinternação > 30 dias"
          value="3,2%"
          description="Reinternações tardias"
          icon={BarChart3}
          variant="primary"
        />
      </div>

      {/* Chart */}
      <HorizontalBarChart
        data={readmissionData}
        title="Distribuição das Reinternações por Intervalo de Tempo"
        description="Análise comparativa das taxas de reinternação por período pós-alta"
      />

      {/* Insight Card */}
      <Card className="shadow-medium border-l-4 border-l-success bg-success/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-success">
            <TrendingDown className="h-5 w-5" />
            Destaque Assistencial
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-relaxed">
            <strong>A maioria das reinternações ocorre entre 8 e 30 dias após a alta</strong>, 
            com taxas precoces (≤ 7 dias) inferiores a 2,5%. Este padrão reforça a qualidade 
            da transição do cuidado e o acompanhamento pós-alta feito em articulação com os CAPS.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}