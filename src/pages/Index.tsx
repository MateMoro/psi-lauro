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
      description: "Acessar filtros e dashboard principal com dados em tempo real",
      icon: Play,
      variant: "default" as const,
      action: () => navigate("/dashboard"),
      highlighted: true
    },
    {
      title: "Indicadores e Tendências",
      description: "Visualizar dados históricos, projeções e reinternações",
      icon: TrendingUp,
      variant: "secondary" as const,
      action: () => navigate("/tendencias")
    },
    {
      title: "Sobre o Serviço",
      description: "Informações institucionais e características assistenciais",
      icon: Stethoscope,
      variant: "secondary" as const,
      action: () => navigate("/sobre-servico")
    },
    {
      title: "Exportar Relatório",
      description: "Gerar documentos para apresentação institucional",
      icon: Download,
      variant: "secondary" as const,
      action: () => navigate("/exportar")
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-background/95 flex items-center justify-center p-4 md:p-6 lg:p-8">
      <div className="w-full max-w-2xl space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <p className="text-muted-foreground max-w-lg mx-auto">
            Sistema integrado de análise e monitoramento de indicadores assistenciais
          </p>
        </div>

        {/* Menu Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {menuItems.map((item, index) => (
            <Card 
              key={index}
              className="group hover:shadow-large transition-all duration-300 cursor-pointer transform hover:-translate-y-2 border-2 hover:border-primary/30 bg-gradient-to-br from-card to-card/95"
              onClick={item.action}
            >
              <div className="p-10 text-center space-y-6">
                <div className="mx-auto w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/15 to-primary/25 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <item.icon className="h-10 w-10 text-primary" />
                </div>
                <div className="space-y-3">
                  <h3 className="text-2xl font-bold text-primary mb-3 group-hover:text-primary/90 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {item.description}
                  </p>
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