import { useState, useEffect } from "react";
import { Clock, Users, RefreshCw, Calendar, Filter, Database, MapPin, Building2, Palette, UserCheck, Bed, RotateCcw, CalendarX2, Stethoscope, Timer, BarChart3 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { PatientSearch } from "@/components/dashboard/PatientSearch";
import { DashboardSkeleton } from "@/components/dashboard/LoadingSkeletons";
import { EmptyState } from "@/components/ui/empty-state";

import { CustomPieChart } from "@/components/dashboard/charts/PieChart";
import { VerticalBarChart } from "@/components/dashboard/charts/VerticalBarChart";
import { HorizontalBarChart } from "@/components/dashboard/charts/HorizontalBarChart";
import { DischargesByWeekdayChart } from "@/components/dashboard/charts/DischargesByWeekdayChart";
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
  transtorno_categoria: string;
  dia_semana_alta?: number;
}

export default function Dashboard() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [weekdayDischarges, setWeekdayDischarges] = useState<Array<{name: string, value: number, percentage: number}>>([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchPatients();
    fetchWeekdayDischarges();
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

  const fetchWeekdayDischarges = async () => {
    try {
      // Fixed values as specified by user
      const fixedCounts = [92, 68, 75, 60, 62, 18, 10]; // Segunda, Terça, Quarta, Quinta, Sexta, Sábado, Domingo
      const weekdayNames = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];
      
      const total = fixedCounts.reduce((sum, count) => sum + count, 0);
      const result = weekdayNames.map((name, index) => ({
        name,
        value: fixedCounts[index],
        percentage: Math.round((fixedCounts[index] / total) * 100)
      }));

      setWeekdayDischarges(result);

    } catch (error) {
      console.error('Erro ao buscar dados por dia da semana:', error);
    }
  };


  // Calculate metrics
  const calculateMetrics = () => {
    const totalPatients = patients.length;
    
    // Calculate average stay days
    const avgStayDays = patients.reduce((acc, p) => 
      acc + (p.dias_internacao || 0), 0) / totalPatients || 0;
    
    // Calculate 30-day readmission rate using correct algorithm (same as Python reference)
    let reinternacoes = 0;
    let altas_total = 0;

    // Group patients by CNS only (not name fallback)
    const patientGroups = patients.reduce((acc, patient) => {
      if (!patient.cns) return acc; // Skip patients without CNS
      const identifier = patient.cns.toString();
      if (!acc[identifier]) {
        acc[identifier] = [];
      }
      acc[identifier].push(patient);
      return acc;
    }, {} as Record<string, Patient[]>);

    Object.values(patientGroups).forEach(admissions => {
      const sortedAdmissions = admissions.sort((a, b) => 
        new Date(a.data_admissao).getTime() - new Date(b.data_admissao).getTime()
      );
      
      // Get all discharge dates (excluding null/undefined)
      const datas_alta = sortedAdmissions
        .map(admission => admission.data_alta)
        .filter(alta => alta !== null && alta !== undefined);
      
      const datas_adm = sortedAdmissions.map(admission => admission.data_admissao);
      
      // Count readmissions: for each discharge that has a next admission
      for (let i = 0; i < datas_alta.length - 1; i++) {
        altas_total += 1;
        const dischargeDate = new Date(datas_alta[i]);
        const nextAdmissionDate = new Date(datas_adm[i + 1]);
        
        const daysBetween = Math.floor(
          (nextAdmissionDate.getTime() - dischargeDate.getTime()) / (1000 * 60 * 60 * 24)
        );
        
        if (daysBetween > 0 && daysBetween <= 30) {
          reinternacoes++;
        }
      }
      
      // Add the last discharge to total (if exists)
      if (datas_alta.length > 0) {
        altas_total += 1;
      }
    });

    // Calculate overall readmission rate
    const readmissionRate = altas_total > 0 ? (reinternacoes / altas_total * 100) : 0;

    return {
      totalPatients,
      avgStayDays: avgStayDays.toFixed(1),
      avgStayDaysFormatted: `${avgStayDays.toFixed(1)} dias`,
      readmissionRate: readmissionRate.toFixed(1)
    };
  };

  // New Advanced Metrics
  const calculateAdvancedMetrics = () => {
    // Taxa de Ocupação - 16 leitos na enfermaria
    const totalCapacity = 16;
    const currentOccupancy = patients.filter(p => !p.data_alta).length;
    const occupancyRate = totalCapacity > 0 ? (currentOccupancy / totalCapacity * 100) : 0;

    // Taxa de reinternação por período específico (7, 15, 30 dias)
    const calculateReadmissionsByPeriod = (days: number) => {
      let readmissions = 0;
      let eligiblePatients = 0;

      const patientGroups = patients.reduce((acc, patient) => {
        const name = patient.nome;
        if (!acc[name]) {
          acc[name] = [];
        }
        acc[name].push(patient);
        return acc;
      }, {} as Record<string, Patient[]>);

      Object.values(patientGroups).forEach(admissions => {
        const sortedAdmissions = admissions.sort((a, b) => 
          new Date(a.data_admissao).getTime() - new Date(b.data_admissao).getTime()
        );

        if (admissions.length > 1) {
          for (let i = 1; i < sortedAdmissions.length; i++) {
            const prevDischarge = sortedAdmissions[i-1].data_alta;
            const currentAdmission = sortedAdmissions[i].data_admissao;
            
            if (prevDischarge && currentAdmission) {
              const daysBetween = Math.abs(
                (new Date(currentAdmission).getTime() - new Date(prevDischarge).getTime()) / (1000 * 60 * 60 * 24)
              );
              
              eligiblePatients++;
              if (daysBetween <= days) {
                readmissions++;
              }
            }
          }
        }
      });

      return eligiblePatients > 0 ? (readmissions / eligiblePatients * 100) : 0;
    };

    const readmission7Days = calculateReadmissionsByPeriod(7);
    const readmission15Days = calculateReadmissionsByPeriod(15);
    const readmission30Days = calculateReadmissionsByPeriod(30);

    // % de altas no fim de semana
    const weekendDischarges = patients.filter(p => {
      if (!p.data_alta) return false;
      const dischargeDate = new Date(p.data_alta);
      const dayOfWeek = dischargeDate.getDay();
      return dayOfWeek === 0 || dayOfWeek === 6; // Sunday = 0, Saturday = 6
    }).length;

    const totalDischarges = patients.filter(p => p.data_alta).length;
    const weekendDischargeRate = totalDischarges > 0 ? (weekendDischarges / totalDischarges * 100) : 0;

    // Volume de interconsultas (simulado - mês atual)
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const currentMonthPatients = patients.filter(p => {
      if (!p.data_admissao) return false;
      const admissionDate = new Date(p.data_admissao);
      return admissionDate.getMonth() === currentMonth && admissionDate.getFullYear() === currentYear;
    }).length;
    
    // Simulando que 30% dos pacientes do mês geram interconsultas
    const interconsultationsVolume = Math.round(currentMonthPatients * 0.3);

    // Tempo de resposta (simulado)
    const responseTime60min = Math.round(Math.random() * 20 + 60); // 60-80%
    const responseTime120min = Math.round(Math.random() * 15 + 85); // 85-100%

    return {
      occupancyRate: occupancyRate.toFixed(1),
      readmission7Days: readmission7Days.toFixed(1),
      readmission15Days: readmission15Days.toFixed(1),
      readmission30Days: readmission30Days.toFixed(1),
      weekendDischargeRate: weekendDischargeRate.toFixed(1),
      interconsultationsVolume,
      responseTime60min,
      responseTime120min,
      currentOccupancy,
      totalCapacity
    };
  };

  // Prepare chart data for mental disorders classification
  const getMentalDisorders = () => {
    const disorderCount = patients.reduce((acc, p) => {
      const categoria = p.transtorno_categoria;
      
      // Skip if no category or "outros"
      if (!categoria || categoria === 'outros') {
        return acc;
      }
      
      // Map categories to display names
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
      "#0ea5e9", // sky blue - Esquizofrenia
      "#10b981", // emerald green - Transtorno Bipolar
      "#f97316", // orange - Substâncias
      "#6366f1", // indigo - Depressivo Unipolar
      "#14b8a6", // teal - Personalidade
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

  // Keep original function for other charts
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

  // Timeseries data functions
  const getOccupancyTimeseries = () => {
    const monthlyOccupancy: Record<string, { admissions: number; discharges: number; occupancy: number }> = {};
    const totalCapacity = 16;

    // Get last 12 months
    const months = [];
    for (let i = 11; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthName = date.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' });
      months.push({ key: monthKey, name: monthName });
      monthlyOccupancy[monthKey] = { admissions: 0, discharges: 0, occupancy: 0 };
    }

    // Count admissions and discharges by month
    patients.forEach(patient => {
      if (patient.data_admissao) {
        const admissionDate = new Date(patient.data_admissao);
        const monthKey = `${admissionDate.getFullYear()}-${String(admissionDate.getMonth() + 1).padStart(2, '0')}`;
        if (monthlyOccupancy[monthKey] !== undefined) {
          monthlyOccupancy[monthKey].admissions++;
        }
      }

      if (patient.data_alta) {
        const dischargeDate = new Date(patient.data_alta);
        const monthKey = `${dischargeDate.getFullYear()}-${String(dischargeDate.getMonth() + 1).padStart(2, '0')}`;
        if (monthlyOccupancy[monthKey] !== undefined) {
          monthlyOccupancy[monthKey].discharges++;
        }
      }
    });

    // Calculate occupancy rate for each month (simplified calculation)
    let runningOccupancy = 0;
    return months.map(month => {
      const data = monthlyOccupancy[month.key];
      runningOccupancy += data.admissions - data.discharges;
      const occupancyRate = Math.max(0, (runningOccupancy / totalCapacity) * 100);
      
      return {
        name: month.name,
        value: Math.round(occupancyRate),
        admissions: data.admissions,
        discharges: data.discharges
      };
    });
  };


  const metrics = calculateMetrics();
  const advancedMetrics = calculateAdvancedMetrics();

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
    <div className="min-h-screen bg-gray-100">
      <div className="space-y-6 lg:space-y-8">
        
        {/* Header Section */}
        <div className="mb-4 lg:mb-8">
          <div className="flex items-center gap-3 lg:gap-4 mb-3">
            <div className="p-2 lg:p-3 bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-700 rounded-xl lg:rounded-2xl shadow-xl shadow-blue-500/25">
              <BarChart3 className="h-6 w-6 lg:h-8 lg:w-8 text-white drop-shadow-sm" />
            </div>
            <div>
              <h1 className="text-2xl lg:text-4xl font-black text-slate-800 tracking-tight">
                Visão Geral
              </h1>
              <p className="text-sm lg:text-lg text-slate-600 font-medium">
                Dashboard principal com métricas gerais do serviço
              </p>
            </div>
          </div>
        </div>

        {/* Cards Superiores */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-6">
          <MetricCard
            title="Média de Permanência"
            value="13,6"
            description="Tempo médio de internação"
            icon={Clock}
            variant="primary"
          />
          <MetricCard
            title="Taxa de Ocupação"
            value="88,7%"
            description="Percentual médio de ocupação"
            icon={Bed}
            variant="success"
          />
          <MetricCard
            title="Taxa de Reinternação"
            value="1,08%"
            description="Em até 15 dias"
            icon={RefreshCw}
            variant="warning"
          />
        </div>

        {/* Gráficos Principais */}
        <div className="space-y-4 lg:space-y-6">
          <div className="flex items-center space-x-3 mb-4 lg:mb-6">
            <div className="w-1 h-6 lg:h-8 bg-gradient-to-b from-blue-500 to-emerald-500 rounded-full"></div>
            <h2 className="text-lg lg:text-2xl font-bold text-slate-800 tracking-tight">
              Principais Indicadores
            </h2>
          </div>
          
          {/* 3 Gráficos Superiores */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
            <MiniChart
              data={[
                { name: "Feminino", value: 55, color: "#10b981" },
                { name: "Masculino", value: 45, color: "#0ea5e9" }
              ]}
              title="Distribuição por Gênero"
              subtitle="Feminino, Masculino"
              type="pie"
              icon={Users}
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

            <MiniChart
              data={[
                { name: "Parda", value: 50, color: "#6366f1" },
                { name: "Branca", value: 42, color: "#10b981" },
                { name: "Preta", value: 8, color: "#f59e0b" }
              ]}
              title="Distribuição por Cor"
              subtitle="Parda, Branca, Preta"
              type="pie"
              icon={Palette}
            />
          </div>

          {/* Principais Patologias */}
          <div className="grid grid-cols-1 gap-4 lg:gap-6">
            <div className="bg-gradient-to-br from-slate-50 to-white shadow-lg backdrop-blur-sm ring-1 ring-slate-200/50 rounded-xl">
              <div className="p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg">
                    <Stethoscope className="h-4 w-4 text-white" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-800 tracking-wide">Principais Patologias</h3>
                </div>
                
                <div className="flex-1 space-y-3">
                  {[
                    { name: "Esquizofrenia", value: 50.8, color: "#0ea5e9" },
                    { name: "Transtorno Bipolar", value: 26.5, color: "#10b981" },
                    { name: "Substâncias", value: 13.6, color: "#f97316" },
                    { name: "Depressivo Unipolar", value: 5.6, color: "#6366f1" },
                    { name: "Personalidade", value: 3.5, color: "#14b8a6" }
                  ].map((item, index) => (
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
        </div>


        {/* Gráfico de Altas por Dia da Semana */}
        <div className="space-y-4 lg:space-y-6">
          <div className="flex items-center space-x-3 mb-4 lg:mb-6">
            <div className="w-1 h-6 lg:h-8 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full"></div>
            <h2 className="text-lg lg:text-2xl font-bold text-slate-800 tracking-tight">
              Análise Temporal
            </h2>
          </div>
          
          <div className="grid grid-cols-1 gap-4 lg:gap-6">
            <DischargesByWeekdayChart
              data={weekdayDischarges}
              title="Altas por Dia da Semana"
              description="Distribuição das altas hospitalares por dia da semana"
            />
          </div>
        </div>

      </div>
    </div>
  );
}