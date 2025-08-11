import { useState, useEffect } from "react";
import { MapPin, Building2, Route, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { DashboardSkeleton } from "@/components/dashboard/LoadingSkeletons";
import { EmptyState } from "@/components/ui/empty-state";
import { MiniChart } from "@/components/dashboard/MiniChart";
import { MultiLineChart } from "@/components/dashboard/charts/MultiLineChart";
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
}

export default function Procedencia() {
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

  const getProcedenciaDistribution = () => {
    const procedenciaCount = patients.reduce((acc, p) => {
      const procedencia = p.procedencia || 'Não informado';
      acc[procedencia] = (acc[procedencia] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const colors = [
      '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', 
      '#06b6d4', '#84cc16', '#eab308', '#f97316', '#ec4899'
    ];

    return Object.entries(procedenciaCount)
      .sort(([,a], [,b]) => b - a)
      .map(([name, value], index) => ({ 
        name: name.toUpperCase(),
        value: Math.round((value / patients.length) * 100),
        count: value,
        color: colors[index % colors.length] || '#6b7280'
      }));
  };

  const getCapsDistribution = () => {
    const capsCount = patients.reduce((acc, p) => {
      const caps = p.caps_referencia || 'Não informado';
      acc[caps] = (acc[caps] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const colors = [
      '#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
      '#06b6d4', '#84cc16', '#eab308', '#f97316', '#ec4899'
    ];

    return Object.entries(capsCount)
      .sort(([,a], [,b]) => b - a)
      .map(([name, value], index) => ({ 
        name: name.toUpperCase(), 
        value: Math.round((value / patients.length) * 100),
        count: value,
        color: colors[index % colors.length] || '#6b7280'
      }));
  };

  const getProcedenciaTimeseries = () => {
    const monthlyProcedencia: Record<string, Record<string, number>> = {};
    
    // Get last 12 months
    const months = [];
    for (let i = 11; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthName = date.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' });
      months.push({ key: monthKey, name: monthName });
      monthlyProcedencia[monthKey] = {};
    }

    // Count procedencias by month
    patients.forEach(patient => {
      if (patient.data_admissao) {
        const admissionDate = new Date(patient.data_admissao);
        const monthKey = `${admissionDate.getFullYear()}-${String(admissionDate.getMonth() + 1).padStart(2, '0')}`;
        const procedencia = patient.procedencia || 'Não informado';
        
        if (monthlyProcedencia[monthKey] !== undefined) {
          monthlyProcedencia[monthKey][procedencia] = (monthlyProcedencia[monthKey][procedencia] || 0) + 1;
        }
      }
    });

    // Get top 3 procedencias
    const topProcedencias = getTopProcedencias().slice(0, 3);
    
    return months.map(month => {
      const monthData: any = { month: month.name };
      
      topProcedencias.forEach(proc => {
        monthData[proc.name] = monthlyProcedencia[month.key][proc.name] || 0;
      });
      
      return monthData;
    });
  };

  const getTopProcedencias = () => {
    const procedenciaCount = patients.reduce((acc, p) => {
      const procedencia = p.procedencia || 'Não informado';
      acc[procedencia] = (acc[procedencia] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(procedenciaCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([name, value]) => ({ 
        name, 
        value,
        percentage: Math.round((value / patients.length) * 100)
      }));
  };

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (patients.length === 0) {
    return (
      <EmptyState
        icon={MapPin}
        title="Nenhum dado encontrado"
        description="Não foi possível encontrar dados de procedência dos pacientes."
        action={{
          label: "Tentar novamente",
          onClick: fetchPatients
        }}
      />
    );
  }

  const procedenciaData = getProcedenciaDistribution();
  const capsData = getCapsDistribution();
  const topProcedencias = getTopProcedencias();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-emerald-50/20">
      <div className="space-y-8 p-6">
        
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-3">
            <div className="p-3 bg-gradient-to-br from-orange-500 via-amber-600 to-yellow-600 rounded-2xl shadow-xl shadow-orange-500/25">
              <MapPin className="h-8 w-8 text-white drop-shadow-sm" />
            </div>
            <div>
              <h1 className="text-4xl font-black text-slate-800 tracking-tight">
                Análise de Procedência
              </h1>
              <p className="text-lg text-slate-600 font-medium">
                Origem e fluxo de encaminhamentos dos pacientes
              </p>
            </div>
          </div>
        </div>

        {/* Summary Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-gradient-to-br from-white to-slate-50/50 shadow-xl backdrop-blur-sm ring-1 ring-slate-200/50 rounded-2xl p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl">
                <MapPin className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-black text-slate-800">{procedenciaData.length}</p>
                <p className="text-sm text-slate-600 font-semibold">Origens Diferentes</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-white to-slate-50/50 shadow-xl backdrop-blur-sm ring-1 ring-slate-200/50 rounded-2xl p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl">
                <Building2 className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-black text-slate-800">{capsData.length}</p>
                <p className="text-sm text-slate-600 font-semibold">CAPS Referência</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-white to-slate-50/50 shadow-xl backdrop-blur-sm ring-1 ring-slate-200/50 rounded-2xl p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl">
                <Route className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-black text-slate-800">
                  {topProcedencias[0]?.percentage || 0}%
                </p>
                <p className="text-sm text-slate-600 font-semibold">Principal Origem</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-white to-slate-50/50 shadow-xl backdrop-blur-sm ring-1 ring-slate-200/50 rounded-2xl p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-black text-slate-800">{patients.length}</p>
                <p className="text-sm text-slate-600 font-semibold">Total Pacientes</p>
              </div>
            </div>
          </div>
        </div>

        {/* Temporal Analysis */}
        <div className="space-y-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-1 h-8 bg-gradient-to-b from-amber-500 to-orange-500 rounded-full"></div>
            <h2 className="text-2xl font-bold text-slate-800 tracking-tight">
              Procedência das Admissões - Últimos 12 meses
            </h2>
          </div>
          
          <MultiLineChart
            data={getProcedenciaTimeseries()}
            title="Evolução Temporal das Principais Procedências"
            description="Comparação mensal entre as 3 principais origens de encaminhamento"
            lines={[
              {
                dataKey: topProcedencias[0]?.name || 'Porta',
                name: topProcedencias[0]?.name || 'Porta',
                color: '#1e40af'
              },
              {
                dataKey: topProcedencias[1]?.name || 'Hospital',
                name: topProcedencias[1]?.name || 'Hospital',
                color: '#6b7280'
              },
              {
                dataKey: topProcedencias[2]?.name || 'CAPS',
                name: topProcedencias[2]?.name || 'CAPS',
                color: '#059669'
              }
            ]}
          />
        </div>

        {/* Distribution Charts */}
        <div className="space-y-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-1 h-8 bg-gradient-to-b from-orange-500 to-amber-500 rounded-full"></div>
            <h2 className="text-2xl font-bold text-slate-800 tracking-tight uppercase">
              DISTRIBUIÇÃO POR ORIGEM
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="h-[600px]">
              <MiniChart
                data={procedenciaData.slice(0, 8)}
                title="PRINCIPAIS PROCEDÊNCIAS"
                subtitle="TOP 8 ORIGENS DE ENCAMINHAMENTO"
                type="pie"
                icon={MapPin}
              />
            </div>

            <div className="h-[600px]">
              <MiniChart
                data={capsData.slice(0, 8)}
                title="CAPS DE REFERÊNCIA"
                subtitle="PRINCIPAIS UNIDADES"
                type="pie"
                icon={Building2}
              />
            </div>
          </div>
        </div>

        {/* Detailed Table */}
        <div className="space-y-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-1 h-8 bg-gradient-to-b from-yellow-500 to-orange-500 rounded-full"></div>
            <h2 className="text-2xl font-bold text-slate-800 tracking-tight">
              Ranking Detalhado
            </h2>
          </div>
          
          <div className="bg-gradient-to-br from-white to-slate-50/50 shadow-xl backdrop-blur-sm ring-1 ring-slate-200/50 rounded-2xl p-6">
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-slate-800 mb-4">Top 10 Procedências</h3>
              <div className="grid gap-3">
                {topProcedencias.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-amber-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                        {index + 1}
                      </div>
                      <span className="font-semibold text-slate-800">{item.name}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-black text-slate-800">{item.value}</span>
                      <span className="text-sm text-slate-600 ml-2">({item.percentage}%)</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}