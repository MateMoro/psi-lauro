import { useState, useEffect } from "react";
import { Users, Calendar, Palette, MapPin, Stethoscope } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { DashboardSkeleton } from "@/components/dashboard/LoadingSkeletons";
import { EmptyState } from "@/components/ui/empty-state";
import { MiniChart } from "@/components/dashboard/MiniChart";
import { useToast } from "@/hooks/use-toast";

interface Patient {
  nome: string;
  cid_grupo: string;
  caps_referencia: string;
  data_admissao: string;
  data_alta?: string;
  genero: string;
  data_nascimento: string;
  dias_internacao: number;
  procedencia: string;
  raca_cor: string;
  transtorno_categoria: string;
}

export default function PerfilEpidemiologico() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      const { data, error } = await supabase
        .from('pacientes_planalto')
        .select('*');

      if (error) throw error;
      setPatients(data || []);
    } catch (error) {
      console.error('Erro ao buscar pacientes:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados dos pacientes.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getGenderDistribution = () => {
    const genderCount = patients.reduce((acc, p) => {
      if (p.genero === 'masc') {
        acc['Masculino'] = (acc['Masculino'] || 0) + 1;
      } else if (p.genero === 'fem') {
        acc['Feminino'] = (acc['Feminino'] || 0) + 1;
      } else if (p.genero === 'outros') {
        acc['Outros'] = (acc['Outros'] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    const colors = [
      "#10b981",  // Green for Feminino
      "#0ea5e9",  // Blue for Masculino
      "#f97316"   // Orange for Outros
    ];

    return Object.entries(genderCount)
      .filter(([, value]) => value > 0)
      .map(([name, value], index) => ({ 
        name: name.charAt(0).toUpperCase() + name.slice(1).toLowerCase(), 
        value: Math.round((value / patients.length) * 100), 
        color: colors[index] || "#6b7280" 
      }));
  };

  const getAgeDistribution = () => {
    const ageRanges = {
      '<18': 0,
      '18–25': 0,
      '26–44': 0,
      '45–64': 0,
      '65+': 0
    };

    patients.forEach(p => {
      if (!p.data_nascimento) return;
      const age = new Date().getFullYear() - new Date(p.data_nascimento).getFullYear();
      
      if (age < 18) ageRanges['<18']++;
      else if (age <= 25) ageRanges['18–25']++;
      else if (age <= 44) ageRanges['26–44']++;
      else if (age <= 64) ageRanges['45–64']++;
      else ageRanges['65+']++;
    });

    const total = patients.length;
    return Object.entries(ageRanges).map(([name, count]) => ({ 
      name, 
      value: total > 0 ? Math.round((count / total) * 100) : 0,
      count 
    }));
  };

  const getRaceDistribution = () => {
    const raceCount = patients.reduce((acc, p) => {
      let race = p.raca_cor || 'Não informado';
      
      // Normalizar variações de "branco/branca"
      if (race.toLowerCase() === 'branca' || race.toLowerCase() === 'branco') {
        race = 'Branca';
      }
      // Normalizar variações de "pardo/parda"
      else if (race.toLowerCase() === 'pardo' || race.toLowerCase() === 'parda') {
        race = 'Parda';
      }
      // Normalizar variações de "preto/preta"
      else if (race.toLowerCase() === 'preto' || race.toLowerCase() === 'preta') {
        race = 'Preta';
      }
      // Capitalizar primeira letra para outras categorias
      else if (race !== 'Não informado') {
        race = race.charAt(0).toUpperCase() + race.slice(1).toLowerCase();
      }
      
      acc[race] = (acc[race] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const colors = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#84cc16', '#eab308'];
    return Object.entries(raceCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 6)
      .map(([name, value], index) => ({ 
        name, 
        value, 
        color: colors[index % colors.length] || '#6b7280'
      }));
  };

  const getMentalDisorders = () => {
    const disorderCount = patients.reduce((acc, p) => {
      const categoria = p.transtorno_categoria;
      
      if (!categoria || categoria === 'outros') {
        return acc;
      }
      
      let displayName = '';
      switch (categoria) {
        case 'esquizofrenia':
          displayName = 'Esquizofrenia';
          break;
        case 'transtorno_bipolar':
          displayName = 'Transtorno Bipolar';
          break;
        case 'substancias':
          displayName = 'Substâncias';
          break;
        case 'depressivo_unipolar':
          displayName = 'Depressivo Unipolar';
          break;
        case 'personalidade':
          displayName = 'Personalidade';
          break;
        default:
          return acc;
      }
      
      acc[displayName] = (acc[displayName] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const total = Object.values(disorderCount).reduce((sum, count) => sum + count, 0);
    const chartColors = [
      "#0ea5e9",
      "#10b981",
      "#f97316",
      "#6366f1",
      "#14b8a6",
    ];

    return Object.entries(disorderCount)
      .sort(([,a], [,b]) => b - a)
      .map(([name, count], index) => ({ 
        name, 
        value: total > 0 ? Number(((count / total) * 100).toFixed(1)) : 0,
        count: count,
        color: chartColors[index % chartColors.length] || "#6b7280"
      }));
  };

  const getProcedenciaDistribution = () => {
    const procedenciaCount = patients.reduce((acc, p) => {
      const procedencia = p.procedencia || 'Não informado';
      acc[procedencia] = (acc[procedencia] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const total = patients.length;
    return Object.entries(procedenciaCount)
      .sort(([,a], [,b]) => b - a)
      .map(([name, count]) => ({ 
        name,
        value: total > 0 ? Math.round((count / total) * 100) : 0,
        count 
      }));
  };

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (patients.length === 0) {
    return (
      <EmptyState
        icon={Users}
        title="Nenhum dado encontrado"
        description="Não foi possível encontrar dados de pacientes para análise epidemiológica."
        action={{
          label: "Tentar novamente",
          onClick: fetchPatients
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-emerald-50/20">
      <div className="space-y-8 p-6">
        
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-3">
            <div className="p-3 bg-gradient-to-br from-emerald-500 via-teal-600 to-cyan-700 rounded-2xl shadow-xl shadow-emerald-500/25">
              <Users className="h-8 w-8 text-white drop-shadow-sm" />
            </div>
            <div>
              <h1 className="text-4xl font-black text-slate-800 tracking-tight">
                Perfil Epidemiológico
              </h1>
              <p className="text-lg text-slate-600 font-medium">
                Características demográficas e sociais da população atendida
              </p>
            </div>
          </div>
        </div>

        {/* Principais Indicadores - Mesmos gráficos da visão geral */}
        <div className="space-y-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-1 h-8 bg-gradient-to-b from-blue-500 to-emerald-500 rounded-full"></div>
            <h2 className="text-2xl font-bold text-slate-800 tracking-tight">
              Principais Indicadores
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <MiniChart
              data={getGenderDistribution().map(item => ({
                name: item.name,
                value: Math.round((item.value / patients.length) * 100),
                color: item.color
              }))}
              title="Distribuição por Gênero"
              subtitle="Feminino, Masculino"
              type="pie"
              icon={Users}
            />
            
            <MiniChart
              data={getAgeDistribution()}
              title="Faixa Etária de Idade"
              subtitle="Distribuição por idade"
              type="bar"
              icon={Calendar}
              showXAxisLabels={true}
            />

            <MiniChart
              data={getRaceDistribution().map(item => ({
                name: item.name,
                value: Math.round((item.value / patients.length) * 100),
                color: item.color
              }))}
              title="Distribuição por Cor"
              subtitle="Parda, Branca, Preta"
              type="pie"
              icon={Palette}
            />
            
            <MiniChart
              data={getMentalDisorders()}
              title="Principais Patologias"
              subtitle="Transtornos mentais"
              type="bar"
              icon={Stethoscope}
              showXAxisLabels={false}
            />
          </div>
        </div>

        {/* Summary Stats */}
        <div className="space-y-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-1 h-8 bg-gradient-to-b from-cyan-500 to-blue-500 rounded-full"></div>
            <h2 className="text-2xl font-bold text-slate-800 tracking-tight">
              Resumo Estatístico
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-white to-slate-50/50 shadow-xl backdrop-blur-sm ring-1 ring-slate-200/50 rounded-2xl p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-black text-slate-800">{patients.length}</p>
                  <p className="text-sm text-slate-600 font-semibold">Total de Pacientes</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-white to-slate-50/50 shadow-xl backdrop-blur-sm ring-1 ring-slate-200/50 rounded-2xl p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl">
                  <Calendar className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-black text-slate-800">
                    {Math.round(patients.reduce((acc, p) => {
                      if (!p.data_nascimento) return acc;
                      const age = new Date().getFullYear() - new Date(p.data_nascimento).getFullYear();
                      return acc + age;
                    }, 0) / patients.length)}
                  </p>
                  <p className="text-sm text-slate-600 font-semibold">Idade Média</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-white to-slate-50/50 shadow-xl backdrop-blur-sm ring-1 ring-slate-200/50 rounded-2xl p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl">
                  <MapPin className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-black text-slate-800">
                    {Object.keys(patients.reduce((acc, p) => {
                      const procedencia = p.procedencia || 'Não informado';
                      acc[procedencia] = true;
                      return acc;
                    }, {} as Record<string, boolean>)).length}
                  </p>
                  <p className="text-sm text-slate-600 font-semibold">Origens Diferentes</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Análise Epidemiológica */}
        <div className="space-y-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-1 h-8 bg-gradient-to-b from-indigo-500 to-purple-500 rounded-full"></div>
            <h2 className="text-2xl font-bold text-slate-800 tracking-tight">
              Análise Epidemiológica
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-white to-slate-50/50 shadow-xl backdrop-blur-sm ring-1 ring-slate-200/50 rounded-2xl p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex-shrink-0">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-800 mb-2">Sexo</h3>
                  <p className="text-sm text-slate-700 leading-relaxed">
                    Perfil equilibrado entre os sexos, refletindo padrão comum em serviços de internação psiquiátrica.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-white to-slate-50/50 shadow-xl backdrop-blur-sm ring-1 ring-slate-200/50 rounded-2xl p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex-shrink-0">
                  <Palette className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-800 mb-2">Cor</h3>
                  <p className="text-sm text-slate-700 leading-relaxed">
                    Predomínio de pardos e pretos (58%), acima do esperado para o perfil de São Paulo. Pode refletir maior vulnerabilidade social e barreiras de acesso a serviços de saúde mental.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-white to-slate-50/50 shadow-xl backdrop-blur-sm ring-1 ring-slate-200/50 rounded-2xl p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex-shrink-0">
                  <Calendar className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-800 mb-2">Faixa Etária</h3>
                  <p className="text-sm text-slate-700 leading-relaxed">
                    Predomínio de 26–44 anos, fase produtiva em que esquizofrenia e transtorno bipolar frequentemente se manifestam ou agravam.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-white to-slate-50/50 shadow-xl backdrop-blur-sm ring-1 ring-slate-200/50 rounded-2xl p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex-shrink-0">
                  <MapPin className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-800 mb-2">Principais Diagnósticos</h3>
                  <p className="text-sm text-slate-700 leading-relaxed">
                    Perfil compatível com unidades hospitalares de "porta fechada", demandando estabilização de crises e manejo de risco.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}