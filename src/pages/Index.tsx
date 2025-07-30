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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-6">
      <div className="max-w-4xl mx-auto space-y-16">
        {/* Logo Institucional */}
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <img 
              src="/lovable-uploads/2559d5aa-43ca-44e7-a089-ae35cb9cb64d.png" 
              alt="Logotipos SPDM, SUS e Prefeitura de São Paulo - Saúde"
              className="max-w-[40%] h-auto object-contain"
              style={{ maxHeight: '35px' }}
            />
          </div>
          
          {/* Título Principal */}
          <h1 className="text-[28px] font-bold text-[#1565C0] mb-8 font-sans tracking-tight">
            Painel de Internações Psiquiátricas
          </h1>
        </div>

        {/* Cards Informativos */}
        <div className="space-y-6 max-w-3xl mx-auto">
          
          {/* Objetivo do Sistema */}
          <Card className="bg-white border border-[#E0E0E0] rounded-xl shadow-[0px_2px_12px_rgba(0,0,0,0.06)] p-6">
            <CardHeader className="text-center pb-6">
              <div className="flex justify-center mb-4">
                <Target className="h-6 w-6 text-[#1565C0]" />
              </div>
              <CardTitle className="text-[#1565C0] text-xl font-bold">
                OBJETIVO DO SISTEMA
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 px-6">
              <p className="text-[#333333] leading-relaxed text-base text-center">
                Este aplicativo foi desenvolvido para permitir o acompanhamento técnico e analítico das internações psiquiátricas do Hospital Planalto.
                Focado em indicadores clínico-administrativos, ele apoia a gestão da assistência, identifica padrões relevantes (como reinternações, tempo médio de internação e perfil clínico) e orienta melhorias em articulação com a Rede de Atenção Psicossocial (RAPS).
              </p>
            </CardContent>
          </Card>

          {/* Metodologia e Fonte dos Dados */}
          <Card className="bg-white border border-[#E0E0E0] rounded-xl shadow-[0px_2px_12px_rgba(0,0,0,0.06)] p-6">
            <CardHeader className="text-center pb-6">
              <div className="flex justify-center mb-4">
                <FlaskConical className="h-6 w-6 text-[#1565C0]" />
              </div>
              <CardTitle className="text-[#1565C0] text-xl font-bold">
                METODOLOGIA E FONTE DOS DADOS
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 px-6">
              <div className="space-y-3 text-[#333333] leading-relaxed text-base text-center">
                <p>• Dados extraídos da base de internações da Enfermaria Psiquiátrica do Hospital Planalto.</p>
                <p>Seu foco é a análise institucional retroativa, com finalidade técnica e gerencial, oferecendo subsídios para qualificação do cuidado em saúde mental.</p>
              </div>
            </CardContent>
          </Card>

          {/* Período dos Dados */}
          <Card className="bg-white border border-[#E0E0E0] rounded-xl shadow-[0px_2px_12px_rgba(0,0,0,0.06)] p-6">
            <CardHeader className="text-center pb-6">
              <div className="flex justify-center mb-4">
                <Calendar className="h-6 w-6 text-[#1565C0]" />
              </div>
              <CardTitle className="text-[#1565C0] text-xl font-bold">
                PERÍODO DOS DADOS
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 px-6">
              <p className="text-[#333333] leading-relaxed text-base text-center">
                O painel abrange internações entre 11/06/2024 a 24/07/2025.
              </p>
            </CardContent>
          </Card>

          {/* Versão do Sistema */}
          <Card className="bg-white border border-[#E0E0E0] rounded-xl shadow-[0px_2px_12px_rgba(0,0,0,0.06)] p-6">
            <CardHeader className="text-center pb-6">
              <div className="flex justify-center mb-4">
                <RefreshCw className="h-6 w-6 text-[#1565C0]" />
              </div>
              <CardTitle className="text-[#1565C0] text-xl font-bold">
                VERSÃO DO SISTEMA
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 px-6">
              <div className="space-y-2 text-[#333333] leading-relaxed text-base text-center">
                <p>• Versão 1.0</p>
                <p>• Última atualização: {currentDate}</p>
              </div>
            </CardContent>
          </Card>

        </div>

        {/* Rodapé */}
        <div className="text-center mt-12 pt-6 border-t border-[#E0E0E0]">
          <p className="text-sm text-[#666666]">
            Desenvolvido pelo Serviço de Psiquiatria do Hospital Planalto
          </p>
        </div>
      </div>
    </div>
  );
}