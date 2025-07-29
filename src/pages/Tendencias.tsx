import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ReadmissionMetrics } from "@/components/dashboard/ReadmissionMetrics";
import { CustomLineChart } from "@/components/dashboard/charts/LineChart";

export default function Tendencias() {
  // Mock data for temporal trends
  const monthlyAdmissions = [
    { name: "Jan", value: 28 },
    { name: "Fev", value: 32 },
    { name: "Mar", value: 29 },
    { name: "Abr", value: 35 },
    { name: "Mai", value: 31 },
    { name: "Jun", value: 27 },
    { name: "Jul", value: 33 },
    { name: "Ago", value: 30 },
    { name: "Set", value: 29 },
    { name: "Out", value: 34 },
    { name: "Nov", value: 32 },
    { name: "Dez", value: 28 }
  ];

  const avgStayTrend = [
    { name: "Jan", value: 15.2 },
    { name: "Fev", value: 14.8 },
    { name: "Mar", value: 14.5 },
    { name: "Abr", value: 14.1 },
    { name: "Mai", value: 14.3 },
    { name: "Jun", value: 13.9 },
    { name: "Jul", value: 14.6 },
    { name: "Ago", value: 14.2 },
    { name: "Set", value: 14.0 },
    { name: "Out", value: 14.4 },
    { name: "Nov", value: 14.1 },
    { name: "Dez", value: 14.3 }
  ];

  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-2xl md:text-3xl font-bold text-primary">
          📈 Indicadores e Tendências
        </h1>
        <p className="text-muted-foreground">
          Análise temporal dos dados assistenciais e indicadores de reinternação
        </p>
      </div>

      {/* Readmission Analysis */}
      <ReadmissionMetrics />

      {/* Temporal Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <CustomLineChart
          data={monthlyAdmissions}
          title="Evolução Mensal das Admissões"
          description="Número de internações psiquiátricas por mês"
          color="hsl(var(--primary))"
        />
        <CustomLineChart
          data={avgStayTrend}
          title="Tendência do Tempo Médio de Permanência"
          description="Evolução da média de dias de internação"
          color="hsl(var(--chart-2))"
        />
      </div>

      {/* Additional Insights */}
      <Card className="shadow-medium">
        <CardHeader>
          <CardTitle className="text-primary">Insights Estratégicos</CardTitle>
          <CardDescription>
            Análise qualitativa dos indicadores assistenciais
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <h4 className="font-semibold text-foreground">Qualidade da Transição</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                As baixas taxas de reinternação precoce (≤ 7 dias: 2,4%) evidenciam 
                a qualidade do processo de alta e articulação com a rede.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-foreground">Perfil de Complexidade</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                O tempo médio de permanência de 14,3 dias reflete o perfil de 
                pacientes com quadros graves e complexos.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-foreground">Articulação com CAPS</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                A distribuição temporal das reinternações demonstra efetividade 
                do acompanhamento pós-alta na rede psicossocial.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-foreground">Capacidade Assistencial</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Taxa de ocupação de 91,3% demonstra alto aproveitamento da 
                capacidade instalada com 16 leitos psiquiátricos.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}