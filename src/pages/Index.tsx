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
        {/* Information Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto mb-8">
          <Card className="group hover:shadow-large transition-all duration-300 border-2 hover:border-primary/30 bg-gradient-to-br from-card to-card/95">
            <div className="p-6 space-y-4">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">🧭</span>
                <h3 className="text-xl font-bold text-primary">Objetivo do sistema</h3>
              </div>
              <p className="text-muted-foreground leading-relaxed text-sm">
                Este aplicativo foi desenvolvido para permitir o acompanhamento técnico e analítico das internações psiquiátricas do Hospital Planalto. Focado em indicadores clínico-administrativos, ele apoia a gestão da assistência, identifica padrões relevantes (como reinternações, tempo médio de internação e perfil clínico) e orienta melhorias em articulação com a Rede de Atenção Psicossocial (RAPS).
              </p>
            </div>
          </Card>

          <Card className="group hover:shadow-large transition-all duration-300 border-2 hover:border-primary/30 bg-gradient-to-br from-card to-card/95">
            <div className="p-6 space-y-4">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">🧪</span>
                <h3 className="text-xl font-bold text-primary">Metodologia e fonte dos dados</h3>
              </div>
              <p className="text-muted-foreground leading-relaxed text-sm">
                Dados extraídos da base de internações da Enfermaria Psiquiátrica do Hospital Planalto. Seu foco é a análise institucional retroativa, com finalidade técnica e gerencial, oferecendo subsídios para qualificação do cuidado em saúde mental.
              </p>
            </div>
          </Card>

          <Card className="group hover:shadow-large transition-all duration-300 border-2 hover:border-primary/30 bg-gradient-to-br from-card to-card/95">
            <div className="p-6 space-y-4">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">📅</span>
                <h3 className="text-xl font-bold text-primary">Período dos dados</h3>
              </div>
              <p className="text-muted-foreground leading-relaxed text-sm">
                O painel abrange internações entre 11/06/2024 e 24/07/2025.
              </p>
            </div>
          </Card>

          <Card className="group hover:shadow-large transition-all duration-300 border-2 hover:border-primary/30 bg-gradient-to-br from-card to-card/95">
            <div className="p-6 space-y-4">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">🔄</span>
                <h3 className="text-xl font-bold text-primary">Versão do sistema</h3>
              </div>
              <p className="text-muted-foreground leading-relaxed text-sm">
                Versão 1.0<br />
                Última atualização: 30/07/2025
              </p>
            </div>
          </Card>
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