import { useState, useEffect } from "react";
import { Clock, Users, RefreshCw, Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { FilterBar, DashboardFilters } from "@/components/dashboard/FilterBar";
import { PatientSearch } from "@/components/dashboard/PatientSearch";

import { CustomPieChart } from "@/components/dashboard/charts/PieChart";
import { VerticalBarChart } from "@/components/dashboard/charts/VerticalBarChart";
import { HorizontalBarChart } from "@/components/dashboard/charts/HorizontalBarChart";
import { CustomLineChart } from "@/components/dashboard/charts/LineChart";
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
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [availableCaps, setAvailableCaps] = useState<string[]>([]);
  const [availableProcedencias, setAvailableProcedencias] = useState<string[]>([]);
  const [availableDiagnoses, setAvailableDiagnoses] = useState<string[]>([]);
  const [availableCores, setAvailableCores] = useState<string[]>([]);
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
      setFilteredPatients(data || []);
      
      // Extract unique CAPS, Procedencias, Diagnoses, and Cores
      const uniqueCaps = [...new Set(data?.map(p => p.caps_referencia).filter(Boolean))];
      const uniqueProcedencias = [...new Set(data?.map(p => p.procedencia).filter(Boolean))];
      const uniqueDiagnoses = [...new Set(data?.map(p => p.cid_grupo).filter(Boolean))];
      const uniqueCores = [...new Set(data?.map(p => p.raca_cor).filter(Boolean))];
      setAvailableCaps(uniqueCaps);
      setAvailableProcedencias(uniqueProcedencias);
      setAvailableDiagnoses(uniqueDiagnoses);
      setAvailableCores(uniqueCores);
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

  const applyFilters = (filters: DashboardFilters) => {
    let filtered = [...patients];

    if (filters.capsReferencia) {
      filtered = filtered.filter(p => p.caps_referencia === filters.capsReferencia);
    }

    if (filters.genero) {
      filtered = filtered.filter(p => p.genero === filters.genero);
    }

    if (filters.procedencia) {
      filtered = filtered.filter(p => p.procedencia === filters.procedencia);
    }

    if (filters.patologia) {
      filtered = filtered.filter(p => p.cid_grupo === filters.patologia);
    }

    if (filters.cor) {
      filtered = filtered.filter(p => p.raca_cor === filters.cor);
    }

    if (filters.faixaEtaria) {
      filtered = filtered.filter(p => {
        if (!p.data_nascimento) return false;
        const age = new Date().getFullYear() - new Date(p.data_nascimento).getFullYear();
        
        switch (filters.faixaEtaria) {
          case '<18': return age < 18;
          case '18–25': return age >= 18 && age <= 25;
          case '26–44': return age >= 26 && age <= 44;
          case '45–64': return age >= 45 && age <= 64;
          case '65+': return age >= 65;
          default: return true;
        }
      });
    }

    setFilteredPatients(filtered);
  };

  // Calculate metrics
  const calculateMetrics = () => {
    const totalPatients = filteredPatients.length;
    
    // Calculate average stay days
    const avgStayDays = filteredPatients.reduce((acc, p) => 
      acc + (p.dias_internacao || 0), 0) / totalPatients || 0;
    
    // Group patients by name to identify readmissions
    const patientGroups = filteredPatients.reduce((acc, patient) => {
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
    const diagnosisCount = filteredPatients.reduce((acc, p) => {
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

    const total = filteredPatients.length;
    const chartColors = [
      "hsl(220 70% 35%)",  // Blue
      "hsl(160 76% 36%)",  // Teal
      "hsl(340 82% 52%)",  // Rose
      "hsl(260 85% 58%)",  // Purple
      "hsl(35 91% 62%)"    // Orange
    ];
    
    return Object.entries(diagnosisCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([name, value], index) => ({ 
        name, 
        value, 
        percentage: total > 0 ? Math.round((value / total) * 100) : 0,
        color: chartColors[index] || "hsl(var(--chart-1))"
      }));
  };

  const getGenderDistribution = () => {
    const genderCount = filteredPatients.reduce((acc, p) => {
      if (p.genero === 'MASC') {
        acc['Masculino'] = (acc['Masculino'] || 0) + 1;
      } else if (p.genero === 'FEM') {
        acc['Feminino'] = (acc['Feminino'] || 0) + 1;
      }
      // Skip "Outros" category entirely
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(genderCount)
      .map(([name, value], index) => ({ 
        name, 
        value, 
        color: `hsl(var(--chart-${index + 1}))` 
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

    filteredPatients.forEach(p => {
      if (!p.data_nascimento) return;
      const age = new Date().getFullYear() - new Date(p.data_nascimento).getFullYear();
      
      if (age < 18) ageRanges['<18']++;
      else if (age <= 25) ageRanges['18–25']++;
      else if (age <= 44) ageRanges['26–44']++;
      else if (age <= 64) ageRanges['45–64']++;
      else ageRanges['65+']++;
    });

    const total = filteredPatients.length;
    return Object.entries(ageRanges).map(([name, count]) => ({ 
      name, 
      value: total > 0 ? Math.round((count / total) * 100) : 0,
      count 
    }));
  };

  // Monthly trends for line chart - limited to Jan-Jun 2025
  const getMonthlyTrends = () => {
    const monthsOrder = [
      { key: 'Janeiro 2025', display: 'Janeiro 2025', month: 1, year: 2025 },
      { key: 'Fevereiro 2025', display: 'Fevereiro 2025', month: 2, year: 2025 },
      { key: 'Março 2025', display: 'Março 2025', month: 3, year: 2025 },
      { key: 'Abril 2025', display: 'Abril 2025', month: 4, year: 2025 },
      { key: 'Maio 2025', display: 'Maio 2025', month: 5, year: 2025 },
      { key: 'Junho 2025', display: 'Junho 2025', month: 6, year: 2025 }
    ];
    
    const monthlyData = filteredPatients.reduce((acc, p) => {
      const admissionDate = new Date(p.data_admissao);
      const month = admissionDate.getMonth() + 1; // getMonth() returns 0-11
      const year = admissionDate.getFullYear();
      
      // Only include data for January to June 2025
      if (year === 2025 && month >= 1 && month <= 6) {
        const monthKey = monthsOrder.find(m => m.month === month && m.year === year)?.key;
        if (monthKey) {
          acc[monthKey] = (acc[monthKey] || 0) + 1;
        }
      }
      return acc;
    }, {} as Record<string, number>);

    // Return all months with their counts (0 if no data)
    return monthsOrder.map(month => ({
      name: month.display,
      value: monthlyData[month.key] || 0
    }));
  };

  const metrics = calculateMetrics();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando dados...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      <FilterBar 
        onFiltersChange={applyFilters} 
        availableCaps={availableCaps} 
        availableProcedencias={availableProcedencias}
        availableDiagnoses={availableDiagnoses}
        availableCores={availableCores}
      />

      {/* Enhanced Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard
          title="Tempo Médio de Permanência"
          value={metrics.avgStayDaysFormatted}
          description="Compatível com perfil de maior gravidade"
          icon={Clock}
          variant="primary"
        />
        <MetricCard
          title="Total de Pacientes"
          value={metrics.totalPatients}
          description="Pacientes no período analisado"
          icon={Users}
          variant="success"
        />
        <MetricCard
          title="Taxa de Readmissão"
          value={`${metrics.readmissionRate}%`}
          description="Percentual de pacientes reinternados"
          icon={RefreshCw}
          variant="info"
        />
      </div>

      {/* Main Chart - Temporal Trend */}
      <div className="space-y-6">
        <CustomLineChart
          data={getMonthlyTrends()}
          title="Tendência Temporal das Internações (Jan–Jun/2025)"
          description="Evolução mensal do número de admissões psiquiátricas"
          color="#1565C0"
        />
      </div>

      {/* Secondary Charts */}
      <div className="grid grid-cols-1 gap-6">
        <VerticalBarChart
          data={getTopDiagnoses().map(item => ({
            name: item.name,
            value: item.percentage
          }))}
          title="Prevalência das Principais Patologias"
          description="Top 5 diagnósticos mais frequentes (%)"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <VerticalBarChart
          data={getAgeDistribution()}
          title="Distribuição por Faixa Etária"
          description="Porcentagem de pacientes por idade"
        />
        <PatientSearch patients={filteredPatients} />
      </div>
    </div>
  );
}