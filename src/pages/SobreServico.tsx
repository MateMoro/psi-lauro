import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, Users, Shield, Activity, FileText, TrendingUp, Stethoscope } from "lucide-react";

export default function SobreServico() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-emerald-50/20">
      <div className="space-y-8 p-6">
        
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-3">
            <div className="p-3 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 rounded-2xl shadow-xl shadow-blue-500/25">
              <Stethoscope className="h-8 w-8 text-white drop-shadow-sm" />
            </div>
            <div>
              <h1 className="text-4xl font-black text-slate-800 tracking-tight">
                Sobre o Serviço
              </h1>
              <p className="text-lg text-slate-600 font-medium">
                Serviço de Psiquiatria – Hospital Planalto
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Histórico e Estrutura */}
          <Card className="border-0 bg-gradient-to-br from-white to-slate-50/50 shadow-xl backdrop-blur-sm ring-1 ring-slate-200/50 rounded-2xl transition-all duration-300 hover:shadow-2xl hover:scale-[1.01]">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-slate-800">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                  <Shield className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-black tracking-tight">Histórico e Estrutura</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-3 text-slate-600 leading-relaxed font-medium">
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full mt-2 flex-shrink-0"></div>
                  <span>
                    O Serviço de Psiquiatria <strong className="text-slate-800">(pronto-socorro e enfermaria) foi reaberto em abril de 2020</strong>, 
                    sob gestão compartilhada com a SPDM.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full mt-2 flex-shrink-0"></div>
                  <span>
                    Durante a pandemia, o hospital foi designado como <strong className="text-slate-800">unidade de catástrofe</strong>, 
                    o que implicou no fechamento temporário do serviço de saúde mental.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full mt-2 flex-shrink-0"></div>
                  <span>
                    Desde então, o setor funciona como <strong className="text-slate-800">unidade referenciada em saúde mental</strong>, 
                    recebendo majoritariamente pacientes regulados dos hospitais Cidade Tiradentes 
                    e Benedito Montenegro (IVA).
                  </span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Perfil Assistencial */}
          <Card className="border-0 bg-gradient-to-br from-white to-slate-50/50 shadow-xl backdrop-blur-sm ring-1 ring-slate-200/50 rounded-2xl transition-all duration-300 hover:shadow-2xl hover:scale-[1.01]">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-slate-800">
                <div className="p-2 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl shadow-lg">
                  <Activity className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-black tracking-tight">Perfil Assistencial</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-3 text-slate-600 leading-relaxed font-medium">
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-gradient-to-r from-emerald-500 to-green-600 rounded-full mt-2 flex-shrink-0"></div>
                  <span>
                    Atendemos prioritariamente pacientes com <strong className="text-slate-800">quadros agudos graves</strong>, 
                    refratários ao tratamento ambulatorial convencional.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-gradient-to-r from-emerald-500 to-green-600 rounded-full mt-2 flex-shrink-0"></div>
                  <span>
                    Muitos casos necessitam de introdução de fármacos de alto risco, como a 
                    <strong className="text-slate-800"> clozapina</strong>, que exige monitoramento hematológico rigoroso 
                    durante a internação, o que reforça o grau de complexidade clínica e o papel 
                    estratégico da unidade.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-gradient-to-r from-emerald-500 to-green-600 rounded-full mt-2 flex-shrink-0"></div>
                  <span>
                    Embora oficialmente configurado como <strong className="text-slate-800">porta fechada</strong>, há aumento 
                    progressivo de admissões via SAMU e demanda espontânea, demonstrando mudança 
                    gradual no perfil de entrada.
                  </span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Equipe e Práticas Clínicas */}
          <Card className="border-0 bg-gradient-to-br from-white to-slate-50/50 shadow-xl backdrop-blur-sm ring-1 ring-slate-200/50 rounded-2xl transition-all duration-300 hover:shadow-2xl hover:scale-[1.01]">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-slate-800">
                <div className="p-2 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl shadow-lg">
                  <Users className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-black tracking-tight">Equipe e Práticas Clínicas</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-3 text-slate-600 leading-relaxed font-medium">
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-gradient-to-r from-orange-500 to-amber-600 rounded-full mt-2 flex-shrink-0"></div>
                  <span>
                    <strong className="text-slate-800">Enfermaria com 16 leitos psiquiátricos.</strong>
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-gradient-to-r from-orange-500 to-amber-600 rounded-full mt-2 flex-shrink-0"></div>
                  <span>
                    Equipe multiprofissional composta por psiquiatra diarista, plantonistas, 
                    enfermagem, psicologia, terapia ocupacional e serviço social.
                  </span>
                </li>
              </ul>
              <div className="bg-gradient-to-r from-orange-50 to-amber-50 p-4 rounded-xl border-l-4 border-orange-500 mt-4">
                <p className="text-slate-700 leading-relaxed font-medium">
                  <strong className="text-slate-800">Pioneiro na implantação do PTS na unidade</strong>, o Serviço de 
                  Psiquiatria foi o primeiro setor a registrar Projetos Terapêuticos Singulares 
                  diretamente no sistema SGHx, promovendo maior alinhamento clínico e qualificação 
                  do cuidado interdisciplinar.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Aprimoramento Contínuo */}
          <Card className="border-0 bg-gradient-to-br from-white to-slate-50/50 shadow-xl backdrop-blur-sm ring-1 ring-slate-200/50 rounded-2xl transition-all duration-300 hover:shadow-2xl hover:scale-[1.01] lg:col-span-2">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-slate-800">
                <div className="p-2 bg-gradient-to-br from-purple-500 to-violet-600 rounded-xl shadow-lg">
                  <FileText className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-black tracking-tight">Aprimoramento Contínuo</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-3 text-slate-600 leading-relaxed font-medium">
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-gradient-to-r from-purple-500 to-violet-600 rounded-full mt-2 flex-shrink-0"></div>
                  <span>
                    Protocolos clínicos revisados para depressão, transtorno afetivo bipolar 
                    e esquizofrenia.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-gradient-to-r from-purple-500 to-violet-600 rounded-full mt-2 flex-shrink-0"></div>
                  <span>
                    Capacitações com foco em comunicação não violenta e humanização do cuidado.
                  </span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}