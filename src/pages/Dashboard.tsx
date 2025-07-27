import { useState, useEffect } from "react";
import { Clock, Users, RefreshCw, Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { FilterBar, DashboardFilters } from "@/components/dashboard/FilterBar";
import { PatientSearch } from "@/components/dashboard/PatientSearch";
import { HorizontalBarChart as DiagnosisChart } from "@/components/dashboard/charts/HorizontalBarChart";
import { CustomPieChart } from "@/components/dashboard/charts/PieChart";
import { VerticalBarChart } from "@/components/dashboard/charts/VerticalBarChart";
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
}

export default function Dashboard() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [availableCaps, setAvailableCaps] = useState<string[]>([]);
  const [availableProcedencias, setAvailableProcedencias] = useState<string[]>([]);
  const [availableDiagnoses, setAvailableDiagnoses] = useState<string[]>([]);
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
      
      // Extract unique CAPS, Procedencias, and Diagnoses
      const uniqueCaps = [...new Set(data?.map(p => p.caps_referencia).filter(Boolean))];
      const uniqueProcedencias = [...new Set(data?.map(p => p.procedencia).filter(Boolean))];
      const uniqueDiagnoses = [...new Set(data?.map(p => p.cid_grupo).filter(Boolean))];
      setAvailableCaps(uniqueCaps);
      setAvailableProcedencias(uniqueProcedencias);
      setAvailableDiagnoses(uniqueDiagnoses);
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

    if (filters.faixaEtaria) {
      const [min, max] = filters.faixaEtaria.includes('+') 
        ? [parseInt(filters.faixaEtaria), 999]
        : filters.faixaEtaria.split('-').map(Number);
      
      filtered = filtered.filter(p => {
        if (!p.data_nascimento) return false;
        const age = new Date().getFullYear() - new Date(p.data_nascimento).getFullYear();
        return age >= min && age <= max;
      });
    }

    setFilteredPatients(filtered);
  };

  // Calculate metrics
  const calculateMetrics = () => {
    const totalPatients = filteredPatients.length;
    const avgStayDays = filteredPatients.reduce((acc, p) => 
      acc + (p.dias_internacao || 0), 0) / totalPatients || 0;
    
    // Count readmissions (patients with multiple entries) - count unique patients, not total readmissions
    const patientGroups = filteredPatients.reduce((acc, patient) => {
      const name = patient.nome;
      if (!acc[name]) {
        acc[name] = [];
      }
      acc[name].push(patient);
      return acc;
    }, {} as Record<string, Patient[]>);
    
    const readmissionPatients = Object.entries(patientGroups)
      .filter(([, admissions]) => admissions.length > 1);
    
    const readmissions = readmissionPatients.length;

    return {
      totalPatients,
      avgStayDays: avgStayDays.toFixed(1),
      readmissions,
      avgStayDaysFormatted: `${avgStayDays.toFixed(1)} dias`
    };
  };

  // Prepare chart data
  const getTopDiagnoses = () => {
    const diagnosisCount = filteredPatients.reduce((acc, p) => {
      let diagnosis = p.cid_grupo || 'Não informado';
      
      // Map specific diagnoses as requested
      if (diagnosis === 'Transtornos por uso de substâncias') {
        diagnosis = 'Transt. por uso de SPA';
      } else if (diagnosis === 'Espectro da Esquizofrenia e Transtornos Psicóticos') {
        diagnosis = 'Esquizofrenia e outros';
      } else if (diagnosis === 'Transtornos de personalidade') {
        diagnosis = 'Transtorno de Personalidade';
      } else if (diagnosis === 'Episódios depressivos') {
        diagnosis = 'Depressão Unipolar';
      } else if (diagnosis === 'Transtorno afetivo bipolar') {
        diagnosis = 'Transt. Afetivo Bipolar';
      }
      
      acc[diagnosis] = (acc[diagnosis] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const total = filteredPatients.length;
    return Object.entries(diagnosisCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([name, value], index) => ({ 
        name, 
        value, 
        percentage: total > 0 ? Math.round((value / total) * 100) : 0,
        color: `hsl(var(--chart-${index + 1}))` 
      }));
  };

  const getGenderDistribution = () => {
    const genderCount = filteredPatients.reduce((acc, p) => {
      const gender = p.genero === 'MASC' ? 'Masculino' : 
                     p.genero === 'FEM' ? 'Feminino' : 
                     'Outros';
      acc[gender] = (acc[gender] || 0) + 1;
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
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-2">
          Hospital Planalto
        </h1>
        <h2 className="text-xl font-semibold text-muted-foreground">
          Análise Clínica e Epidemiológica
        </h2>
      </div>

      <FilterBar 
        onFiltersChange={applyFilters} 
        availableCaps={availableCaps} 
        availableProcedencias={availableProcedencias}
        availableDiagnoses={availableDiagnoses}
      />

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard
          title="Tempo Médio de Internação"
          value={metrics.avgStayDaysFormatted}
          description="Média de permanência hospitalar"
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
          title="Reinternações"
          value={metrics.readmissions}
          description="Pacientes com múltiplas internações"
          icon={RefreshCw}
          variant="warning"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DiagnosisChart
          data={getTopDiagnoses()}
          title="Prevalência das principais patologias"
          description="Top 5 diagnósticos mais frequentes"
        />
        <CustomPieChart
          data={getGenderDistribution()}
          title="Distribuição por Gênero"
          description="Proporção de pacientes por gênero"
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