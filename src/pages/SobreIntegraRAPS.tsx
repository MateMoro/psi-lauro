import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Info, Target, Network, Users, Shield, Mail, User } from "lucide-react";

export default function SobreIntegraRAPS() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-emerald-50/20">
      <div className="space-y-8 p-6">
        
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-3">
            <div className="p-3 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 rounded-2xl shadow-xl shadow-blue-500/25">
              <Info className="h-8 w-8 text-white drop-shadow-sm" />
            </div>
            <div>
              <h1 className="text-4xl font-black text-slate-800 tracking-tight">
                Sobre o IntegraRAPS
              </h1>
              <p className="text-lg text-slate-600 font-medium">
                Plataforma de integração para a RAPS
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Contexto e Desafio */}
          <Card className="border-0 bg-gradient-to-br from-white to-slate-50/50 shadow-xl backdrop-blur-sm ring-1 ring-slate-200/50 rounded-2xl transition-all duration-300 hover:shadow-2xl hover:scale-[1.01]">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-slate-800">
                <div className="p-2 bg-gradient-to-br from-red-500 to-pink-600 rounded-xl shadow-lg">
                  <Target className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-black tracking-tight">🎯 Contexto e Desafio</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-slate-600 leading-relaxed font-medium space-y-4">
                <p>
                  A organização do cuidado em saúde mental no SUS exige <strong className="text-slate-800">coordenação entre hospitais e CAPS</strong>. 
                  No entanto, falhas na integração de dados comprometem a continuidade do cuidado, 
                  dificultam o planejamento territorial e contribuem para:
                </p>
                <ul className="space-y-2 ml-4">
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-gradient-to-r from-red-500 to-pink-600 rounded-full mt-2 flex-shrink-0"></div>
                    <span><strong className="text-slate-800">Internações prolongadas</strong></span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-gradient-to-r from-red-500 to-pink-600 rounded-full mt-2 flex-shrink-0"></div>
                    <span><strong className="text-slate-800">Altas desarticuladas</strong></span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-gradient-to-r from-red-500 to-pink-600 rounded-full mt-2 flex-shrink-0"></div>
                    <span><strong className="text-slate-800">Reinternações evitáveis</strong></span>
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Solução Proposta */}
          <Card className="border-0 bg-gradient-to-br from-white to-slate-50/50 shadow-xl backdrop-blur-sm ring-1 ring-slate-200/50 rounded-2xl transition-all duration-300 hover:shadow-2xl hover:scale-[1.01]">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-slate-800">
                <div className="p-2 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl shadow-lg">
                  <Shield className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-black tracking-tight">💡 Solução Proposta</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-slate-600 leading-relaxed font-medium space-y-4">
                <p>
                  O IntegraRAPS foi concebido como uma <strong className="text-slate-800">plataforma intuitiva, 
                  otimizada e de fácil adoção pelas equipes da RAPS</strong>, voltada à qualificação 
                  da articulação entre CAPS e hospitais.
                </p>
                <p>
                  Por meio da <strong className="text-slate-800">consolidação diária de dados assistenciais já disponíveis</strong>, 
                  a plataforma oferece aos CAPS a possibilidade de visualizar seus pacientes internados em 
                  <strong className="text-slate-800"> tempo quase real</strong>, com:
                </p>
                <ul className="space-y-2 ml-4">
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-gradient-to-r from-emerald-500 to-green-600 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Dados clínico-demográficos relevantes</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-gradient-to-r from-emerald-500 to-green-600 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Alertas automáticos de novas admissões</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-gradient-to-r from-emerald-500 to-green-600 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Alertas automáticos de altas hospitalares</span>
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Benefícios */}
          <Card className="border-0 bg-gradient-to-br from-white to-slate-50/50 shadow-xl backdrop-blur-sm ring-1 ring-slate-200/50 rounded-2xl transition-all duration-300 hover:shadow-2xl hover:scale-[1.01]">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-slate-800">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                  <Network className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-black tracking-tight">🚀 Benefícios</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-slate-600 leading-relaxed font-medium space-y-4">
                <p>
                  Essa <strong className="text-slate-800">visibilidade quase imediata</strong> permite aos 
                  gestores e equipes técnicas:
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full mt-2 flex-shrink-0"></div>
                    <span><strong className="text-slate-800">Antecipar intervenções</strong></span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full mt-2 flex-shrink-0"></div>
                    <span><strong className="text-slate-800">Agilizar o matriciamento</strong></span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full mt-2 flex-shrink-0"></div>
                    <span><strong className="text-slate-800">Fortalecer o vínculo entre o cuidado hospitalar e territorial</strong></span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full mt-2 flex-shrink-0"></div>
                    <span><strong className="text-slate-800">Promover corresponsabilidade e resolutividade</strong></span>
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Proposta e Versão */}
          <Card className="border-0 bg-gradient-to-br from-white to-slate-50/50 shadow-xl backdrop-blur-sm ring-1 ring-slate-200/50 rounded-2xl transition-all duration-300 hover:shadow-2xl hover:scale-[1.01]">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-slate-800">
                <div className="p-2 bg-gradient-to-br from-purple-500 to-violet-600 rounded-xl shadow-lg">
                  <Users className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-black tracking-tight">📋 Proposta</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-slate-600 leading-relaxed font-medium space-y-4">
                <p>
                  A proposta do IntegraRAPS <strong className="text-slate-800">não é substituir sistemas oficiais</strong>, 
                  mas <strong className="text-slate-800">preencher lacunas operacionais com inteligência aplicada</strong>, 
                  facilitando o planejamento territorial e promovendo decisões mais integradas e informadas 
                  <strong className="text-slate-800"> em benefício direto dos usuários da rede</strong>.
                </p>
                
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-200/50">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full"></div>
                    <span className="font-bold text-slate-800">Versão atual do sistema:</span>
                  </div>
                  <p className="text-lg font-black text-blue-700">v1.0 (01.09.2025)</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Contatos - Full Width */}
        <Card className="border-0 bg-gradient-to-br from-white to-slate-50/50 shadow-xl backdrop-blur-sm ring-1 ring-slate-200/50 rounded-2xl transition-all duration-300 hover:shadow-2xl hover:scale-[1.01]">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-slate-800">
              <div className="p-2 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl shadow-lg">
                <Mail className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-black tracking-tight">📞 Contatos</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-lg">
                  <User className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="font-bold text-slate-800">Coordenação técnica:</p>
                  <p className="text-slate-600 font-medium">Lauro Reis – CRM-SP 186.959</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg">
                  <Mail className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="font-bold text-slate-800">Contato institucional:</p>
                  <a 
                    href="mailto:laurorsantana@prefeitura.sp.gov.br" 
                    className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
                  >
                    laurorsantana@prefeitura.sp.gov.br
                  </a>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}