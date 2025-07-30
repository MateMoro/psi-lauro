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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8 px-6">
      <div className="max-w-4xl mx-auto space-y-12">
        {/* Logo Institucional */}
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <img 
              src="/lovable-uploads/2559d5aa-43ca-44e7-a089-ae35cb9cb64d.png" 
              alt="Logotipos SPDM, SUS e Prefeitura de São Paulo - Saúde"
              className="max-w-[50%] h-auto object-contain"
              style={{ maxHeight: '80px' }}
            />
          </div>
          
          {/* Título Principal */}
          <h1 className="text-3xl font-bold text-[#1565C0] mb-8 font-inter">
            Painel de Internações Psiquiátricas
          </h1>
        </div>

        {/* Cards Informativos */}
        <div className="space-y-8 max-w-3xl mx-auto">
          
          {/* Objetivo do Sistema */}
          <Card className="bg-white border border-[#E0E0E0] rounded-lg shadow-lg p-8">
            <CardHeader className="text-center pb-4">
              <div className="flex justify-center mb-3">
                <Target className="h-8 w-8 text-[#1565C0]" />
              </div>
              <CardTitle className="text-[#1565C0] text-xl font-semibold font-inter">
                OBJETIVO DO SISTEMA
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-[#333333] leading-relaxed text-base text-center font-inter">
                Este aplicativo foi desenvolvido para permitir o acompanhamento técnico e analítico das internações psiquiátricas do Hospital Planalto.
                Focado em indicadores clínico-administrativos, ele apoia a gestão da assistência, identifica padrões relevantes (como reinternações, tempo médio de internação e perfil clínico) e orienta melhorias em articulação com a Rede de Atenção Psicossocial (RAPS).
              </p>
            </CardContent>
          </Card>

          {/* Metodologia e Fonte dos Dados */}
          <Card className="bg-white border border-[#E0E0E0] rounded-lg shadow-lg p-8">
            <CardHeader className="text-center pb-4">
              <div className="flex justify-center mb-3">
                <FlaskConical className="h-8 w-8 text-[#1565C0]" />
              </div>
              <CardTitle className="text-[#1565C0] text-xl font-semibold font-inter">
                METODOLOGIA E FONTE DOS DADOS
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3 text-[#333333] leading-relaxed text-base text-center font-inter">
                <p>• Dados extraídos da base de internações da Enfermaria Psiquiátrica do Hospital Planalto.</p>
                <p>Seu foco é a análise institucional retroativa, com finalidade técnica e gerencial, oferecendo subsídios para qualificação do cuidado em saúde mental.</p>
              </div>
            </CardContent>
          </Card>

          {/* Período dos Dados */}
          <Card className="bg-white border border-[#E0E0E0] rounded-lg shadow-lg p-8">
            <CardHeader className="text-center pb-4">
              <div className="flex justify-center mb-3">
                <Calendar className="h-8 w-8 text-[#1565C0]" />
              </div>
              <CardTitle className="text-[#1565C0] text-xl font-semibold font-inter">
                PERÍODO DOS DADOS
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-[#333333] leading-relaxed text-base text-center font-inter">
                O painel abrange internações entre 11/06/2024 a 24/07/2025.
              </p>
            </CardContent>
          </Card>

          {/* Versão do Sistema */}
          <Card className="bg-white border border-[#E0E0E0] rounded-lg shadow-lg p-8">
            <CardHeader className="text-center pb-4">
              <div className="flex justify-center mb-3">
                <RefreshCw className="h-8 w-8 text-[#1565C0]" />
              </div>
              <CardTitle className="text-[#1565C0] text-xl font-semibold font-inter">
                VERSÃO DO SISTEMA
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2 text-[#333333] leading-relaxed text-base text-center font-inter">
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