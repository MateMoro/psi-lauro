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

  const menuItems = [
    {
      title: "Iniciar Análise",
      description: "Acesse o painel completo de dados",
      icon: Play,
      variant: "default" as const,
      action: () => navigate("/dashboard"),
      highlighted: true
    },
    {
      title: "Indicadores e Tendências",
      description: "Análises temporais e estatísticas",
      icon: TrendingUp,
      variant: "secondary" as const,
      action: () => navigate("/tendencias")
    },
    {
      title: "Sobre o Serviço e Perfil dos Casos",
      description: "Informações institucionais e contexto clínico",
      icon: Stethoscope,
      variant: "secondary" as const,
      action: () => navigate("/sobre-servico")
    },
    {
      title: "Exportar Relatório",
      description: "Gerar relatórios para download",
      icon: Download,
      variant: "secondary" as const,
      action: () => navigate("/exportar")
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <p className="text-muted-foreground max-w-lg mx-auto">
            Sistema de análise e monitoramento das internações psiquiátricas
          </p>
        </div>

        {/* Menu Cards */}
        <div className="space-y-4">
          {menuItems.map((item, index) => (
            <Card 
              key={index}
              className={`p-6 cursor-pointer transition-all duration-200 hover:shadow-lg border-2 ${
                item.highlighted 
                  ? 'border-accent bg-accent/5 hover:bg-accent/10 shadow-medium' 
                  : 'border-border hover:border-accent/50'
              }`}
              onClick={item.action}
            >
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-lg ${
                  item.highlighted 
                    ? 'bg-accent text-accent-foreground' 
                    : 'bg-muted text-muted-foreground'
                }`}>
                  <item.icon className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg text-foreground">
                    {item.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {item.description}
                  </p>
                </div>
                <div className="text-muted-foreground">
                  <Play className="h-5 w-5 rotate-180 scale-x-[-1]" />
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Exit Button */}
        <div className="flex justify-center pt-6">
          <Button 
            variant="outline" 
            className="w-full max-w-sm text-muted-foreground border-muted-foreground/30 hover:bg-muted/20"
            onClick={() => window.history.back()}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sair
          </Button>
        </div>
      </div>
    </div>
  );
}