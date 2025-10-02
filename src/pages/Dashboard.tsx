import { useState, useEffect, useCallback } from "react";
import { Clock, Users, RefreshCw, Database, MapPin, Building2, Bed, Stethoscope, BarChart3, Heart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { PatientSearch } from "@/components/dashboard/PatientSearch";
import { DashboardSkeleton } from "@/components/dashboard/LoadingSkeletons";
import { EmptyState } from "@/components/ui/empty-state";
import { useHospital } from "@/contexts/HospitalContext";

import { CustomPieChart } from "@/components/dashboard/charts/PieChart";
import { VerticalBarChart } from "@/components/dashboard/charts/VerticalBarChart";
import { HorizontalBarChart } from "@/components/dashboard/charts/HorizontalBarChart";
import { DischargesByWeekdayChart } from "@/components/dashboard/charts/DischargesByWeekdayChart";
import { MiniChart } from "@/components/dashboard/MiniChart";
import { RadialChart } from "@/components/dashboard/RadialChart";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { getRoleDisplayName } from "@/utils/permissions";
import CapsUserInfo from "@/components/CapsUserInfo";
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
  transtorno_categoria: string;
  dia_semana_alta?: number;
  cns?: string;
}

// Helper functions for date handling
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
const lastDayOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth() + 1, 0);

export default function Dashboard() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [weekdayDischarges, setWeekdayDischarges] = useState<Array<{name: string, value: number, percentage: number}>>([]);
  const { toast } = useToast();
  const { getTableName, selectedHospital } = useHospital();
  const { user, profile, getUserRole, loading: authLoading } = useAuth();

  const fetchPatients = useCallback(async () => {
    try {
      const tableName = getTableName();
      
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .range(0, 4999);

      if (error) {
        throw error;
      }
      
      setPatients(data || []);
      
    } catch (error) {
      toast({
        title: "Erro",
        description: `Não foi possível carregar os dados dos pacientes. ${error?.message || 'Erro desconhecido'}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [getTableName, toast]);

  useEffect(() => {
    // Only fetch data when auth is ready
    if (!authLoading && user) {
      fetchPatients();
      fetchWeekdayDischarges();
    }
  }, [fetchPatients, getTableName, authLoading, user]);

  const fetchWeekdayDischarges = async () => {
    try {
      // Fixed values as specified by user
      const fixedCounts = [92, 68, 75, 60, 62, 18, 10]; // Segunda, Terça, Quarta, Quinta, Sexta, Sábado, Domingo
      const weekdayNames = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];

      const total = fixedCounts.reduce((sum, count) => sum + count, 0);
      const result = weekdayNames.map((name, index) => ({
        name,
        value: fixedCounts[index],
        percentage: parseFloat(((fixedCounts[index] / total) * 100).toFixed(1))
      }));

      setWeekdayDischarges(result);

    } catch (error) {
      console.error('Erro ao buscar dados por dia da semana:', error);
    }
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

  const calculateOccupancyRateAverage = () => {
    const totalCapacity = selectedHospital === 'planalto' ? 16 : 10;
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

  // Calculate metrics
  const calculateMetrics = () => {
    const totalPatients = patients.length;

    // Calculate average stay days - using correct algorithm from Python reference
    const avgStayDays = calculateCorrectAverageStay(patients);

    // Calculate 30-day readmission rate using shared utility function (CNS-based grouping)
    const readmissionRate = calculateReadmissionRate(patients, 30);

    return {
      totalPatients,
      avgStayDays: formatDecimalBR(avgStayDays),
      avgStayDaysFormatted: `${formatDecimalBR(avgStayDays)} dias`,
      readmissionRate: formatDecimalBR(readmissionRate)
    };
  };

  // New Advanced Metrics
  const calculateAdvancedMetrics = () => {
    // Taxa de Ocupação - usar a mesma lógica do IndicadoresAssistenciais
    const occupancyRate = calculateOccupancyRateAverage();

    // Ocupação atual (para referência)
    const totalCapacity = selectedHospital === 'planalto' ? 16 : 10;
    const currentOccupancy = patients.filter(p => !p.data_alta).length;

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
      occupancyRate: formatDecimalBR(occupancyRate),
      readmission7Days: formatDecimalBR(readmission7Days),
      readmission15Days: formatDecimalBR(readmission15Days),
      readmission30Days: formatDecimalBR(readmission30Days),
      weekendDischargeRate: formatDecimalBR(weekendDischargeRate),
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
        value: total > 0 ? parseFloat(((count / total) * 100).toFixed(1)) : 0,
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

    // Separar "Outros" do resto dos diagnósticos
    const allDiagnoses = Object.entries(diagnosisCount);
    const othersItem = allDiagnoses.find(([name]) => name.toLowerCase() === 'outros');
    const regularDiagnoses = allDiagnoses.filter(([name]) => name.toLowerCase() !== 'outros');

    // Ordenar diagnósticos regulares (maior para menor)
    const sortedDiagnoses = regularDiagnoses.sort(([,a], [,b]) => b - a);

    // Mapear para o formato final
    const result = sortedDiagnoses.map(([name, value], index) => ({
      name: capitalizeFirst(name),
      value,
      percentage: total > 0 ? parseFloat(((value / total) * 100).toFixed(1)) : 0,
      color: chartColors[index % chartColors.length] || "#6b7280"
    }));

    // Adicionar "Outros" no final, se existir
    if (othersItem) {
      const [name, value] = othersItem;
      result.push({
        name: capitalizeFirst(name),
        value,
        percentage: total > 0 ? parseFloat(((value / total) * 100).toFixed(1)) : 0,
        color: "#6b7280" // Cor cinza para "Outros"
      });
    }

    return result;
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
      value: total > 0 ? parseFloat(((count / total) * 100).toFixed(1)) : 0,
      count
    }));
  };

  // New chart data functions
  const getCapsAdultoDistribution = () => {
    // Normalizar nomes de CAPS (adicionar acentos)
    const normalizeCapsName = (caps: string): string => {
      let normalized = caps;

      // Mapear SAO para SÃO
      if (normalized.includes('SAO MIGUEL')) {
        normalized = normalized.replace('SAO MIGUEL', 'SÃO MIGUEL');
      }
      if (normalized.includes('SAO MATEUS')) {
        normalized = normalized.replace('SAO MATEUS', 'SÃO MATEUS');
      }

      // Adicionar prefixo "CAPS " se não tiver
      if (!normalized.startsWith('CAPS ')) {
        normalized = 'CAPS ' + normalized;
      }

      return normalized;
    };

    // Contar todos os CAPS Adulto (excluindo AD)
    const capsCount = patients.reduce((acc, p) => {
      const caps = p.caps_referencia || 'Não informado';
      // Filtrar apenas CAPS Adulto (contém "ADULTO" mas não "AD ")
      if (caps.includes('ADULTO') && !caps.startsWith('AD ')) {
        const normalizedCaps = normalizeCapsName(caps);
        acc[normalizedCaps] = (acc[normalizedCaps] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    const total = Object.values(capsCount).reduce((sum, count) => sum + count, 0);

    if (total === 0) {
      return [];
    }

    // Ordenar por contagem (maior para menor)
    const sortedCaps = Object.entries(capsCount)
      .sort(([, a], [, b]) => b - a);

    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#84cc16', '#eab308'];

    // Pegar os 6 principais CAPS
    const topCaps = sortedCaps.slice(0, 6);
    const mainCapsData = topCaps.map(([capsName, count], index) => {
      const percentage = parseFloat(((count / total) * 100).toFixed(1));
      return {
        name: capsName,
        value: percentage,
        count: count,
        fill: colors[index % colors.length]
      };
    });

    // Calcular "Outros CAPS" se houver mais de 6
    if (sortedCaps.length > 6) {
      const othersCaps = sortedCaps.slice(6);
      const othersCount = othersCaps.reduce((sum, [, count]) => sum + count, 0);
      const othersPercentage = parseFloat(((othersCount / total) * 100).toFixed(1));

      if (othersPercentage > 0) {
        mainCapsData.push({
          name: 'Outros CAPS',
          value: othersPercentage,
          count: othersCount,
          fill: '#9ca3af'
        });
      }
    }

    return mainCapsData;
  };

  const getCapsADDistribution = () => {
    // Normalizar nomes de CAPS AD (adicionar acentos)
    const normalizeCapsADName = (caps: string): string => {
      let normalized = caps;

      // Mapear SAO para SÃO
      if (normalized.includes('SAO MIGUEL')) {
        normalized = normalized.replace('SAO MIGUEL', 'SÃO MIGUEL');
      }
      if (normalized.includes('SAO MATEUS')) {
        normalized = normalized.replace('SAO MATEUS', 'SÃO MATEUS');
      }

      // Mapear JARDIM NELIA para JARDIM NÉLIA
      if (normalized.toUpperCase().includes('JARDIM NELIA')) {
        normalized = normalized.replace(/JARDIM NELIA/gi, 'Jardim Nélia');
      }

      // Adicionar prefixo "CAPS " se não tiver
      if (!normalized.startsWith('CAPS ')) {
        normalized = 'CAPS ' + normalized;
      }

      return normalized;
    };

    // Contar todos os CAPS AD
    const capsCount = patients.reduce((acc, p) => {
      const caps = p.caps_referencia || 'Não informado';
      // Filtrar apenas CAPS AD (começa com "AD ")
      if (caps.startsWith('AD ')) {
        const normalizedCaps = normalizeCapsADName(caps);
        acc[normalizedCaps] = (acc[normalizedCaps] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    const total = Object.values(capsCount).reduce((sum, count) => sum + count, 0);

    if (total === 0) {
      return [];
    }

    // Ordenar por contagem (maior para menor)
    const sortedCaps = Object.entries(capsCount)
      .sort(([, a], [, b]) => b - a);

    const colors = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#84cc16', '#eab308'];

    // Pegar os 6 principais CAPS AD
    const topCaps = sortedCaps.slice(0, 6);
    const mainCapsData = topCaps.map(([capsName, count], index) => {
      const percentage = parseFloat(((count / total) * 100).toFixed(1));
      return {
        name: capsName,
        value: percentage,
        count: count,
        fill: colors[index % colors.length]
      };
    });

    // Calcular "Outros CAPS" se houver mais de 6
    if (sortedCaps.length > 6) {
      const othersCaps = sortedCaps.slice(6);
      const othersCount = othersCaps.reduce((sum, [, count]) => sum + count, 0);
      const othersPercentage = parseFloat(((othersCount / total) * 100).toFixed(1));

      if (othersPercentage > 0) {
        mainCapsData.push({
          name: 'Outros CAPS',
          value: othersPercentage,
          count: othersCount,
          fill: '#9ca3af'
        });
      }
    }

    return mainCapsData;
  };

  const getProcedenciaDistribution = () => {
    const procedenciaCount = patients.reduce((acc, p) => {
      let procedencia = p.procedencia || 'Não informado';

      // Normalizar RESIDENCIA para RESIDÊNCIA
      if (procedencia.toUpperCase() === 'RESIDENCIA') {
        procedencia = 'RESIDÊNCIA';
      }

      // Normalizar HOSPITAL WALDOMIRO DE PAULA – PS para DEMANDA ESPONTÂNEA
      if (procedencia.toUpperCase().includes('HOSPITAL WALDOMIRO DE PAULA')) {
        procedencia = 'DEMANDA ESPONTÂNEA';
      }

      acc[procedencia] = (acc[procedencia] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const total = patients.length;
    return Object.entries(procedenciaCount)
      .sort(([,a], [,b]) => b - a)
      .map(([name, count]) => ({
        name,
        value: total > 0 ? parseFloat(((count / total) * 100).toFixed(1)) : 0,
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
        value: parseFloat(occupancyRate.toFixed(1)),
        admissions: data.admissions,
        discharges: data.discharges
      };
    });
  };



  const metrics = calculateMetrics();
  const advancedMetrics = calculateAdvancedMetrics();

  // Show loading while auth is loading OR while data is loading
  if (authLoading || loading) {
    return <DashboardSkeleton />;
  }

  // If auth is done but no user, the ProtectedRoute will handle redirect
  if (!authLoading && !user) {
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
          onClick: () => fetchPatients()
        }}
      />
    );
  }


  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-gray-100">
      <div className="w-full max-w-full space-y-6 lg:space-y-8">
        
        {/* Welcome Block */}
        <div className="mb-6 lg:mb-8">
          <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 rounded-2xl p-6 border border-blue-200/50 shadow-lg">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-700 rounded-2xl shadow-xl shadow-blue-500/25">
                <BarChart3 className="h-8 w-8 text-white drop-shadow-sm" />
              </div>
              <div className="flex-1">
                <h1 className="text-1xl lg:text-1xl font-black text-slate-800 tracking-tight mb-2">
                  Bem-vindo, {profile?.nome || user?.email || 'Usuário'}
                </h1>
                <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="font-medium">{getRoleDisplayName(getUserRole() || 'gestor_caps')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="font-medium">
                      Hospital {selectedHospital === 'planalto' ? 'Planalto' : 'Cidade Tiradentes'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-blue-200/50">
              <h2 className="text-slate-800 text-lg font-semibold">Panorama Assistencial</h2>
              <p className="text-slate-500 text-sm mt-1">
                Dados consolidados a partir de 01/07/2024
              </p>
            </div>
          </div>
        </div>

        {/* CAPS Team Info - Real-time sync display */}
        <CapsUserInfo className="mb-6" />

        {/* Cards Superiores */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          <MetricCard
            title="Média de Permanência"
            value={`${metrics.avgStayDays} dias`}
            description="Tempo médio de internação"
            icon={Clock}
            variant="primary"
          />
          <MetricCard
            title="Taxa de Ocupação"
            value={`${advancedMetrics.occupancyRate}%`}
            description="Percentual médio de ocupação"
            icon={Bed}
            variant="success"
          />
          <MetricCard
            title="Taxa de Reinternação"
            value={`${metrics.readmissionRate}%`}
            description="Em até 30 dias"
            icon={RefreshCw}
            variant="warning"
          />
          <MetricCard
            title="Total de Internações"
            value={metrics.totalPatients.toString()}
            description="Dados do hospital selecionado"
            icon={Users}
            variant="info"
          />
        </div>

        {/* Gráficos Principais */}
        <div className="space-y-4 lg:space-y-6">

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
                  {getTopDiagnoses().slice(0, 6).map((item, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-semibold text-slate-700">{item.name}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-600">({item.value})</span>
                          <span className="text-xs font-bold text-slate-800">{item.percentage}%</span>
                        </div>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2">
                        <div 
                          className="h-2 rounded-full transition-all duration-500"
                          style={{ 
                            width: `${item.percentage}%`, 
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

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
            <MiniChart
              data={getProcedenciaDistribution().slice(0, 6).map(item => ({
                name: item.name,
                value: item.value,
                color: ['#0ea5e9', '#10b981', '#f97316', '#6366f1', '#14b8a6', '#e11d48'][getProcedenciaDistribution().indexOf(item) % 6]
              }))}
              title="Procedência"
              subtitle="Origem dos pacientes"
              type="pie"
              icon={MapPin}
            />

            <MiniChart
              data={getCapsAdultoDistribution().map(item => ({
                name: item.name,
                value: item.value,
                color: item.fill
              }))}
              title="CAPS de Referência"
              subtitle="Principais CAPS – Adulto"
              type="bar"
              icon={Building2}
            />
          </div>

          {/* Second CAPS Chart Row */}
          <div className="grid grid-cols-1 gap-4 lg:gap-6">
            <MiniChart
              data={getCapsADDistribution().map(item => ({
                name: item.name,
                value: item.value,
                color: item.fill
              }))}
              title="CAPS de Referência"
              subtitle="Principais CAPS – AD"
              type="bar"
              icon={Building2}
            />
          </div>
        </div>

      </div>
    </div>
  );
}