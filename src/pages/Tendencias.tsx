import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FilterBar, DashboardFilters } from "@/components/dashboard/FilterBar";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { CustomPieChart } from "@/components/dashboard/charts/PieChart";
import { VerticalBarChart } from "@/components/dashboard/charts/VerticalBarChart";
import { HorizontalBarChart } from "@/components/dashboard/charts/HorizontalBarChart";
import { CustomLineChart } from "@/components/dashboard/charts/LineChart";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Clock, Users, RefreshCw, Calendar, TrendingUp, BarChart3 } from "lucide-react";

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

export default function Tendencias() {
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
      
      // Extract unique values for filters
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

  // Calculate main indicators
  const calculateMainIndicators = () => {
    const totalPatients = filteredPatients.length;
    
    // Average stay days
    const avgStayDays = filteredPatients.reduce((acc, p) => 
      acc + (p.dias_internacao || 0), 0) / totalPatients || 0;

    // Group patients by name for readmissions
    const patientGroups = filteredPatients.reduce((acc, patient) => {
      const name = patient.nome;
      if (!acc[name]) {
        acc[name] = [];
      }
      acc[name].push(patient);
      return acc;
    }, {} as Record<string, Patient[]>);
    
    // Calculate readmission rates
    let readmissions7Days = 0;
    let readmissions15Days = 0;
    
    Object.values(patientGroups).forEach(admissions => {
      if (admissions.length > 1) {
        const sortedAdmissions = admissions.sort((a, b) => 
          new Date(a.data_admissao).getTime() - new Date(b.data_admissao).getTime()
        );
        
        for (let i = 1; i < sortedAdmissions.length; i++) {
          const prevDischarge = sortedAdmissions[i-1].data_alta;
          const currentAdmission = sortedAdmissions[i].data_admissao;
          
          if (prevDischarge && currentAdmission) {
            const daysBetween = Math.abs(
              (new Date(currentAdmission).getTime() - new Date(prevDischarge).getTime()) / (1000 * 60 * 60 * 24)
            );
            
            if (daysBetween <= 7) {
              readmissions7Days++;
              readmissions15Days++;
            } else if (daysBetween <= 15) {
              readmissions15Days++;
            }
          }
        }
      }
    });

    return {
      totalPatients,
      avgStayDays: avgStayDays.toFixed(1),
      readmissionRate7Days: totalPatients > 0 ? (readmissions7Days / totalPatients * 100).toFixed(2) : '0.00',
      readmissionRate15Days: totalPatients > 0 ? (readmissions15Days / totalPatients * 100).toFixed(2) : '0.00'
    };
  };

  // Gender distribution
  const getGenderDistribution = () => {
    const genderCount = filteredPatients.reduce((acc, p) => {
      const gender = p.genero === 'MASC' ? 'Masculino' : p.genero === 'FEM' ? 'Feminino' : 'Não informado';
      acc[gender] = (acc[gender] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(genderCount).map(([name, value], index) => ({ 
      name, 
      value, 
      color: `hsl(var(--chart-${index + 1}))` 
    }));
  };

  // Race/Color distribution
  const getRaceDistribution = () => {
    const raceCount = filteredPatients.reduce((acc, p) => {
      const race = p.raca_cor || 'Não informado';
      acc[race] = (acc[race] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const total = filteredPatients.length;
    return Object.entries(raceCount)
      .map(([name, value], index) => ({ 
        name, 
        value: total > 0 ? Math.round((value / total) * 100) : 0,
        count: value,
        color: `hsl(var(--chart-${index + 1}))` 
      }));
  };

  // Age distribution
  const getAgeDistribution = () => {
    const ageRanges = {
      '<18': 0,
      '18–30': 0,
      '31–45': 0,
      '46–60': 0,
      '>60': 0
    };

    filteredPatients.forEach(p => {
      if (!p.data_nascimento) return;
      const age = new Date().getFullYear() - new Date(p.data_nascimento).getFullYear();
      
      if (age < 18) ageRanges['<18']++;
      else if (age <= 30) ageRanges['18–30']++;
      else if (age <= 45) ageRanges['31–45']++;
      else if (age <= 60) ageRanges['46–60']++;
      else ageRanges['>60']++;
    });

    const total = filteredPatients.length;
    return Object.entries(ageRanges).map(([name, count]) => ({ 
      name, 
      value: total > 0 ? Math.round((count / total) * 100) : 0,
      count 
    }));
  };

  // Top diagnoses
  const getTopDiagnoses = () => {
    const diagnosisCount = filteredPatients.reduce((acc, p) => {
      const diagnosis = p.cid_grupo || 'Não informado';
      acc[diagnosis] = (acc[diagnosis] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const total = filteredPatients.length;
    return Object.entries(diagnosisCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([name, value]) => ({ 
        name, 
        value: total > 0 ? Math.round((value / total) * 100) : 0,
        count: value
      }));
  };

  // Average stay by gender
  const getAvgStayByGender = () => {
    const genderStats = filteredPatients.reduce((acc, p) => {
      const gender = p.genero === 'MASC' ? 'Masculino' : p.genero === 'FEM' ? 'Feminino' : 'Não informado';
      if (!acc[gender]) {
        acc[gender] = { total: 0, count: 0 };
      }
      acc[gender].total += p.dias_internacao || 0;
      acc[gender].count += 1;
      return acc;
    }, {} as Record<string, { total: number; count: number }>);

    return Object.entries(genderStats).map(([name, stats]) => ({
      name,
      value: stats.count > 0 ? Number((stats.total / stats.count).toFixed(1)) : 0
    }));
  };

  // Average stay by race (for specific diagnosis)
  const getAvgStayByRace = () => {
    const raceStats = filteredPatients.reduce((acc, p) => {
      const race = p.raca_cor || 'Não informado';
      if (!acc[race]) {
        acc[race] = { total: 0, count: 0 };
      }
      acc[race].total += p.dias_internacao || 0;
      acc[race].count += 1;
      return acc;
    }, {} as Record<string, { total: number; count: number }>);

    return Object.entries(raceStats).map(([name, stats]) => ({
      name,
      value: stats.count > 0 ? Number((stats.total / stats.count).toFixed(1)) : 0
    }));
  };

  // Monthly trends
  const getMonthlyTrends = () => {
    const monthsOrder = [
      { key: 'Janeiro 2025', display: 'Janeiro', month: 1, year: 2025 },
      { key: 'Fevereiro 2025', display: 'Fevereiro', month: 2, year: 2025 },
      { key: 'Março 2025', display: 'Março', month: 3, year: 2025 },
      { key: 'Abril 2025', display: 'Abril', month: 4, year: 2025 },
      { key: 'Maio 2025', display: 'Maio', month: 5, year: 2025 },
      { key: 'Junho 2025', display: 'Junho', month: 6, year: 2025 }
    ];
    
    const monthlyData = filteredPatients.reduce((acc, p) => {
      const admissionDate = new Date(p.data_admissao);
      const month = admissionDate.getMonth() + 1;
      const year = admissionDate.getFullYear();
      
      if (year === 2025 && month >= 1 && month <= 6) {
        const monthKey = monthsOrder.find(m => m.month === month && m.year === year)?.key;
        if (monthKey) {
          acc[monthKey] = (acc[monthKey] || 0) + 1;
        }
      }
      return acc;
    }, {} as Record<string, number>);

    return monthsOrder.map(month => ({
      name: month.display,
      value: monthlyData[month.key] || 0
    }));
  };

  // Generate insights
  const generateInsights = () => {
    const insights = [];
    const metrics = calculateMainIndicators();
    
    // Average stay insight
    if (Number(metrics.avgStayDays) > 14) {
      insights.push(`O tempo médio de permanência de ${metrics.avgStayDays} dias indica perfil de pacientes com quadros de maior complexidade clínica.`);
    }
    
    // Readmission insight
    if (Number(metrics.readmissionRate7Days) < 3) {
      insights.push(`Taxa de reinternação precoce de ${metrics.readmissionRate7Days}% demonstra qualidade na articulação pós-alta com a rede de atenção psicossocial.`);
    }

    // Gender distribution insight
    const genderDist = getGenderDistribution();
    const maleCount = genderDist.find(g => g.name === 'Masculino')?.value || 0;
    const femaleCount = genderDist.find(g => g.name === 'Feminino')?.value || 0;
    if (maleCount > femaleCount * 1.2) {
      insights.push(`Predominância masculina nas internações (${((maleCount / (maleCount + femaleCount)) * 100).toFixed(1)}%) sugere necessidade de estratégias específicas de prevenção para este perfil.`);
    }

    return insights;
  };

  const metrics = calculateMainIndicators();
  const insights = generateInsights();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando análises...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl md:text-3xl font-bold text-primary">
          📊 Análises Cruzadas Clínico-Demográficas
        </h1>
        <p className="text-muted-foreground">
          Tendências e padrões assistenciais com análise interseccional
        </p>
      </div>

      {/* Dynamic Filters */}
      <FilterBar 
        onFiltersChange={applyFilters} 
        availableCaps={availableCaps} 
        availableProcedencias={availableProcedencias}
        availableDiagnoses={availableDiagnoses}
        availableCores={availableCores}
      />

      {/* Main Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Tempo Médio de Permanência"
          value={`${metrics.avgStayDays} dias`}
          description="Indicador de complexidade clínica"
          icon={Clock}
          variant="primary"
        />
        <MetricCard
          title="Total de Pacientes"
          value={metrics.totalPatients}
          description="No período e filtros selecionados"
          icon={Users}
          variant="success"
        />
        <MetricCard
          title="Reinternação ≤ 7 dias"
          value={`${metrics.readmissionRate7Days}%`}
          description="Taxa de reinternação precoce"
          icon={RefreshCw}
          variant="info"
        />
        <MetricCard
          title="Reinternação ≤ 15 dias"
          value={`${metrics.readmissionRate15Days}%`}
          description="Indicador de qualidade assistencial"
          icon={Calendar}
          variant="warning"
        />
      </div>

      {/* Temporal Trend */}
      <CustomLineChart
        data={getMonthlyTrends()}
        title="Tendência Temporal das Internações (Jan–Jun/2025)"
        description="Evolução mensal do número de admissões psiquiátricas"
        color="#1565C0"
      />

      {/* Demographics Distributions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CustomPieChart
          data={getGenderDistribution()}
          title="Distribuição por Gênero"
          description="Proporção de pacientes por gênero"
        />
        <VerticalBarChart
          data={getRaceDistribution()}
          title="Distribuição por Raça/Cor"
          description="Porcentagem de pacientes por raça/cor"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <VerticalBarChart
          data={getAgeDistribution()}
          title="Distribuição por Faixa Etária"
          description="Porcentagem de pacientes por idade"
        />
        <VerticalBarChart
          data={getTopDiagnoses()}
          title="Principais Diagnósticos"
          description="Top 5 patologias mais frequentes (%)"
        />
      </div>

      {/* Cross-sectional Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <HorizontalBarChart
          data={getAvgStayByGender()}
          title="Tempo Médio por Gênero"
          description="Dias de permanência média por gênero"
        />
        <HorizontalBarChart
          data={getAvgStayByRace()}
          title="Tempo Médio por Raça/Cor"
          description="Dias de permanência média por raça/cor"
        />
      </div>

      {/* Insights Section */}
      <Card className="shadow-medium">
        <CardHeader>
          <CardTitle className="text-primary flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Insights Analíticos Automáticos
          </CardTitle>
          <CardDescription>
            Interpretações baseadas nos dados filtrados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {insights.map((insight, index) => (
              <div key={index} className="p-3 bg-muted/50 rounded-lg border-l-4 border-primary">
                <p className="text-sm text-foreground leading-relaxed">{insight}</p>
              </div>
            ))}
            {insights.length === 0 && (
              <p className="text-sm text-muted-foreground italic">
                Selecione filtros específicos para gerar insights personalizados.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}