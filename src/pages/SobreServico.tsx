import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Shield, Activity, FileText, Stethoscope, UserCheck, Link, Building2 } from "lucide-react";

export default function SobreServico() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-emerald-50/20">
      <div className="space-y-8 p-6">
        
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-3">
            <div className="p-3 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 rounded-2xl shadow-xl shadow-blue-500/25">
              <Building2 className="h-8 w-8 text-white drop-shadow-sm" />
            </div>
            <div>
              <h1 className="text-4xl font-black text-slate-800 tracking-tight">
                Institucional
              </h1>
              <p className="text-lg text-slate-600 font-medium">
                IntegraRAPS – Ferramenta de Apoio à Rede de Atenção Psicossocial
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Perfil Assistencial */}
          <Card className="border-0 bg-gradient-to-br from-white to-slate-50/50 shadow-xl backdrop-blur-sm ring-1 ring-slate-200/50 rounded-2xl transition-all duration-300 hover:shadow-2xl hover:scale-[1.01]">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-slate-800">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                  <Stethoscope className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-black tracking-tight">🩺 Perfil Assistencial</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-3 text-slate-600 leading-relaxed font-medium">
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full mt-2 flex-shrink-0"></div>
                  <span>
                    Casos graves e refratários, incluindo <strong className="text-slate-800">gestantes</strong>, 
                    pacientes com <strong className="text-slate-800">alta agressividade</strong>, 
                    <strong className="text-slate-800"> comorbidades clínicas relevantes</strong>, 
                    <strong className="text-slate-800"> catatonia</strong> e <strong className="text-slate-800">demandas sociais complexas</strong>.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full mt-2 flex-shrink-0"></div>
                  <span>
                    Recebemos perfis <strong className="text-slate-800">frequentemente recusados por outras unidades</strong>.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full mt-2 flex-shrink-0"></div>
                  <span>
                    <strong className="text-slate-800">Referência para os quadros mais graves da Zona Leste</strong>, 
                    reforçando papel estratégico regional.
                  </span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* PTS e Protocolos */}
          <Card className="border-0 bg-gradient-to-br from-white to-slate-50/50 shadow-xl backdrop-blur-sm ring-1 ring-slate-200/50 rounded-2xl transition-all duration-300 hover:shadow-2xl hover:scale-[1.01]">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-slate-800">
                <div className="p-2 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl shadow-lg">
                  <FileText className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-black tracking-tight">📑 PTS e Protocolos</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-3 text-slate-600 leading-relaxed font-medium">
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-gradient-to-r from-emerald-500 to-green-600 rounded-full mt-2 flex-shrink-0"></div>
                  <span>
                    <strong className="text-slate-800">Setor pioneiro no uso do PTS no SGHx.</strong>
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-gradient-to-r from-emerald-500 to-green-600 rounded-full mt-2 flex-shrink-0"></div>
                  <span>
                    Protocolos atualizados para <strong className="text-slate-800">esquizofrenia</strong>, 
                    <strong className="text-slate-800"> transtorno bipolar</strong> e <strong className="text-slate-800">depressão maior</strong>.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-gradient-to-r from-emerald-500 to-green-600 rounded-full mt-2 flex-shrink-0"></div>
                  <span>
                    <strong className="text-slate-800">Condutas padronizadas</strong>, baseadas em evidências científicas.
                  </span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Integração com a RAPS */}
          <Card className="border-0 bg-gradient-to-br from-white to-slate-50/50 shadow-xl backdrop-blur-sm ring-1 ring-slate-200/50 rounded-2xl transition-all duration-300 hover:shadow-2xl hover:scale-[1.01]">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-slate-800">
                <div className="p-2 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl shadow-lg">
                  <Link className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-black tracking-tight">🔗 Integração com a RAPS</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-3 text-slate-600 leading-relaxed font-medium">
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-gradient-to-r from-orange-500 to-amber-600 rounded-full mt-2 flex-shrink-0"></div>
                  <span>
                    <strong className="text-slate-800">Visitas técnicas</strong> e ações de matriciamento.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-gradient-to-r from-orange-500 to-amber-600 rounded-full mt-2 flex-shrink-0"></div>
                  <span>
                    <strong className="text-slate-800">Corresponsabilização do cuidado</strong> com serviços da rede.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-gradient-to-r from-orange-500 to-amber-600 rounded-full mt-2 flex-shrink-0"></div>
                  <span>
                    Garantia de <strong className="text-slate-800">continuidade assistencial</strong>.
                  </span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Equipe Multiprofissional */}
          <Card className="border-0 bg-gradient-to-br from-white to-slate-50/50 shadow-xl backdrop-blur-sm ring-1 ring-slate-200/50 rounded-2xl transition-all duration-300 hover:shadow-2xl hover:scale-[1.01]">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-slate-800">
                <div className="p-2 bg-gradient-to-br from-purple-500 to-violet-600 rounded-xl shadow-lg">
                  <Users className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-black tracking-tight">👥 Equipe Multiprofissional</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="text-lg font-bold text-slate-800 mb-3">Semana:</h4>
                <ul className="space-y-2 text-slate-600 leading-relaxed font-medium">
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-gradient-to-r from-purple-500 to-violet-600 rounded-full mt-2 flex-shrink-0"></div>
                    <span><strong className="text-slate-800">1 psiquiatra diarista</strong> (meio turno)</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-gradient-to-r from-purple-500 to-violet-600 rounded-full mt-2 flex-shrink-0"></div>
                    <span><strong className="text-slate-800">1 psiquiatra plantonista</strong> 24h</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-gradient-to-r from-purple-500 to-violet-600 rounded-full mt-2 flex-shrink-0"></div>
                    <span><strong className="text-slate-800">1 psicóloga</strong></span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-gradient-to-r from-purple-500 to-violet-600 rounded-full mt-2 flex-shrink-0"></div>
                    <span><strong className="text-slate-800">1 terapeuta ocupacional</strong></span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-gradient-to-r from-purple-500 to-violet-600 rounded-full mt-2 flex-shrink-0"></div>
                    <span><strong className="text-slate-800">1 assistente social</strong></span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-gradient-to-r from-purple-500 to-violet-600 rounded-full mt-2 flex-shrink-0"></div>
                    <span><strong className="text-slate-800">2 enfermeiros</strong> e <strong className="text-slate-800">6 técnicos de enfermagem</strong></span>
                  </li>
                </ul>
              </div>
              
              <div>
                <h4 className="text-lg font-bold text-slate-800 mb-3">Finais de semana:</h4>
                <ul className="space-y-2 text-slate-600 leading-relaxed font-medium">
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-gradient-to-r from-purple-500 to-violet-600 rounded-full mt-2 flex-shrink-0"></div>
                    <span><strong className="text-slate-800">1 psiquiatra</strong> 24h</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-gradient-to-r from-purple-500 to-violet-600 rounded-full mt-2 flex-shrink-0"></div>
                    <span><strong className="text-slate-800">Equipe de enfermagem completa</strong></span>
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Considerações Finais */}
          <Card className="border-0 bg-gradient-to-br from-white to-slate-50/50 shadow-xl backdrop-blur-sm ring-1 ring-slate-200/50 rounded-2xl transition-all duration-300 hover:shadow-2xl hover:scale-[1.01] lg:col-span-2">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-slate-800">
                <div className="p-2 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-xl shadow-lg">
                  <Shield className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-black tracking-tight">🏛 Considerações Finais</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-3 text-slate-600 leading-relaxed font-medium">
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-gradient-to-r from-indigo-500 to-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                  <span>
                    <strong className="text-slate-800">Serviço robusto e resolutivo.</strong>
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-gradient-to-r from-indigo-500 to-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                  <span>
                    <strong className="text-slate-800">Uso estratégico para planejamento e gestão da rede.</strong>
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-gradient-to-r from-indigo-500 to-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                  <span>
                    <strong className="text-slate-800">Centro de referência em saúde mental</strong> para casos de alta complexidade na região.
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