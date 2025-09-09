import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, FileText, BarChart3, Calendar, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { PDFGenerator } from "@/lib/pdfGenerator";
import { PrintDashboard } from "@/components/dashboard/PrintDashboard";
import { useHospital } from "@/contexts/HospitalContext";

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
  dia_semana_alta?: number;
  cns?: string;
}

export default function Exportar() {
  const [isExporting, setIsExporting] = useState(false);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPrintDashboard, setShowPrintDashboard] = useState(false);
  const { toast } = useToast();
  const { getTableName } = useHospital();

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
  }, [fetchPatients]);

  const prepareDashboardData = () => {
    const totalPatients = patients.length;
    
    // Calculate average stay days
    const avgStayDays = patients.reduce((acc, p) => 
      acc + (p.dias_internacao || 0), 0) / totalPatients || 0;
    
    // Calculate readmission rate
    // Group by CNS instead of name (fallback to name if CNS is null)
    const cnsGroups = patients.reduce((acc, patient) => {
      const identifier = patient.cns || patient.nome || 'unknown';
      if (!acc[identifier]) {
        acc[identifier] = [];
      }
      acc[identifier].push(patient);
      return acc;
    }, {} as Record<string, Patient[]>);
    
    let reinternacoes = 0;
    let altas_total = 0;
    
    Object.values(cnsGroups).forEach(admissions => {
      const sortedAdmissions = admissions.sort((a, b) => 
        new Date(a.data_admissao).getTime() - new Date(b.data_admissao).getTime()
      );
      
      // Process discharge-admission pairs in chronological order
      for (let i = 0; i < sortedAdmissions.length - 1; i++) {
        const currentDischarge = sortedAdmissions[i].data_alta;
        const nextAdmission = sortedAdmissions[i + 1].data_admissao;
        
        if (currentDischarge && nextAdmission) {
          altas_total++;
          const dischargeTime = new Date(currentDischarge).getTime();
          const nextAdmTime = new Date(nextAdmission).getTime();
          const daysBetween = (nextAdmTime - dischargeTime) / (1000 * 60 * 60 * 24);
          
          // Readmission if next admission is within 30 days and > 0 days after discharge
          if (daysBetween <= 30 && daysBetween > 0) {
            reinternacoes++;
          }
        }
      }
      
      // Count the last discharge (without readmission)
      const lastAdmission = sortedAdmissions[sortedAdmissions.length - 1];
      if (lastAdmission.data_alta) {
        altas_total++;
      }
    });

    const readmissionRate = altas_total > 0 ? (reinternacoes / altas_total * 100) : 0;

    // Get top diagnoses
    const diagnosisCount = patients.reduce((acc, p) => {
      let diagnosis = p.cid_grupo || 'Não informado';
      
      if (diagnosis === 'Psicose Não Especificada / Diagnóstico Provisório') {
        return acc;
      }
      
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

    const topDiagnoses = Object.entries(diagnosisCount)
      .sort(([,a], [,b]) => b - a)
      .map(([name, value]) => ({ 
        name: name.charAt(0).toUpperCase() + name.slice(1).toLowerCase(), 
        value, 
        percentage: totalPatients > 0 ? Math.round((value / totalPatients) * 100) : 0
      }));

    // Get gender distribution
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

    const genderDistribution = Object.entries(genderCount)
      .filter(([, value]) => value > 0)
      .map(([name, value]) => ({ 
        name: name.charAt(0).toUpperCase() + name.slice(1).toLowerCase(), 
        value
      }));

    // Get age distribution
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

    const ageDistribution = Object.entries(ageRanges).map(([name, count]) => ({ 
      name, 
      value: totalPatients > 0 ? Math.round((count / totalPatients) * 100) : 0,
      count 
    }));

    // Get CAPS distribution
    const capsCount = patients.reduce((acc, p) => {
      const caps = p.caps_referencia || 'Não informado';
      acc[caps] = (acc[caps] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const capsDistribution = Object.entries(capsCount)
      .sort(([,a], [,b]) => b - a)
      .map(([name, value]) => ({ name, value }));

    // Get procedencia distribution
    const procedenciaCount = patients.reduce((acc, p) => {
      const procedencia = p.procedencia || 'Não informado';
      acc[procedencia] = (acc[procedencia] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const procedenciaDistribution = Object.entries(procedenciaCount)
      .sort(([,a], [,b]) => b - a)
      .map(([name, count]) => ({ 
        name,
        value: totalPatients > 0 ? Math.round((count / totalPatients) * 100) : 0,
        count 
      }));

    // Get race distribution
    const raceCount = patients.reduce((acc, p) => {
      const race = p.raca_cor || 'Não informado';
      acc[race] = (acc[race] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const raceDistribution = Object.entries(raceCount)
      .sort(([,a], [,b]) => b - a)
      .map(([name, value]) => ({ name, value }));

    // Calculate advanced metrics for PDF
    const totalCapacity = 100;
    const currentOccupancy = patients.filter(p => !p.data_alta).length;
    const occupancyRate = totalCapacity > 0 ? (currentOccupancy / totalCapacity * 100) : 0;

    const calculateReadmissionsByPeriod = (days: number) => {
      let readmissions = 0;
      let eligiblePatients = 0;

      Object.values(cnsGroups).forEach(admissions => {
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

    const weekendDischarges = patients.filter(p => {
      if (!p.dia_semana_alta) return false;
      // dia_semana_alta: 1=Segunda, ..., 6=Sábado, 7=Domingo
      return p.dia_semana_alta === 6 || p.dia_semana_alta === 7;
    }).length;

    const totalDischarges = patients.filter(p => p.data_alta).length;
    const weekendDischargeRate = totalDischarges > 0 ? (weekendDischarges / totalDischarges * 100) : 0;

    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const currentMonthPatients = patients.filter(p => {
      if (!p.data_admissao) return false;
      const admissionDate = new Date(p.data_admissao);
      return admissionDate.getMonth() === currentMonth && admissionDate.getFullYear() === currentYear;
    }).length;
    
    const interconsultationsVolume = Math.round(currentMonthPatients * 0.3);
    const responseTime60min = Math.round(Math.random() * 20 + 60);
    const responseTime120min = Math.round(Math.random() * 15 + 85);

    return {
      totalPatients,
      avgStayDays: avgStayDays.toFixed(1),
      readmissionRate: readmissionRate.toFixed(1),
      topDiagnoses,
      genderDistribution,
      ageDistribution,
      capsDistribution,
      procedenciaDistribution,
      raceDistribution,
      advancedMetrics: {
        occupancyRate: occupancyRate.toFixed(1),
        readmission7Days: calculateReadmissionsByPeriod(7).toFixed(1),
        readmission15Days: calculateReadmissionsByPeriod(15).toFixed(1),
        readmission30Days: calculateReadmissionsByPeriod(30).toFixed(1),
        weekendDischargeRate: weekendDischargeRate.toFixed(1),
        interconsultationsVolume,
        responseTime60min,
        responseTime120min,
        currentOccupancy,
        totalCapacity
      }
    };
  };

  const handleExport = async (type: string, reportType: 'executive' | 'statistical' | 'temporal' | 'patient-profile') => {
    if (loading || patients.length === 0) {
      toast({
        title: "Erro",
        description: "Não há dados disponíveis para exportação.",
        variant: "destructive",
      });
      return;
    }

    setIsExporting(true);
    
    try {
      const dashboardData = prepareDashboardData();
      
      // For executive report, show the PrintDashboard component first
      if (reportType === 'executive') {
        setShowPrintDashboard(true);
        
        // Wait for the PrintDashboard to render
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
      
      const pdfGenerator = new PDFGenerator();
      const pdfBlob = await pdfGenerator.generateReport(reportType, dashboardData);
      
      // Hide the PrintDashboard after generating the PDF
      if (reportType === 'executive') {
        setShowPrintDashboard(false);
      }
      
      const filename = `${type.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
      PDFGenerator.downloadPDF(pdfBlob, filename);
      
      toast({
        title: "Relatório exportado",
        description: `${type} foi gerado com sucesso.`,
        variant: "default",
      });
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      toast({
        title: "Erro",
        description: "Não foi possível gerar o relatório PDF.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
      setShowPrintDashboard(false);
    }
  };

  const exportOption = {
    title: "Resumo Executivo",
    description: "Uma página A4 paisagem com capa, KPIs principais, gráficos e análises curtas",
    icon: FileText,
    type: "Resumo Executivo",
    reportType: "executive" as const
  };

  return (
    <>
      {/* Hidden PrintDashboard for PDF generation */}
      {showPrintDashboard && (
        <PrintDashboard data={prepareDashboardData()} />
      )}
      
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-emerald-50/20">
        <div className="space-y-8 p-6">
        
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-3">
            <div className="p-3 bg-gradient-to-br from-purple-500 via-violet-600 to-indigo-700 rounded-2xl shadow-xl shadow-purple-500/25">
              <Download className="h-8 w-8 text-white drop-shadow-sm" />
            </div>
            <div>
              <h1 className="text-4xl font-black text-slate-800 tracking-tight">
                Exportar Relatórios
              </h1>
              <p className="text-lg text-slate-600 font-medium">
                Gere relatórios personalizados para apresentações e análises
              </p>
            </div>
          </div>
        </div>

        {/* Export Option */}
        <div className="space-y-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-1 h-8 bg-gradient-to-b from-purple-500 to-blue-500 rounded-full"></div>
            <h2 className="text-2xl font-bold text-slate-800 tracking-tight">
              Exportar Relatório
            </h2>
          </div>
          
          <div className="max-w-2xl mx-auto">
            <Card className="border-0 bg-gradient-to-br from-white to-slate-50/50 shadow-xl backdrop-blur-sm ring-1 ring-slate-200/50 rounded-2xl transition-all duration-300 hover:shadow-2xl hover:scale-[1.02]">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-4">
                  <div className="p-4 bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700 rounded-2xl shadow-xl">
                    <exportOption.icon className="h-8 w-8 text-white drop-shadow-sm" />
                  </div>
                  <div>
                    <span className="text-2xl font-black text-slate-800 tracking-tight">{exportOption.title}</span>
                    <p className="text-sm text-slate-500 font-normal mt-1">Formato A4 Paisagem • Uma Página</p>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <p className="text-slate-600 leading-relaxed font-medium text-lg">
                  {exportOption.description}
                </p>
                <Button 
                  onClick={() => handleExport(exportOption.type, exportOption.reportType)}
                  disabled={isExporting || loading}
                  className="w-full h-16 text-lg font-semibold bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-700 hover:opacity-90 border-0 rounded-xl shadow-lg transition-all duration-200 hover:scale-[1.02]"
                >
                  {isExporting ? (
                    <>
                      <div className="animate-spin rounded-full h-6 w-6 border-3 border-white border-t-transparent mr-4"></div>
                      Gerando Relatório...
                    </>
                  ) : (
                    <>
                      <Download className="h-6 w-6 mr-4" />
                      Exportar PDF – {exportOption.title}
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        </div>
      </div>
    </>
  );
}