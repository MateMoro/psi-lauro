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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-emerald-50/20">
      <div className="space-y-8 p-6">
        
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-3">
            <div className="p-3 bg-gradient-to-br from-purple-500 via-violet-600 to-indigo-700 rounded-2xl shadow-xl shadow-purple-500/25">
              <Download className="h-8 w-8 text-white drop-shadow-sm" />
            </div>
            <div>
              <h1 className="text-4xl font-black text-slate-800 tracking-tight">
                Exportar Relatórios
              </h1>
              <p className="text-lg text-slate-600 font-medium">
                Gere relatórios personalizados para apresentações e análises
              </p>
            </div>
          </div>
        </div>

        {/* Export Options */}
        <div className="space-y-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-1 h-8 bg-gradient-to-b from-purple-500 to-blue-500 rounded-full"></div>
            <h2 className="text-2xl font-bold text-slate-800 tracking-tight">
              Opções de Relatórios
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {exportOptions.map((option, index) => {
              const gradients = [
                'from-blue-500 via-blue-600 to-indigo-700',
                'from-emerald-500 via-green-600 to-teal-700',
                'from-purple-500 via-violet-600 to-indigo-700',
                'from-orange-500 via-amber-600 to-yellow-600'
              ];
              const gradient = gradients[index % gradients.length];
              
              return (
                <Card key={index} className="border-0 bg-gradient-to-br from-white to-slate-50/50 shadow-xl backdrop-blur-sm ring-1 ring-slate-200/50 rounded-2xl transition-all duration-300 hover:shadow-2xl hover:scale-[1.02]">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-4">
                      <div className={`p-3 bg-gradient-to-br ${gradient} rounded-2xl shadow-xl`}>
                        <option.icon className="h-6 w-6 text-white drop-shadow-sm" />
                      </div>
                      <span className="text-xl font-black text-slate-800 tracking-tight">{option.title}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <p className="text-slate-600 leading-relaxed font-medium">
                      {option.description}
                    </p>
                    <Button 
                      onClick={() => handleExport(option.type)}
                      disabled={isExporting}
                      className={`w-full h-12 text-base font-semibold bg-gradient-to-r ${gradient} hover:opacity-90 border-0 rounded-xl shadow-lg transition-all duration-200 hover:scale-[1.02]`}
                    >
                      {isExporting ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-3"></div>
                          Gerando Relatório...
                        </>
                      ) : (
                        <>
                          <Download className="h-5 w-5 mr-3" />
                          Exportar {option.title}
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Information Section */}
        <div className="space-y-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-1 h-8 bg-gradient-to-b from-blue-500 to-emerald-500 rounded-full"></div>
            <h2 className="text-2xl font-bold text-slate-800 tracking-tight">
              Informações dos Relatórios
            </h2>
          </div>
          
          <Card className="border-0 bg-gradient-to-br from-white to-slate-50/50 shadow-xl backdrop-blur-sm ring-1 ring-slate-200/50 rounded-2xl">
            <CardContent className="p-8 space-y-6">
              <div className="space-y-4 text-slate-600 font-medium">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full mt-2 flex-shrink-0"></div>
                  <span><strong className="text-slate-800">Relatório Executivo:</strong> Ideal para apresentações à Secretaria da Saúde</span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-gradient-to-r from-emerald-500 to-green-600 rounded-full mt-2 flex-shrink-0"></div>
                  <span><strong className="text-slate-800">Análise Estatística:</strong> Dados completos para estudos epidemiológicos</span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-gradient-to-r from-purple-500 to-violet-600 rounded-full mt-2 flex-shrink-0"></div>
                  <span><strong className="text-slate-800">Relatório Temporal:</strong> Acompanhamento de tendências ao longo do tempo</span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-gradient-to-r from-orange-500 to-amber-600 rounded-full mt-2 flex-shrink-0"></div>
                  <span><strong className="text-slate-800">Perfil dos Pacientes:</strong> Características da população atendida</span>
                </div>
              </div>
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-2xl border-l-4 border-blue-500">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">📋</span>
                  <p className="text-slate-700 font-medium">
                    Todos os relatórios são gerados em formato PDF com gráficos e tabelas atualizados
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}