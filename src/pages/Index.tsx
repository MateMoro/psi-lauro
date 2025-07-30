import { 
  Target, 
  FlaskConical, 
  Calendar, 
  RefreshCw 
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Index() {
  const currentDate = new Date().toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit', 
    year: 'numeric'
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Logo Institucional */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <img 
              src="/src/assets/hospital-logo.png" 
              alt="Logotipos SPDM, SUS e Prefeitura de São Paulo - Saúde"
              className="max-w-[80%] h-auto object-contain"
              style={{ maxHeight: '120px' }}
            />
          </div>
        </div>

        {/* Título Central */}
        <div className="text-center mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-institutional-blue leading-tight">
            Análise Clínica e Institucional das Internações Psiquiátricas
          </h1>
        </div>

        {/* Cards Informativos */}
        <div className="space-y-6">
          
          {/* Objetivo do Sistema */}
          <Card className="shadow-medium border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-institutional-blue text-xl">
                <Target className="h-6 w-6" />
                OBJETIVO DO SISTEMA
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-foreground leading-relaxed text-base">
                Este painel foi desenvolvido para permitir o acompanhamento técnico e analítico das internações psiquiátricas do Hospital Planalto.
                Focado em indicadores clínico-administrativos, ele apoia a gestão da assistência, identifica padrões relevantes (como reinternações, tempo médio de internação e perfil clínico) e orienta melhorias em articulação com a Rede de Atenção Psicossocial (RAPS).
              </p>
            </CardContent>
          </Card>

          {/* Metodologia e Fonte dos Dados */}
          <Card className="shadow-medium border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-institutional-blue text-xl">
                <FlaskConical className="h-6 w-6" />
                METODOLOGIA E FONTE DOS DADOS
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-foreground leading-relaxed text-base">
                <p>• Dados extraídos da base de internações da Enfermaria Psiquiátrica do Hospital Planalto.</p>
                <p>• A análise é retrospectiva.</p>
                <p>Seu foco é a análise institucional retroativa, com finalidade técnica e gerencial, oferecendo subsídios para qualificação do cuidado em saúde mental.</p>
              </div>
            </CardContent>
          </Card>

          {/* Período dos Dados */}
          <Card className="shadow-medium border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-institutional-blue text-xl">
                <Calendar className="h-6 w-6" />
                PERÍODO DOS DADOS
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-foreground leading-relaxed text-base">
                O painel abrange internações entre 11/06/2024 a 24/07/2025.
              </p>
            </CardContent>
          </Card>

          {/* Versão do Sistema */}
          <Card className="shadow-medium border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-institutional-blue text-xl">
                <RefreshCw className="h-6 w-6" />
                VERSÃO DO SISTEMA
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-foreground leading-relaxed text-base">
                <p>• Versão 1.0</p>
                <p>• Última atualização: {currentDate}</p>
              </div>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
}