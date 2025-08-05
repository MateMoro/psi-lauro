import { useState, useEffect } from "react";
import { Clock, Users, RefreshCw, Calendar, Filter, Database, MapPin, Building2, Palette, UserCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { PatientSearch } from "@/components/dashboard/PatientSearch";
import { DashboardSkeleton } from "@/components/dashboard/LoadingSkeletons";
import { EmptyState } from "@/components/ui/empty-state";

import { CustomPieChart } from "@/components/dashboard/charts/PieChart";
import { VerticalBarChart } from "@/components/dashboard/charts/VerticalBarChart";
import { HorizontalBarChart } from "@/components/dashboard/charts/HorizontalBarChart";
import { MiniChart } from "@/components/dashboard/MiniChart";
import { RadialChart } from "@/components/dashboard/RadialChart";
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

export default function Dashboard() {
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


  // Calculate metrics
  const calculateMetrics = () => {
    const totalPatients = patients.length;
    
    // Calculate average stay days
    const avgStayDays = patients.reduce((acc, p) => 
      acc + (p.dias_internacao || 0), 0) / totalPatients || 0;
    
    // Group patients by name to identify readmissions
    const patientGroups = patients.reduce((acc, patient) => {
      const name = patient.nome;
      if (!acc[name]) {
        acc[name] = [];
      }
      acc[name].push(patient);
      return acc;
    }, {} as Record<string, Patient[]>);
    
  // Calculate total readmission rate for dashboard
    let totalReadmissionEvents = 0;
    let totalPatientsWithDischarge = 0;
    
    Object.values(patientGroups).forEach(admissions => {
      const sortedAdmissions = admissions.sort((a, b) => 
        new Date(a.data_admissao).getTime() - new Date(b.data_admissao).getTime()
      );
      
      // Count patients with at least one discharge (eligible for readmission)
      const hasDischarge = sortedAdmissions.some(admission => admission.data_alta);
      if (hasDischarge) {
        totalPatientsWithDischarge++;
      }
      
      if (admissions.length > 1) {
        // Check intervals between consecutive admissions
        for (let i = 1; i < sortedAdmissions.length; i++) {
          const prevDischarge = sortedAdmissions[i-1].data_alta;
          const currentAdmission = sortedAdmissions[i].data_admissao;
          
          if (prevDischarge && currentAdmission) {
            const daysBetween = Math.abs(
              (new Date(currentAdmission).getTime() - new Date(prevDischarge).getTime()) / (1000 * 60 * 60 * 24)
            );
            
            if (daysBetween >= 0) {
              totalReadmissionEvents++;
            }
          }
        }
      }
    });

    // Calculate overall readmission rate
    const readmissionRate = totalPatientsWithDischarge > 0 ? (totalReadmissionEvents / totalPatientsWithDischarge * 100) : 0;

    return {
      totalPatients,
      avgStayDays: avgStayDays.toFixed(1),
      avgStayDaysFormatted: `${avgStayDays.toFixed(1)} dias`,
      readmissionRate: readmissionRate.toFixed(1)
    };
  };

  // Prepare chart data
  const getTopDiagnoses = () => {
    const diagnosisCount = patients.reduce((acc, p) => {
      let diagnosis = p.cid_grupo || 'Não informado';
      
      // Skip unwanted diagnoses
      if (diagnosis === 'Psicose Não Especificada / Diagnóstico Provisório') {
        return acc;
      }
      
      // Map specific diagnoses as requested - removed line breaks for horizontal chart
      if (diagnosis === 'Transtornos por uso de substâncias') {
        diagnosis = 'Transtornos por uso de SPA';
      } else if (diagnosis === 'Espectro da Esquizofrenia e Transtornos Psicóticos') {
        diagnosis = 'Esquizofrenia e outros';
      } else if (diagnosis === 'Transtornos de personalidade') {
        diagnosis = 'Transtorno de Personalidade';
      } else if (diagnosis === 'Episódios depressivos') {
        diagnosis = 'Transtorno Depressivo Unipolar';
      } else if (diagnosis === 'Transtorno afetivo bipolar') {
        diagnosis = 'Transtorno Afetivo Bipolar';
      }
      
      acc[diagnosis] = (acc[diagnosis] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const total = patients.length;
    const chartColors = [
      "#0ea5e9", // sky blue
      "#10b981", // emerald green  
      "#f97316", // orange
      "#6366f1", // indigo
      "#14b8a6", // teal
      "#e11d48", // rose
      "#7c3aed", // violet
      "#dc2626", // red
      "#059669", // green
      "#0284c7", // blue
      "#ca8a04", // yellow
      "#be185d", // pink
      "#7c2d12", // brown
      "#374151", // gray
      "#1f2937", // dark gray
      "#991b1b", // dark red
      "#166534", // dark green
      "#1e40af", // dark blue
      "#a21caf", // fuchsia
      "#ea580c"  // amber
    ];
    
    // Helper function to capitalize first letter
    const capitalizeFirst = (str: string): string => {
      if (!str) return str;
      return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    };

    return Object.entries(diagnosisCount)
      .sort(([,a], [,b]) => b - a)
      .map(([name, value], index) => ({ 
        name: capitalizeFirst(name), 
        value, 
        percentage: total > 0 ? Math.round((value / total) * 100) : 0,
        color: chartColors[index % chartColors.length] || "#6b7280"
      }));
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

    const capitalizeFirst = (str: string): string => {
      if (!str) return str;
      return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    };

    return Object.entries(genderCount)
      .filter(([, value]) => value > 0)  // Only include categories with data
      .map(([name, value], index) => ({ 
        name: capitalizeFirst(name), 
        value, 
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

  // New chart data functions
  const getCapsDistribution = () => {
    const capsCount = patients.reduce((acc, p) => {
      const caps = p.caps_referencia || 'Não informado';
      acc[caps] = (acc[caps] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#84cc16', '#eab308', '#f97316', '#ec4899'];
    return Object.entries(capsCount)
      .sort(([,a], [,b]) => b - a)
      .map(([name, value], index) => ({ 
        name,
        value, 
        fill: colors[index % colors.length] || '#6b7280'
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

  const getRaceDistribution = () => {
    const raceCount = patients.reduce((acc, p) => {
      const race = p.raca_cor || 'Não informado';
      acc[race] = (acc[race] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const colors = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#84cc16', '#eab308'];
    return Object.entries(raceCount)
      .sort(([,a], [,b]) => b - a)
      .map(([name, value], index) => ({ 
        name, 
        value, 
        fill: colors[index % colors.length] || '#6b7280'
      }));
  };

  const getGenderByDiagnosisData = () => {
    const combinations = patients.reduce((acc, p) => {
      if (!p.cid_grupo || !p.genero) return acc;
      
      const diagnosis = p.cid_grupo;
      const gender = p.genero === 'MASC' ? 'M' : p.genero === 'FEM' ? 'F' : 'O';
      const key = `${diagnosis} (${gender})`;
      
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(combinations)
      .sort(([,a], [,b]) => b - a)
      .map(([name, value]) => ({ 
        name, 
        value 
      }));
  };

  const getAgeByDiagnosisData = () => {
    const combinations = patients.reduce((acc, p) => {
      if (!p.cid_grupo || !p.data_nascimento) return acc;
      
      const age = new Date().getFullYear() - new Date(p.data_nascimento).getFullYear();
      let ageGroup = '';
      if (age < 18) ageGroup = '<18';
      else if (age <= 25) ageGroup = '18-25';
      else if (age <= 44) ageGroup = '26-44';
      else if (age <= 64) ageGroup = '45-64';
      else ageGroup = '65+';
      
      const diagnosis = p.cid_grupo;
      const key = `${diagnosis} [${ageGroup}]`;
      
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(combinations)
      .sort(([,a], [,b]) => b - a)
      .map(([name, value]) => ({ 
        name, 
        value 
      }));
  };

  const metrics = calculateMetrics();

  if (loading) {
    return <DashboardSkeleton />;
  }

  // Check if no data is available
  if (patients.length === 0) {
    return (
      <EmptyState
        icon={Database}
        title="Nenhum dado encontrado"
        description="Não foi possível encontrar dados de pacientes. Verifique a conexão com o banco de dados ou entre em contato com o administrador do sistema."
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
          <h1 className="text-4xl font-black text-slate-800 tracking-tight mb-2">
            Analytics Dashboard
          </h1>
          <p className="text-lg text-slate-600 font-medium">
            Visão geral dos dados de pacientes psiquiátricos
          </p>
        </div>

        {/* Modern Compact Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <MetricCard
            title="Tempo Médio"
            value={metrics.avgStayDays}
            description="dias de permanência"
            icon={Clock}
            variant="primary"
          />
          <MetricCard
            title="Pacientes"
            value={metrics.totalPatients}
            description="total no período"
            icon={Users}
            variant="success"
          />
          <MetricCard
            title="Readmissões"
            value={`${metrics.readmissionRate}%`}
            description="taxa de retorno"
            icon={RefreshCw}
            variant="info"
          />
        </div>

        {/* Analytics Section */}
        <div className="space-y-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-1 h-8 bg-gradient-to-b from-blue-500 to-emerald-500 rounded-full"></div>
            <h2 className="text-2xl font-bold text-slate-800 tracking-tight">
              Análises Detalhadas
            </h2>
          </div>
          
          {/* Primary Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <MiniChart
              data={getTopDiagnoses()}
              title="Principais Patologias"
              subtitle="Todos os diagnósticos"
              type="bar"
              total={patients.length}
            />
            
            <MiniChart
              data={getGenderDistribution().map(item => ({
                name: item.name,
                value: Math.round((item.value / patients.length) * 100),
                color: item.color
              }))}
              title="Distribuição de Gênero"
              subtitle="Pacientes por sexo"
              type="pie"
            />
            
            <MiniChart
              data={getAgeDistribution()}
              title="Faixa Etária"
              subtitle="Distribuição por idade"
              type="bar"
            />

            <MiniChart
              data={getCapsDistribution().map(item => ({
                name: item.name,
                value: Math.round((item.value / patients.length) * 100),
                color: item.fill
              }))}
              title="CAPS Referência"
              subtitle="Principais unidades"
              type="pie"
              icon={Building2}
            />
          </div>

          {/* Secondary Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <MiniChart
              data={getRaceDistribution().map(item => ({
                name: item.name,
                value: Math.round((item.value / patients.length) * 100),
                color: item.fill
              }))}
              title="Distribuição Racial"
              subtitle="Cor/raça declarada"
              type="pie"
              icon={Palette}
            />

            <MiniChart
              data={getProcedenciaDistribution()}
              title="Procedência"
              subtitle="Origem dos encaminhamentos"
              type="bar"
              icon={MapPin}
            />

            <MiniChart
              data={getCapsDistribution().slice(0, 3).map(item => ({
                name: item.name,
                value: Math.round((item.value / patients.length) * 100),
                color: item.fill
              }))}
              title="CAPS Principais"
              subtitle="Top 3 unidades"
              type="pie"
              icon={Building2}
            />
          </div>

          {/* Combination Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <MiniChart
              data={getGenderByDiagnosisData()}
              title="Gênero × Diagnóstico"
              subtitle="Combinações mais frequentes"
              type="bar"
              icon={Users}
            />

            <MiniChart
              data={getAgeByDiagnosisData()}
              title="Idade × Diagnóstico" 
              subtitle="Padrões por faixa etária"
              type="bar"
              icon={Calendar}
            />
          </div>
        </div>

        {/* Patient Search Section */}
        <div className="space-y-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-1 h-8 bg-gradient-to-b from-emerald-500 to-orange-500 rounded-full"></div>
            <h2 className="text-2xl font-bold text-slate-800 tracking-tight">
              Busca de Pacientes
            </h2>
          </div>
          
          <PatientSearch patients={patients} />
        </div>
      </div>
    </div>
  );
}