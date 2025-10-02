import { useState, useEffect, useCallback } from "react";
import { Activity, Clock, RotateCcw, Bed, Timer, CalendarX2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { DashboardSkeleton } from "@/components/dashboard/LoadingSkeletons";
import { EmptyState } from "@/components/ui/empty-state";
import { MiniChart } from "@/components/dashboard/MiniChart";
import { useToast } from "@/hooks/use-toast";
import { useHospital } from "@/contexts/HospitalContext";
import { calculateCorrectAverageStay, calculateReadmissionRate, formatDecimalBR } from "@/lib/hospital-utils";

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
  cns?: string;
  dia_semana_alta?: number;
}

type PeriodFilter = 'month' | 'quarter' | 'year';

interface TimeseriesData {
  name: string;
  value: number;
  period?: string;
  quarter?: string;
  year?: string;
}

export default function IndicadoresAssistenciais() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const periodFilter: PeriodFilter = 'month';
  const { toast } = useToast();
  const { getTableName, getCapacity, selectedHospital } = useHospital();

  const fetchPatients = useCallback(async () => {
    try {
      const tableName = getTableName();
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .range(0, 4999);

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
  }, [getTableName, toast]);

  useEffect(() => {
    fetchPatients();
  }, [fetchPatients, getTableName]);


  const parseLocalDate = (s?: string | null): Date | null => {
  if (!s) return null;
  // Aceita 'YYYY-MM-DD' e constrói Data local (sem UTC shift)
  const [y, m, d] = s.split('-').map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
};

  const todayLocal = () => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
};

  const lastDayOfPreviousMonth = () => {
    const now = todayLocal();
  // dia 0 do mês atual = último dia do mês anterior
    return new Date(now.getFullYear(), now.getMonth(), 0);
};

  const firstDayOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth(), 1);
  const lastDayOfMonth  = (d: Date) => new Date(d.getFullYear(), d.getMonth() + 1, 0);

  const calculateOccupancyRateAverage = () => {
    const totalCapacity = getCapacity();
    if (totalCapacity <= 0 || patients.length === 0) return 0;

    const { start: periodStart, end: periodEnd } = getOccupancyDateRange();

    // Gera meses do início até o fim (mês anterior ao atual)
    const months: Date[] = [];
    const cursor = new Date(periodStart.getFullYear(), periodStart.getMonth(), 1);
    const endMonth = new Date(periodEnd.getFullYear(), periodEnd.getMonth(), 1);
    while (cursor <= endMonth) {
      months.push(new Date(cursor));
      cursor.setMonth(cursor.getMonth() + 1);
    }

    let sumMonthly = 0;
    let countMonthly = 0;

    for (const month of months) {
      const monthStart = firstDayOfMonth(month);
      const monthEnd   = lastDayOfMonth(month);

      // todos os dias do mês
      const days: Date[] = [];
      for (let d = new Date(monthStart); d <= monthEnd; d.setDate(d.getDate() + 1)) {
        days.push(new Date(d));
      }

      const dailyRates: number[] = days.map(day => {
        // Filtra internações ativas no dia
        const onDay = patients.filter(p => {
          const adm  = parseLocalDate(p.data_admissao);
          const alta = parseLocalDate(p.data_alta ?? null);
          if (!adm) return false;
          return adm <= day && (!alta || alta >= day);
        });

        // Únicos por CNS (fallback opcional para não perder sem CNS)
        const unique = new Set<string>();
        for (const p of onDay) {
          const key = p.cns?.toString().trim() || `__NO_CNS__:${p.nome ?? ''}`;
          unique.add(key);
        }

        return unique.size / totalCapacity; // proporção (0..1+)
      });

      const monthlyAvg = dailyRates.length
        ? dailyRates.reduce((a, b) => a + b, 0) / dailyRates.length
        : 0;

      sumMonthly += monthlyAvg;
      countMonthly += 1;
    }

    const avgOccupancyRatePct = countMonthly ? (sumMonthly / countMonthly) * 100 : 0;
    return Number(avgOccupancyRatePct.toFixed(1));
  };


  // Calculate advanced metrics
  const calculateAdvancedMetrics = () => {
    const totalPatients = patients.length;

    // Average stay days - using correct algorithm from Python reference
    const avgStayDays = calculateCorrectAverageStay(patients);

    // Taxa de Ocupação - calculate average for Aug 2024 - Jul 2025
    const occupancyRate = calculateOccupancyRateAverage();

    // Current occupancy for reference
    const totalCapacity = getCapacity();
    const currentOccupancy = patients.filter(p => !p.data_alta).length;

    // Taxa de reinternação por período específico - usando função compartilhada
    const readmission7Days = calculateReadmissionRate(patients, 7);
    const readmission15Days = calculateReadmissionRate(patients, 15);
    const readmission30Days = calculateReadmissionRate(patients, 30);

    // % de altas no fim de semana
    const weekendDischarges = patients.filter(p => {
      if (!p.dia_semana_alta) return false;
      // dia_semana_alta: 1=Segunda, ..., 6=Sábado, 7=Domingo
      return p.dia_semana_alta === 6 || p.dia_semana_alta === 7;
    }).length;

    const totalDischarges = patients.filter(p => p.dia_semana_alta).length;
    const weekendDischargeRate = totalDischarges > 0 ? (weekendDischarges / totalDischarges * 100) : 0;

    // Tempo de resposta (simulado)
    const responseTime60min = Math.round(Math.random() * 20 + 60);
    const responseTime120min = Math.round(Math.random() * 15 + 85);

    return {
      totalPatients,
      avgStayDays: formatDecimalBR(avgStayDays),
      occupancyRate: formatDecimalBR(occupancyRate),
      readmission7Days: formatDecimalBR(readmission7Days),
      readmission15Days: formatDecimalBR(readmission15Days),
      readmission30Days: formatDecimalBR(readmission30Days),
      weekendDischargeRate: formatDecimalBR(weekendDischargeRate),
      responseTime60min,
      responseTime120min,
      currentOccupancy,
      totalCapacity
    };
  };

  const getOccupancyDateRange = () => {
    if (patients.length === 0) {
      const prev = lastDayOfPreviousMonth();
      return { start: firstDayOfMonth(prev), end: prev, formatted: '' };
    }

    // Define hospital-specific minimum start dates
    const hospitalMinDates = {
      planalto: new Date(2024, 6, 1),    // July 1, 2024
      tiradentes: new Date(2024, 7, 1)   // August 1, 2024
    };

    // menor data de admissão no dataset
    const adms = patients
      .map(p => parseLocalDate(p.data_admissao))
      .filter((d): d is Date => !!d);
    const earliestAdmission = new Date(Math.min(...adms.map(d => d.getTime())));

    // Use the maximum of (earliest admission, hospital minimum date)
    const hospitalMinDate = hospitalMinDates[selectedHospital];
    const actualStartDate = earliestAdmission > hospitalMinDate ? earliestAdmission : hospitalMinDate;

    // fim = último dia do mês anterior ao atual
    const periodEnd = lastDayOfPreviousMonth();

    // formatação MM/YY
    const formatMMYY = (date: Date) => {
      const mm = String(date.getMonth() + 1).padStart(2, '0');
      const yy = String(date.getFullYear()).slice(2);
      return `${mm}/${yy}`;
    };

    return {
      start: firstDayOfMonth(actualStartDate),
      end: periodEnd,
      formatted: `${formatMMYY(firstDayOfMonth(actualStartDate))} → ${formatMMYY(periodEnd)}`
    };
  };


  const getOccupancyTimeseries = () => {
    const totalCapacity = getCapacity();
    if (patients.length === 0 || totalCapacity <= 0) return [];

    const { start: periodStart, end: periodEnd } = getOccupancyDateRange();

    // meses do início até o fim (mês anterior ao atual)
    const months: Date[] = [];
    const cursor = new Date(periodStart.getFullYear(), periodStart.getMonth(), 1);
    const endMonth = new Date(periodEnd.getFullYear(), periodEnd.getMonth(), 1);
    while (cursor <= endMonth) {
      months.push(new Date(cursor));
      cursor.setMonth(cursor.getMonth() + 1);
    }

    const monthlyData: TimeseriesData[] = months.map(month => {
      const monthStart = firstDayOfMonth(month);
      const monthEnd   = lastDayOfMonth(month);

      // dias do mês
      const days: Date[] = [];
      for (let d = new Date(monthStart); d <= monthEnd; d.setDate(d.getDate() + 1)) {
        days.push(new Date(d));
      }

      const dailyRates: number[] = days.map(day => {
        const onDay = patients.filter(p => {
          const adm  = parseLocalDate(p.data_admissao);
          const alta = parseLocalDate(p.data_alta ?? null);
          if (!adm) return false;
          return adm <= day && (!alta || alta >= day);
        });

        // Únicos por CNS (com fallback opcional)
        const unique = new Set<string>();
        for (const p of onDay) {
          const key = p.cns?.toString().trim() || `__NO_CNS__:${p.nome ?? ''}`;
          unique.add(key);
        }

        return unique.size / totalCapacity; // proporção (0..1+)
      });

      const monthlyAvgPct = dailyRates.length
        ? (dailyRates.reduce((a, b) => a + b, 0) / dailyRates.length) * 100
        : 0;

      const name = `${String(month.getMonth() + 1).padStart(2, '0')}/${String(month.getFullYear()).slice(2)}`;

      // quarters opcionais (mantive seu estilo)
      const m = month.getMonth();
      let quarter = '';
      if (m >= 6 && m <= 8) quarter = 'Q1 24-25';
      else if (m >= 9 && m <= 11) quarter = 'Q2 24-25';
      else if (m >= 0 && m <= 2) quarter = 'Q3 24-25';
      else quarter = 'Q4 24-25';

      return {
        name,
        value: Number(monthlyAvgPct.toFixed(1)),
        period: 'month',
        quarter,
        year: `${periodStart.getFullYear()}-${periodEnd.getFullYear()}`
      };
    });

    return aggregateByPeriod(monthlyData, periodFilter);
  };


  const getAverageStayTimeseries = () => {
    if (patients.length === 0) return [];

    // Mesmo range do gráfico de ocupação (até mês anterior)
    const { start: periodStart, end: periodEnd } = getOccupancyDateRange();

    // Meses do início até o fim
    const months: Date[] = [];
    const cursor = new Date(periodStart.getFullYear(), periodStart.getMonth(), 1);
    const endMonth = new Date(periodEnd.getFullYear(), periodEnd.getMonth(), 1);
    while (cursor <= endMonth) {
      months.push(new Date(cursor));
      cursor.setMonth(cursor.getMonth() + 1);
    }

    const monthlyData: TimeseriesData[] = months.map(month => {
      const monthStart = new Date(month.getFullYear(), month.getMonth(), 1);
      const monthEnd   = new Date(month.getFullYear(), month.getMonth() + 1, 0);

      // Altas do mês (válidas) com permanência > 0
      const dischargedInMonth = patients.filter(p => {
        const alta = parseLocalDate(p.data_alta ?? null);
        if (!alta) return false;
        if (alta < monthStart || alta > monthEnd) return false;

        // recomputa a permanência a partir das datas, com fallback para dias_internacao
        const adm = parseLocalDate(p.data_admissao);
        let stayDays = 0;
        if (adm && alta) {
          const ms = alta.getTime() - adm.getTime();
          stayDays = Math.floor(ms / (1000 * 60 * 60 * 24));
        } else {
          stayDays = p.dias_internacao || 0;
        }

        return stayDays > 0;
      });

      const avgStayDays = dischargedInMonth.length > 0
        ? dischargedInMonth.reduce((sum, p) => {
            const adm = parseLocalDate(p.data_admissao);
            const alta = parseLocalDate(p.data_alta ?? null);
            if (adm && alta) {
              const ms = alta.getTime() - adm.getTime();
              return sum + Math.floor(ms / (1000 * 60 * 60 * 24));
            }
            return sum + (p.dias_internacao || 0);
          }, 0) / dischargedInMonth.length
        : 0;

      // Quarter opcional (mantive seu padrão)
      const m = month.getMonth();
      let quarter = '';
      if (m >= 6 && m <= 8) quarter = 'Q1 24-25';
      else if (m >= 9 && m <= 11) quarter = 'Q2 24-25';
      else if (m >= 0 && m <= 2) quarter = 'Q3 24-25';
      else quarter = 'Q4 24-25';

      return {
        name: `${String(month.getMonth() + 1).padStart(2, '0')}/${String(month.getFullYear()).slice(2)}`,
        value: parseFloat(avgStayDays.toFixed(1)),
        period: 'month',
        quarter,
        year: `${periodStart.getFullYear()}-${periodEnd.getFullYear()}`
      };
    });

    return aggregateByPeriod(monthlyData, periodFilter);
  };


  const getLengthOfStayDistribution = () => {
    // Define stay ranges in days
    const ranges = [
      { name: "0-3", min: 0, max: 3, color: "#10b981" },
      { name: "4-7", min: 4, max: 7, color: "#3b82f6" },
      { name: "8-14", min: 8, max: 14, color: "#6366f1" },
      { name: "15-21", min: 15, max: 21, color: "#8b5cf6" },
      { name: "22-30", min: 22, max: 30, color: "#f59e0b" },
      { name: "30+", min: 31, max: Infinity, color: "#ef4444" }
    ];

    const distribution = ranges.map(range => {
      const patientsInRange = patients.filter(patient => {
        const stayDays = patient.dias_internacao || 0;
        return stayDays >= range.min && stayDays <= range.max;
      });

      const percentage = patients.length > 0 
        ? Math.round((patientsInRange.length / patients.length) * 100)
        : 0;

      return {
        name: `${range.name} dias`,
        value: patientsInRange.length,
        percentage,
        color: range.color
      };
    });

    return distribution;
  };

  const getReadmissionBarData = () => {
    const metrics = calculateAdvancedMetrics();
    return [
      { name: 'Até 7 dias', value: parseFloat(metrics.readmission7Days.replace(',', '.')) },
      { name: 'Até 15 dias', value: parseFloat(metrics.readmission15Days.replace(',', '.')) },
      { name: 'Até 30 dias', value: parseFloat(metrics.readmission30Days.replace(',', '.')) }
    ];
  };

  const getDischargesByWeekday = () => {
    // Count discharges by weekday from actual patient data
    const weekdayNames = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];

    // Initialize counts for each weekday (1-7)
    const weekdayCounts: Record<number, number> = {
      1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0
    };

    // Count patients by dia_semana_alta
    patients.forEach(p => {
      if (p.dia_semana_alta && p.dia_semana_alta >= 1 && p.dia_semana_alta <= 7) {
        weekdayCounts[p.dia_semana_alta]++;
      }
    });

    // Calculate total discharges
    const totalDischarges = Object.values(weekdayCounts).reduce((sum, count) => sum + count, 0);

    // Build result array
    const data = weekdayNames.map((name, index) => {
      const weekdayNumber = index + 1;
      const count = weekdayCounts[weekdayNumber];
      const percentage = totalDischarges > 0
        ? parseFloat(((count / totalDischarges) * 100).toFixed(1))
        : 0;

      return {
        name,
        value: percentage, // Percentage for chart display
        count, // Absolute number for tooltip
        percentage
      };
    });

    return data;
  };

  // Função para agregar dados por período
  const aggregateByPeriod = (data: TimeseriesData[], period: PeriodFilter): TimeseriesData[] => {
    if (period === 'month') {
      return data;
    }
    
    if (period === 'quarter') {
      const quarterGroups = data.reduce((acc, item) => {
        const quarter = item.quarter || 'Unknown';
        if (!acc[quarter]) {
          acc[quarter] = [];
        }
        acc[quarter].push(item);
        return acc;
      }, {} as Record<string, TimeseriesData[]>);
      
      return Object.entries(quarterGroups).map(([quarter, items]) => ({
        name: quarter,
        value: items.reduce((sum, item) => sum + item.value, 0) / items.length
      }));
    }
    
    if (period === 'year') {
      const yearGroups = data.reduce((acc, item) => {
        const year = item.year || 'Unknown';
        if (!acc[year]) {
          acc[year] = [];
        }
        acc[year].push(item);
        return acc;
      }, {} as Record<string, TimeseriesData[]>);
      
      return Object.entries(yearGroups).map(([year, items]) => ({
        name: year,
        value: items.reduce((sum, item) => sum + item.value, 0) / items.length
      }));
    }
    
    return data;
  };

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (patients.length === 0) {
    return (
      <EmptyState
        icon={Activity}
        title="Nenhum dado encontrado"
        description="Não foi possível encontrar dados para análise dos indicadores assistenciais."
        action={{
          label: "Tentar novamente",
          onClick: fetchPatients
        }}
      />
    );
  }

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-gradient-to-br from-slate-50 via-blue-50/30 to-emerald-50/20">
      <div className="w-full max-w-full space-y-6 md:space-y-8 p-4 md:p-6">
        
        {/* Header Section */}
        <div className="mb-6 md:mb-8">
          <div className="flex items-center gap-3 md:gap-4 mb-4 md:mb-6">
            <div className="p-2 md:p-3 bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-700 rounded-xl md:rounded-2xl shadow-xl shadow-blue-500/25">
              <Activity className="h-6 w-6 md:h-8 md:w-8 text-white drop-shadow-sm" />
            </div>
            <div>
              <h1 className="text-2xl md:text-4xl font-black text-slate-800 tracking-tight">
                Indicadores Assistenciais
              </h1>
              <p className="text-sm md:text-lg text-slate-600 font-medium">
                Evolução e análise das principais métricas
              </p>
            </div>
          </div>
        </div>


        {/* Charts Section */}
        <div className="space-y-6 md:space-y-8">

          {/* 2.1 - Média de Permanência */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl md:rounded-2xl border border-slate-200/50 p-4 md:p-6 shadow-lg">
            <MiniChart
              data={getAverageStayTimeseries()}
              title="Média de Permanência"
              subtitle={`${periodFilter === 'month' ? 'Mensal' : periodFilter === 'quarter' ? 'Trimestral' : 'Anual'} - ${getOccupancyDateRange().formatted} (dias)`}
              type="line"
              icon={Clock}
              hideLegend={true}
              showGrid={true}
              showYAxis={true}
            />
          </div>

          {/* 2.2 - Taxa de Ocupação */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl md:rounded-2xl border border-slate-200/50 p-4 md:p-6 shadow-lg">
            <MiniChart
              data={getOccupancyTimeseries()}
              title="Taxa de Ocupação"
              subtitle={`${periodFilter === 'month' ? 'Mensal' : periodFilter === 'quarter' ? 'Trimestral' : 'Anual'} - ${getOccupancyDateRange().formatted} (%)`}
              type="line"
              icon={Bed}
              hideLegend={true}
              showGrid={true}
              showYAxis={true}
            />
          </div>

          {/* 2.3 - Taxa de Reinternação */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl md:rounded-2xl border border-slate-200/50 p-4 md:p-6 shadow-lg">
            <MiniChart
              data={getReadmissionBarData()}
              title="Taxa de Reinternação"
              subtitle="Por período (%)"
              type="bar"
              icon={RotateCcw}
              hideLegend={true}
              showGrid={true}
              showYAxis={true}
              showXAxisLabels={true}
              showDataLabels={true}
            />
          </div>

          {/* 2.4 - Altas por Dia da Semana */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl md:rounded-2xl border border-slate-200/50 p-4 md:p-6 shadow-lg">
            <MiniChart
              data={getDischargesByWeekday()}
              title="Altas por Dia da Semana"
              subtitle="Distribuição total de altas"
              type="bar"
              icon={CalendarX2}
              showXAxisLabels={true}
              hideLegend={true}
              showDataLabels={true}
            />
          </div>

        </div>
      </div>
    </div>
  );
}