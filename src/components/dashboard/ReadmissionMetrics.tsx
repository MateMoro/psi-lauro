import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, RefreshCw, Calendar, TrendingDown } from "lucide-react";

export function ReadmissionMetrics() {
  const metrics = [
    {
      title: "Reinternações em até 7 dias",
      value: "2,4%",
      icon: Clock,
      color: "text-green-600",
      bgColor: "bg-green-50",
      description: "Índice muito baixo"
    },
    {
      title: "Reinternações em até 15 dias", 
      value: "2,93%",
      icon: RefreshCw,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      description: "Dentro da meta"
    },
    {
      title: "Reinternações em até 30 dias",
      value: "5,33%",
      icon: Calendar,
      color: "text-yellow-600", 
      bgColor: "bg-yellow-50",
      description: "Monitoramento contínuo"
    },
    {
      title: "Reinternações acima de 30 dias",
      value: "3,2%",
      icon: TrendingDown,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      description: "Baixo índice"
    }
  ];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-foreground mb-2">
          Taxas de Reinternação por Intervalo de Tempo
        </h2>
        <p className="text-muted-foreground text-sm">
          Distribuição percentual das reinternações conforme período pós-alta
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric, index) => (
          <Card key={index} className="shadow-medium border-l-4 border-l-primary/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${metric.bgColor}`}>
                  <metric.icon className={`h-6 w-6 ${metric.color}`} />
                </div>
                <Badge variant="outline" className="text-xs">
                  {metric.description}
                </Badge>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground leading-tight">
                  {metric.title}
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {metric.value}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <Card className="shadow-medium bg-accent/5 border-accent/20">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-accent/10">
              <TrendingDown className="h-5 w-5 text-accent" />
            </div>
            <div>
              <h3 className="font-medium text-foreground mb-1">
                Insight Clínico
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                A maioria das reinternações ocorre entre 8 e 30 dias após a alta, com taxas precoces (≤ 7 dias) 
                inferiores a 2,5%, indicando qualidade na transição do cuidado e acompanhamento pós-alta 
                em articulação com os CAPS.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}