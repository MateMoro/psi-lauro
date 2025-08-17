import { useState, useEffect } from "react";
import { Activity, Clock, RotateCcw, Bed, Timer, CalendarX2 } from "lucide-react";
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
  cns?: string;
  dia_semana_alta?: number;
}

export default function IndicadoresAssistenciais() {
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

  // Calculate occupancy rate for Aug 2024 - Jul 2025 period
  const calculateOccupancyRateAverage = () => {
    const totalCapacity = 16;
    const periodStart = new Date('2024-08-01');
    const periodEnd = new Date('2025-07-31');
    
    // Filter patients within the period
    const filteredPatients = patients.filter(p => {
      const admissionDate = new Date(p.data_admissao);
      const dischargeDate = p.data_alta ? new Date(p.data_alta) : null;
      
      // Patient was admitted before period end and (no discharge or discharged after period start)
      return admissionDate <= periodEnd && (!dischargeDate || dischargeDate >= periodStart);
    });

    // Generate all months from Aug 2024 to Jul 2025
    const months = [];
    const startMonth = new Date(2024, 7, 1); // August 2024
    const endMonth = new Date(2025, 7, 31); // July 2025
    
    const currentMonth = new Date(startMonth);
    while (currentMonth <= endMonth) {
      months.push(new Date(currentMonth));
      currentMonth.setMonth(currentMonth.getMonth() + 1);
    }

    let totalOccupancyRates = 0;
    let monthCount = 0;

    months.forEach(month => {
      const monthStart = new Date(month.getFullYear(), month.getMonth(), 1);
      const monthEnd = new Date(month.getFullYear(), month.getMonth() + 1, 0);
      
      // Generate all days in the month
      const days = [];
      const currentDay = new Date(monthStart);
      while (currentDay <= monthEnd) {
        days.push(new Date(currentDay));
        currentDay.setDate(currentDay.getDate() + 1);
      }

      const dailyRates: number[] = [];
      
      days.forEach(day => {
        // Count unique patients by CNS who were hospitalized on this day
        const patientsOnDay = filteredPatients.filter(p => {
          const admissionDate = new Date(p.data_admissao);
          const dischargeDate = p.data_alta ? new Date(p.data_alta) : null;
          
          return admissionDate <= day && (!dischargeDate || dischargeDate > day);
        });

        // Get unique patients by CNS (or nome if CNS not available)
        const uniquePatients = new Set();
        patientsOnDay.forEach(p => {
          const identifier = p.cns || p.nome;
          uniquePatients.add(identifier);
        });

        const dailyRate = uniquePatients.size / totalCapacity;
        dailyRates.push(dailyRate);
      });

      // Calculate average for this month
      const monthlyAverage = dailyRates.length > 0 
        ? dailyRates.reduce((sum, rate) => sum + rate, 0) / dailyRates.length 
        : 0;
      
      totalOccupancyRates += monthlyAverage;
      monthCount++;
    });

    const avgOccupancyRate = monthCount > 0 ? (totalOccupancyRates / monthCount) * 100 : 0;
    return avgOccupancyRate;
  };

  // Calculate advanced metrics
  const calculateAdvancedMetrics = () => {
    const totalPatients = patients.length;
    
    // Average stay days
    const avgStayDays = patients.reduce((acc, p) => 
      acc + (p.dias_internacao || 0), 0) / totalPatients || 0;

    // Taxa de Ocupação - calculate average for Aug 2024 - Jul 2025
    const occupancyRate = calculateOccupancyRateAverage();

    // Current occupancy for reference
    const totalCapacity = 16;
    const currentOccupancy = patients.filter(p => !p.data_alta).length;

    // Taxa de reinternação por período específico - baseado no algoritmo Python correto
    const calculateReadmissionsByPeriod = (days: number) => {
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
          
          if (daysBetween > 0 && daysBetween <= days) {
            reinternacoes++;
          }
        }
        
        // Add the last discharge to total (if exists)
        if (datas_alta.length > 0) {
          altas_total += 1;
        }
      });

      return altas_total > 0 ? (reinternacoes / altas_total * 100) : 0;
    };

    const readmission7Days = calculateReadmissionsByPeriod(7);
    const readmission15Days = calculateReadmissionsByPeriod(15);
    const readmission30Days = calculateReadmissionsByPeriod(30);

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
      avgStayDays: avgStayDays.toFixed(1),
      occupancyRate: occupancyRate.toFixed(1),
      readmission7Days: readmission7Days.toFixed(1),
      readmission15Days: readmission15Days.toFixed(1),
      readmission30Days: readmission30Days.toFixed(1),
      weekendDischargeRate: weekendDischargeRate.toFixed(1),
      responseTime60min,
      responseTime120min,
      currentOccupancy,
      totalCapacity
    };
  };

  const getOccupancyTimeseries = () => {
    // Fixed monthly values as specified: jul/24 to jun/25
    const monthlyData = [
      { name: '07/24', value: 88.7 },
      { name: '08/24', value: 83.3 },
      { name: '09/24', value: 87.1 },
      { name: '10/24', value: 92.1 },
      { name: '11/24', value: 83.3 },
      { name: '12/24', value: 87.8 },
      { name: '01/25', value: 86.9 },
      { name: '02/25', value: 92.7 },
      { name: '03/25', value: 91.3 },
      { name: '04/25', value: 93.1 },
      { name: '05/25', value: 88.5 },
      { name: '06/25', value: 89.8 }
    ];

    return monthlyData;
  };

  const getAverageStayTimeseries = () => {
    // Fixed monthly values for average length of stay: jul/24 to jun/25
    const monthlyData = [
      { name: '07/24', value: 13.2 },
      { name: '08/24', value: 12.8 },
      { name: '09/24', value: 14.1 },
      { name: '10/24', value: 13.9 },
      { name: '11/24', value: 12.5 },
      { name: '12/24', value: 13.7 },
      { name: '01/25', value: 14.3 },
      { name: '02/25', value: 13.1 },
      { name: '03/25', value: 13.8 },
      { name: '04/25', value: 14.0 },
      { name: '05/25', value: 13.4 },
      { name: '06/25', value: 13.6 }
    ];

    return monthlyData;
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

  const getDischargesByWeekday = () => {
    // Fixed values as specified by user
    const weekdays = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];
    const fixedCounts = [92, 68, 75, 60, 62, 18, 10]; // Segunda, Terça, Quarta, Quinta, Sexta, Sábado, Domingo
    
    const total = fixedCounts.reduce((sum, count) => sum + count, 0);
    
    return weekdays.map((day, index) => ({
      name: day,
      value: Math.round((fixedCounts[index] / total) * 100), // Percentage for chart display
      count: fixedCounts[index], // Absolute number for tooltip
      percentage: Math.round((fixedCounts[index] / total) * 100)
    }));
  };

  const metrics = calculateAdvancedMetrics();

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-emerald-50/20">
      <div className="space-y-8 p-6">
        
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-3">
            <div className="p-3 bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-700 rounded-2xl shadow-xl shadow-blue-500/25">
              <Activity className="h-8 w-8 text-white drop-shadow-sm" />
            </div>
            <div>
              <h1 className="text-4xl font-black text-slate-800 tracking-tight">
                Indicadores Assistenciais
              </h1>
              <p className="text-lg text-slate-600 font-medium">
                Evolução e análise das principais métricas
              </p>
            </div>
          </div>
        </div>


        {/* Charts Section */}
        <div className="space-y-8">
          
          {/* 2.1 - Média de Permanência */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/50 p-6 shadow-lg">
            <MiniChart
              data={getAverageStayTimeseries()}
              title="Média de Permanência"
              subtitle="jul/24 → jun/25 (dias)"
              type="line"
              icon={Clock}
              hideLegend={true}
              showGrid={true}
              showYAxis={true}
            />
            <div className="mt-4 p-4 bg-blue-50/50 rounded-lg border border-blue-200/30">
              <p className="text-sm text-slate-700 leading-relaxed">
                Em consonância com boas práticas assistenciais, assegurando internações de curta duração e fluxo ágil.
              </p>
            </div>
          </div>

          {/* 2.2 - Taxa de Ocupação */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/50 p-6 shadow-lg">
            <MiniChart
              data={getOccupancyTimeseries()}
              title="Taxa de Ocupação"
              subtitle="jul/24 → jun/25 (%)"
              type="line"
              icon={Bed}
              hideLegend={true}
              showGrid={true}
              showYAxis={true}
            />
            <div className="mt-4 p-4 bg-emerald-50/50 rounded-lg border border-emerald-200/30">
              <p className="text-sm text-slate-700 leading-relaxed">
                Taxa de ocupação elevada e estável ao longo dos meses, evidenciando uso intenso da capacidade instalada e necessidade de gestão eficiente de leitos para manter a rotatividade.
              </p>
            </div>
          </div>

          {/* 2.3 - Taxa de Reinternação */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/50 p-6 shadow-lg">
            <MiniChart
              data={[
                { name: "Até 7 dias", value: 0.5, color: "#ef4444" },
                { name: "Até 15 dias", value: 1.1, color: "#f97316" },
                { name: "Até 30 dias", value: 2.7, color: "#eab308" }
              ]}
              title="Taxa de Reinternação"
              subtitle="Comparativo por período (%)"
              type="bar"
              icon={RotateCcw}
              showXAxisLabels={true}
              hideLegend={true}
              showDataLabels={true}
            />
            <div className="mt-4 p-4 bg-amber-50/50 rounded-lg border border-amber-200/30">
              <p className="text-sm text-slate-700 leading-relaxed">
                O rigoroso planejamento de saída é outro fator crucial, assegurando que os pacientes recebam o suporte necessário na comunidade. Isso previne o agravamento do quadro clínico e reduz a necessidade de novos internamentos.
                <br /><br />
                Em última análise, os dados demonstram o sucesso de uma abordagem que prioriza a qualidade da recuperação em detrimento do volume de atendimentos.
              </p>
            </div>
          </div>

          {/* 2.4 - Altas por Dia da Semana */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/50 p-6 shadow-lg">
            <MiniChart
              data={getDischargesByWeekday()}
              title="Altas por Dia da Semana"
              subtitle="Distribuição semanal"
              type="bar"
              icon={CalendarX2}
              showXAxisLabels={true}
              hideLegend={true}
            />
            <div className="mt-4 p-4 bg-violet-50/50 rounded-lg border border-violet-200/30">
              <p className="text-sm text-slate-700 leading-relaxed">
                Apenas 7,4% das altas ocorrem aos finais de semana, em contraste com 92,6% nos dias úteis. Esse padrão possivelmente se relaciona à ausência de médico diarista, permanecendo apenas o plantonista, o que reduz a agilidade no processo de alta e impacta diretamente a rotatividade dos leitos.
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}