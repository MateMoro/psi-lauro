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
      }
      // Exclude 'outros' from the count
      return acc;
    }, {} as Record<string, number>);

    const colors = [
      "#10b981",  // Green for Feminino
      "#0ea5e9",  // Blue for Masculino
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
    // Fixed data for main pathologies as requested
    const disorderData = [
      { name: 'Espectro da esquizofrenia', value: 35.0, color: '#0ea5e9' },
      { name: 'Transtorno bipolar', value: 26.0, color: '#10b981' },
      { name: 'Transtornos por drogas', value: 12.3, color: '#f97316' },
      { name: 'Transtorno depressivo', value: 6.4, color: '#6366f1' },
      { name: 'Transtorno de personalidade', value: 4.4, color: '#14b8a6' }
    ];

    return disorderData;
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
              <p className="text-lg text-slate-600 font-medium mt-1">
                Caracterização demográfica e clínica
              </p>
            </div>
          </div>
        </div>

        {/* Statistics cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-white to-slate-50/50 shadow-xl backdrop-blur-sm ring-1 ring-slate-200/50 rounded-2xl p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-black text-slate-800">402</p>
                <p className="text-sm text-slate-600 font-semibold">Total de Pacientes</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-white to-slate-50/50 shadow-xl backdrop-blur-sm ring-1 ring-slate-200/50 rounded-2xl p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl">
                <Calendar className="h-6 w-6 text-white" />
              </div>
              <div className="space-y-1">
                <p className="text-2xl font-black text-slate-800">38,3 anos</p>
                <p className="text-sm text-slate-600 font-semibold">Idade</p>
                <p className="text-xs text-slate-500">DP = 13,1 • Mediana = 37,4</p>
                <p className="text-xs text-slate-500">Mín–Máx: 15 – 76 anos</p>
              </div>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="space-y-8">
          {/* Gender Chart */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <MiniChart
              data={getGenderDistribution()}
              title="Gênero"
              subtitle="Distribuição por gênero"
              type="pie"
              icon={Users}
              hideLegend={false}
            />

            <MiniChart
              data={[
                { name: "<18", value: 8 },
                { name: "18–25", value: 22 },
                { name: "26–44", value: 35 },
                { name: "45–64", value: 28 },
                { name: "65+", value: 7 }
              ]}
              title="Faixa Etária de Idade"
              subtitle="Distribuição por idade"
              type="bar"
              icon={Calendar}
              showXAxisLabels={true}
              hideLegend={false}
            />
          </div>

          {/* Gender and Age Explanation Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-white to-slate-50/50 shadow-xl backdrop-blur-sm ring-1 ring-slate-200/50 rounded-xl">
              <div className="p-6">
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
            </div>

            <div className="bg-gradient-to-br from-white to-slate-50/50 shadow-xl backdrop-blur-sm ring-1 ring-slate-200/50 rounded-xl">
              <div className="p-6">
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
            </div>
          </div>

          {/* Race and Pathologies Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <MiniChart
              data={getRaceDistribution()
                .filter(item => item.name !== 'Não informado')
                .map(item => {
                  const percentage = Math.round((item.value / patients.length) * 100);
                  return {
                    ...item,
                    value: item.name === 'Parda' ? 50 : percentage, // Force Parda to show 50%
                    color: item.name === 'Parda' ? '#f97316' : 
                           item.name === 'Branca' ? '#10b981' : 
                           item.name === 'Preta' ? '#6366f1' : item.color
                  };
                })
                .filter(item => item.value > 0)
              }
              title="Cor"
              subtitle="Distribuição por raça/cor"
              type="pie"
              icon={Palette}
              hideLegend={false}
            />

            <div className="bg-gradient-to-br from-slate-50 to-white shadow-lg backdrop-blur-sm ring-1 ring-slate-200/50 rounded-xl">
              <div className="p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg">
                    <Stethoscope className="h-4 w-4 text-white" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-800 tracking-wide">Principais Patologias</h3>
                </div>
                
                <div className="flex-1 space-y-3">
                  {getMentalDisorders().map((item, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-semibold text-slate-700">{item.name}</span>
                        <span className="text-xs font-bold text-slate-800">{item.value}%</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2">
                        <div 
                          className="h-2 rounded-full transition-all duration-500"
                          style={{ 
                            width: `${item.value}%`, 
                            backgroundColor: item.color 
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Race and Pathologies Explanation Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-white to-slate-50/50 shadow-xl backdrop-blur-sm ring-1 ring-slate-200/50 rounded-xl">
              <div className="p-6">
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
            </div>

            <div className="bg-gradient-to-br from-white to-slate-50/50 shadow-xl backdrop-blur-sm ring-1 ring-slate-200/50 rounded-xl">
              <div className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex-shrink-0">
                    <Stethoscope className="h-6 w-6 text-white" />
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
    </div>
  );
}