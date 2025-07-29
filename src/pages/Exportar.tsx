import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, FileText, BarChart3, Calendar, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Exportar() {
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  const handleExport = async (type: string) => {
    setIsExporting(true);
    
    // Simulate export process
    setTimeout(() => {
      setIsExporting(false);
      toast({
        title: "Relatório exportado",
        description: `${type} foi gerado com sucesso.`,
        variant: "default",
      });
    }, 2000);
  };

  const exportOptions = [
    {
      title: "Relatório Executivo",
      description: "Sumário completo com principais indicadores",
      icon: FileText,
      type: "Relatório Executivo",
      color: "bg-blue-500"
    },
    {
      title: "Análise Estatística",
      description: "Dados detalhados e distribuições",
      icon: BarChart3,
      type: "Análise Estatística",
      color: "bg-green-500"
    },
    {
      title: "Relatório Temporal",
      description: "Tendências e séries históricas",
      icon: Calendar,
      type: "Relatório Temporal",
      color: "bg-purple-500"
    },
    {
      title: "Perfil dos Pacientes",
      description: "Características demográficas e clínicas",
      icon: Users,
      type: "Perfil dos Pacientes",
      color: "bg-orange-500"
    }
  ];

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl md:text-3xl font-bold text-institutional-blue">
          Exportar Relatórios
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Gere relatórios personalizados para apresentações e análises
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {exportOptions.map((option, index) => (
          <Card key={index} className="shadow-medium hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${option.color} text-white`}>
                  <option.icon className="h-5 w-5" />
                </div>
                {option.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                {option.description}
              </p>
              <Button 
                onClick={() => handleExport(option.type)}
                disabled={isExporting}
                className="w-full"
              >
                {isExporting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Gerando...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Exportar {option.title}
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="shadow-medium">
        <CardHeader>
          <CardTitle className="text-institutional-blue">Informações sobre os Relatórios</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="text-sm text-muted-foreground space-y-2">
            <p>• <strong>Relatório Executivo:</strong> Ideal para apresentações à Secretaria da Saúde</p>
            <p>• <strong>Análise Estatística:</strong> Dados completos para estudos epidemiológicos</p>
            <p>• <strong>Relatório Temporal:</strong> Acompanhamento de tendências ao longo do tempo</p>
            <p>• <strong>Perfil dos Pacientes:</strong> Características da população atendida</p>
          </div>
          <div className="mt-4 p-3 bg-muted/30 rounded-lg">
            <p className="text-xs text-muted-foreground">
              📋 Todos os relatórios são gerados em formato PDF com gráficos e tabelas atualizados
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}