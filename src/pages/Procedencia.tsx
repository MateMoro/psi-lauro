import { useState, useEffect } from "react";
import { MapPin } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { DashboardSkeleton } from "@/components/dashboard/LoadingSkeletons";
import { EmptyState } from "@/components/ui/empty-state";
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


  const getProcedenciaTimeseries = () => {
    const monthlyProcedencia: Record<string, Record<string, number>> = {};
    
    // Get 12 months from Aug/2024 to Jul/2025
    const months = [];
    const startDate = new Date(2024, 7, 1); // August 2024 (month is 0-indexed)
    
    for (let i = 0; i < 12; i++) {
      const date = new Date(startDate);
      date.setMonth(startDate.getMonth() + i);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthName = date.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' });
      months.push({ key: monthKey, name: monthName });
      monthlyProcedencia[monthKey] = {
        'Porta': 0,
        'Hospital Cidade Tiradentes': 0,
        'Hospital Jardim IVA': 0,
        'Outros': 0
      };
    }

    // Count procedencias by month
    patients.forEach(patient => {
      if (patient.data_admissao) {
        const admissionDate = new Date(patient.data_admissao);
        const monthKey = `${admissionDate.getFullYear()}-${String(admissionDate.getMonth() + 1).padStart(2, '0')}`;
        
        if (monthlyProcedencia[monthKey] !== undefined) {
          const procedencia = patient.procedencia || '';
          
          // Map procedencias to the 4 required categories
          if (procedencia.includes('SAMU') || procedencia.includes('Bombeiro') || procedencia.toLowerCase().includes('demanda espon')) {
            monthlyProcedencia[monthKey]['Porta']++;
          } else if (procedencia.includes('TIRADENTES')) {
            monthlyProcedencia[monthKey]['Hospital Cidade Tiradentes']++;
          } else if (procedencia.includes('Hospital JD IVA') || procedencia.includes('JD IVA') || procedencia.includes('Jardim IVA')) {
            monthlyProcedencia[monthKey]['Hospital Jardim IVA']++;
          } else {
            monthlyProcedencia[monthKey]['Outros']++;
          }
        }
      }
    });
    
    return months.map(month => ({
      month: month.name,
      'Porta': monthlyProcedencia[month.key]['Porta'],
      'Hospital Cidade Tiradentes': monthlyProcedencia[month.key]['Hospital Cidade Tiradentes'],
      'Hospital Jardim IVA': monthlyProcedencia[month.key]['Hospital Jardim IVA'],
      'Outros': monthlyProcedencia[month.key]['Outros']
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
                Procedência
              </h1>
              <p className="text-lg text-slate-600 font-medium">
                Origem das admissões — Ago/2024 a Jul/2025
              </p>
            </div>
          </div>
        </div>

        {/* Temporal Analysis */}
        <div className="space-y-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-1 h-8 bg-gradient-to-b from-amber-500 to-orange-500 rounded-full"></div>
            <h2 className="text-2xl font-bold text-slate-800 tracking-tight">
              Origem das admissões — Ago/2024 a Jul/2025
            </h2>
          </div>
          
          <MultiLineChart
            data={getProcedenciaTimeseries()}
            title=""
            description=""
            lines={[
              {
                dataKey: 'Porta',
                name: 'Porta (SAMU + demanda espontânea)',
                color: '#1e40af'
              },
              {
                dataKey: 'Hospital Cidade Tiradentes',
                name: 'Hospital Cidade Tiradentes',
                color: '#6b7280'
              },
              {
                dataKey: 'Hospital Jardim IVA',
                name: 'Hospital Jardim IVA',
                color: '#059669'
              },
              {
                dataKey: 'Outros',
                name: 'Outros',
                color: '#f59e0b'
              }
            ]}
          />
          
          {/* Explanatory text */}
          <div className="bg-gradient-to-br from-white to-slate-50/50 shadow-xl backdrop-blur-sm ring-1 ring-slate-200/50 rounded-2xl p-6 mt-6">
            <p className="text-sm text-slate-700 leading-relaxed">
              Nos últimos quatro meses, observou-se uma inversão marcante no perfil de admissões: a "Porta" (SAMU + demanda espontânea) superou os casos regulados pelo SIRESP — cenário incompatível com a vocação do serviço como unidade de "porta fechada". Essa mudança pressiona o pronto-socorro e compromete a previsibilidade assistencial.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}