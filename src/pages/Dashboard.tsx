import { useState, useEffect } from "react";
import { Clock, Users, RefreshCw, Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { FilterBar, DashboardFilters } from "@/components/dashboard/FilterBar";
import { PatientSearch } from "@/components/dashboard/PatientSearch";
import { HorizontalBarChart } from "@/components/dashboard/charts/HorizontalBarChart";
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
}

export default function Dashboard() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [availableCaps, setAvailableCaps] = useState<string[]>([]);
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
      
      // Extract unique CAPS
      const uniqueCaps = [...new Set(data?.map(p => p.caps_referencia).filter(Boolean))];
      setAvailableCaps(uniqueCaps);
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

    if (filters.capsReferencia && filters.capsReferencia[0] !== 'all') {
      filtered = filtered.filter(p => 
        filters.capsReferencia?.includes(p.caps_referencia)
      );
    }

    if (filters.genero && filters.genero !== 'all') {
      filtered = filtered.filter(p => p.genero === filters.genero);
    }

    if (filters.faixaEtaria && filters.faixaEtaria !== 'all') {
      const [min, max] = filters.faixaEtaria.includes('+') 
        ? [parseInt(filters.faixaEtaria), 999]
        : filters.faixaEtaria.split('-').map(Number);
      
      filtered = filtered.filter(p => {
        if (!p.data_nascimento) return false;
        const age = new Date().getFullYear() - new Date(p.data_nascimento).getFullYear();
        return age >= min && age <= max;
      });
    }

    if (filters.dataInicio) {
      filtered = filtered.filter(p => 
        new Date(p.data_admissao) >= filters.dataInicio!
      );
    }

    if (filters.dataFim) {
      filtered = filtered.filter(p => 
        new Date(p.data_admissao) <= filters.dataFim!
      );
    }

    setFilteredPatients(filtered);
  };

  // Calculate metrics
  const calculateMetrics = () => {
    const totalPatients = filteredPatients.length;
    const avgStayDays = filteredPatients.reduce((acc, p) => 
      acc + (p.dias_internacao || 0), 0) / totalPatients || 0;
    
    // Count readmissions (patients with multiple entries)
    const patientNames = filteredPatients.map(p => p.nome);
    const uniqueNames = new Set(patientNames);
    const readmissions = patientNames.length - uniqueNames.size;

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
      const diagnosis = p.cid_grupo || 'Não informado';
      acc[diagnosis] = (acc[diagnosis] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(diagnosisCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 4)
      .map(([name, value]) => ({ name, value, color: `hsl(var(--chart-${Math.floor(Math.random() * 4) + 1}))` }));
  };

  const getGenderDistribution = () => {
    const genderCount = filteredPatients.reduce((acc, p) => {
      const gender = p.genero === 'M' ? 'Masculino' : p.genero === 'F' ? 'Feminino' : 'Não informado';
      acc[gender] = (acc[gender] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(genderCount)
      .map(([name, value]) => ({ name, value, color: `hsl(var(--chart-${name === 'Masculino' ? '1' : '2'}))` }));
  };

  const getAgeDistribution = () => {
    const ageRanges = {
      '0-17': 0,
      '18-30': 0,
      '31-50': 0,
      '51-70': 0,
      '70+': 0
    };

    filteredPatients.forEach(p => {
      if (!p.data_nascimento) return;
      const age = new Date().getFullYear() - new Date(p.data_nascimento).getFullYear();
      
      if (age <= 17) ageRanges['0-17']++;
      else if (age <= 30) ageRanges['18-30']++;
      else if (age <= 50) ageRanges['31-50']++;
      else if (age <= 70) ageRanges['51-70']++;
      else ageRanges['70+']++;
    });

    return Object.entries(ageRanges).map(([name, value]) => ({ name, value }));
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
      <div>
        <h1 className="text-3xl font-bold text-foreground">Visão Geral</h1>
        <p className="text-muted-foreground">Dashboard de análise de pacientes psiquiátricos</p>
      </div>

      <FilterBar onFiltersChange={applyFilters} availableCaps={availableCaps} />

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
        <MetricCard
          title="Período Ativo"
          value={filteredPatients.length > 0 ? "Atual" : "N/A"}
          description="Status do período analisado"
          icon={Calendar}
          variant="info"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <HorizontalBarChart
          data={getTopDiagnoses()}
          title="Top 4 Diagnósticos (CID Grupo)"
          description="Diagnósticos mais frequentes"
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
          description="Número de pacientes por idade"
        />
        <PatientSearch patients={filteredPatients} />
      </div>
    </div>
  );
}