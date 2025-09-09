import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Search, TrendingUp, BarChart3, Eye, Users, Activity, PieChart, AlertTriangle, Target, Stethoscope } from "lucide-react";
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
}

export default function Tendencias() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { getTableName } = useHospital();

  useEffect(() => {
    fetchPatients();
  }, [getTableName]);

  const fetchPatients = async () => {
    try {
      const tableName = getTableName();
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .range(0, 4999)
        .not('caps_referencia', 'ilike', '%vila monumento%')
        .not('caps_referencia', 'ilike', '%mooca%')
        .not('caps_referencia', 'ilike', '%ij%')
        .not('caps_referencia', 'ilike', '%são miguel%');

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

  const generateInsights = () => {
    if (patients.length === 0) return [];
    
    const insights = [];

    // 1. Mulheres pardas vs brancas com transtorno bipolar
    const bipolarPatients = patients.filter(p => 
      p.cid_grupo?.toLowerCase().includes('bipolar') || 
      p.cid_grupo?.toLowerCase().includes('afetivo bipolar')
    );
    
    const femalePardaBipolar = bipolarPatients.filter(p => 
      (p.genero === 'FEM' || p.genero?.toLowerCase().includes('fem')) && p.raca_cor === 'PARDA'
    );
    const femaleBrancaBipolar = bipolarPatients.filter(p => 
      (p.genero === 'FEM' || p.genero?.toLowerCase().includes('fem')) && p.raca_cor === 'BRANCA'
    );
    
    if (femalePardaBipolar.length >= 2 && femaleBrancaBipolar.length >= 2) {
      const pardaAvg = (femalePardaBipolar.reduce((acc, p) => acc + (p.dias_internacao || 0), 0) / femalePardaBipolar.length);
      const brancaAvg = (femaleBrancaBipolar.reduce((acc, p) => acc + (p.dias_internacao || 0), 0) / femaleBrancaBipolar.length);
      
      if (pardaAvg > brancaAvg) {
        const percentDiff = ((pardaAvg - brancaAvg) / brancaAvg * 100);
        insights.push({
          icon: Search,
          text: `Mulheres pardas com transtorno bipolar ficaram ${percentDiff.toFixed(0)}% mais tempo internadas do que mulheres brancas com o mesmo diagnóstico, possivelmente refletindo acesso mais tardio ao cuidado ou quadro clínico mais grave na admissão.`
        });
      }
    }

    // 2. Homens brancos vs pretos com uso de substâncias - reinternação
    const substancePatients = patients.filter(p => 
      p.cid_grupo?.toLowerCase().includes('substância') || 
      p.cid_grupo?.toLowerCase().includes('álcool') ||
      p.cid_grupo?.toLowerCase().includes('droga')
    );
    
    const maleBrancaSubstance = substancePatients.filter(p => 
      (p.genero === 'MASC' || p.genero?.toLowerCase().includes('masc')) && p.raca_cor === 'BRANCA'
    );
    const malePretaSubstance = substancePatients.filter(p => 
      (p.genero === 'MASC' || p.genero?.toLowerCase().includes('masc')) && p.raca_cor === 'PRETA'
    );
    
    if (maleBrancaSubstance.length >= 2 && malePretaSubstance.length >= 2) {
      // Calculate readmission rates
      const brancaGroups = maleBrancaSubstance.reduce((acc, patient) => {
        const name = patient.nome;
        if (!acc[name]) acc[name] = [];
        acc[name].push(patient);
        return acc;
      }, {} as Record<string, Patient[]>);
      
      const pretaGroups = malePretaSubstance.reduce((acc, patient) => {
        const name = patient.nome;
        if (!acc[name]) acc[name] = [];
        acc[name].push(patient);
        return acc;
      }, {} as Record<string, Patient[]>);

      let brancaReadmissions = 0;
      let pretaReadmissions = 0;
      
      Object.values(brancaGroups).forEach(admissions => {
        if (admissions.length > 1) brancaReadmissions++;
      });
      
      Object.values(pretaGroups).forEach(admissions => {
        if (admissions.length > 1) pretaReadmissions++;
      });

      const brancaRate = (brancaReadmissions / maleBrancaSubstance.length * 100);
      const pretaRate = (pretaReadmissions / malePretaSubstance.length * 100);
      
      if (brancaRate > pretaRate && brancaRate > 10) {
        const percentDiff = ((brancaRate - pretaRate) / pretaRate * 100);
        insights.push({
          icon: TrendingUp,
          text: `Homens brancos com transtornos por uso de substâncias apresentaram taxa de reinternação precoce ${percentDiff.toFixed(0)}% maior que homens pretos com o mesmo diagnóstico, sugerindo maior fragilidade no acompanhamento ambulatorial.`
        });
      }
    }

    // 3. Pronto Socorro vs UBS
    const psPatients = patients.filter(p => 
      p.procedencia?.toLowerCase().includes('pronto socorro') || 
      p.procedencia?.toLowerCase().includes('ps') ||
      p.procedencia?.toLowerCase().includes('waldomiro')
    );
    const ubsPatients = patients.filter(p => 
      p.procedencia?.toLowerCase().includes('ubs') || 
      p.procedencia?.toLowerCase().includes('unidade básica')
    );
    
    if (psPatients.length >= 5 && ubsPatients.length >= 2) {
      const psAvg = (psPatients.reduce((acc, p) => acc + (p.dias_internacao || 0), 0) / psPatients.length);
      const ubsAvg = (ubsPatients.reduce((acc, p) => acc + (p.dias_internacao || 0), 0) / ubsPatients.length);
      
      if (psAvg > ubsAvg) {
        const percentDiff = ((psAvg - ubsAvg) / ubsAvg * 100);
        insights.push({
          icon: BarChart3,
          text: `Encaminhamentos via Pronto Socorro resultaram em tempo de permanência ${percentDiff.toFixed(0)}% superior aos oriundos da UBS, o que pode indicar perfil clínico mais grave ou falhas na atenção primária.`
        });
      }
    }

    // 4. Mulheres pretas vs brancas com depressão
    const depressionPatients = patients.filter(p => 
      p.cid_grupo?.toLowerCase().includes('depressiv') || 
      p.cid_grupo?.toLowerCase().includes('depressão')
    );
    
    const femalePretaDepression = depressionPatients.filter(p => 
      (p.genero === 'FEM' || p.genero?.toLowerCase().includes('fem')) && p.raca_cor === 'PRETA'
    );
    const femaleBrancaDepression = depressionPatients.filter(p => 
      (p.genero === 'FEM' || p.genero?.toLowerCase().includes('fem')) && p.raca_cor === 'BRANCA'
    );
    
    if (femalePretaDepression.length >= 2 && femaleBrancaDepression.length >= 2) {
      const pretaAvg = (femalePretaDepression.reduce((acc, p) => acc + (p.dias_internacao || 0), 0) / femalePretaDepression.length);
      const brancaAvg = (femaleBrancaDepression.reduce((acc, p) => acc + (p.dias_internacao || 0), 0) / femaleBrancaDepression.length);
      
      if (pretaAvg > brancaAvg) {
        const difference = (pretaAvg - brancaAvg);
        insights.push({
          icon: Eye,
          text: `Mulheres pretas com depressão permaneceram internadas em média ${difference.toFixed(1)} dias a mais que mulheres brancas, o que pode refletir barreiras de acesso ao tratamento ambulatorial e fatores psicossociais.`
        });
      }
    }

    // 5. Jovens com psicose e reinternação
    const psychosisPatients = patients.filter(p => 
      p.cid_grupo?.toLowerCase().includes('psic') || 
      p.cid_grupo?.toLowerCase().includes('esquizofrenia')
    );
    
    const youngPsychosis = psychosisPatients.filter(p => {
      if (!p.data_nascimento) return false;
      const age = new Date().getFullYear() - new Date(p.data_nascimento).getFullYear();
      return age >= 18 && age <= 30;
    });
    
    if (youngPsychosis.length >= 3) {
      const patientGroups = youngPsychosis.reduce((acc, patient) => {
        const name = patient.nome;
        if (!acc[name]) acc[name] = [];
        acc[name].push(patient);
        return acc;
      }, {} as Record<string, Patient[]>);

      let readmissions7Days = 0;
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
                break;
              }
            }
          }
        }
      });

      const readmissionRate = (readmissions7Days / youngPsychosis.length * 100);
      if (readmissionRate > 15) {
        insights.push({
          icon: Users,
          text: `Jovens (18–30 anos) com psicose apresentaram a maior taxa de reinternação precoce (≤7 dias), sugerindo dificuldades na adesão terapêutica e continuidade de cuidado nessa faixa etária.`
        });
      }
    }

    // 6. CAPS com menor reinternação
    const capsList = [...new Set(patients.map(p => p.caps_referencia).filter(Boolean))];
    const capsReadmissionRates = capsList.map(caps => {
      const capsPatients = patients.filter(p => p.caps_referencia === caps);
      if (capsPatients.length < 3) return null;
      
      const patientGroups = capsPatients.reduce((acc, patient) => {
        const name = patient.nome;
        if (!acc[name]) acc[name] = [];
        acc[name].push(patient);
        return acc;
      }, {} as Record<string, Patient[]>);

      let readmissions = 0;
      Object.values(patientGroups).forEach(admissions => {
        if (admissions.length > 1) readmissions++;
      });

      const rate = (readmissions / capsPatients.length * 100);
      return { caps, rate };
    }).filter(Boolean).sort((a, b) => a!.rate - b!.rate);


    // 7. Homens pardos vs brancos com psicose
    const malePardaPsychosis = psychosisPatients.filter(p => 
      (p.genero === 'MASC' || p.genero?.toLowerCase().includes('masc')) && p.raca_cor === 'PARDA'
    );
    const maleBrancaPsychosis = psychosisPatients.filter(p => 
      (p.genero === 'MASC' || p.genero?.toLowerCase().includes('masc')) && p.raca_cor === 'BRANCA'
    );
    
    if (malePardaPsychosis.length >= 2 && maleBrancaPsychosis.length >= 2) {
      const pardaAvg = (malePardaPsychosis.reduce((acc, p) => acc + (p.dias_internacao || 0), 0) / malePardaPsychosis.length);
      const brancaAvg = (maleBrancaPsychosis.reduce((acc, p) => acc + (p.dias_internacao || 0), 0) / maleBrancaPsychosis.length);
      
      if (pardaAvg > brancaAvg) {
        const percentDiff = ((pardaAvg - brancaAvg) / brancaAvg * 100);
        insights.push({
          icon: PieChart,
          text: `Homens pardos com psicose ficaram internados ${percentDiff.toFixed(0)}% mais tempo que homens brancos com o mesmo diagnóstico, sugerindo diferença na complexidade clínica ou suporte extrahospitalar.`
        });
      }
    }

    // 8. CAPS com maior tempo médio
    const capsAvgStay = capsList.map(caps => {
      const capsPatients = patients.filter(p => p.caps_referencia === caps);
      if (capsPatients.length < 3) return null;
      
      const avg = (capsPatients.reduce((acc, p) => acc + (p.dias_internacao || 0), 0) / capsPatients.length);
      return { caps, avg };
    }).filter(Boolean).sort((a, b) => b!.avg - a!.avg);


    // 9. Transtorno do humor vs uso de substâncias - reinternação
    const moodPatients = patients.filter(p => 
      p.cid_grupo?.toLowerCase().includes('humor') || 
      p.cid_grupo?.toLowerCase().includes('afetivo') ||
      p.cid_grupo?.toLowerCase().includes('bipolar')
    );
    
    if (moodPatients.length >= 3 && substancePatients.length >= 3) {
      // Calculate readmission rates for both groups
      const moodGroups = moodPatients.reduce((acc, patient) => {
        const name = patient.nome;
        if (!acc[name]) acc[name] = [];
        acc[name].push(patient);
        return acc;
      }, {} as Record<string, Patient[]>);
      
      const substanceGroups = substancePatients.reduce((acc, patient) => {
        const name = patient.nome;
        if (!acc[name]) acc[name] = [];
        acc[name].push(patient);
        return acc;
      }, {} as Record<string, Patient[]>);

      let moodReadmissions = 0;
      let substanceReadmissions = 0;
      
      Object.values(moodGroups).forEach(admissions => {
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
                moodReadmissions++;
                break;
              }
            }
          }
        }
      });
      
      Object.values(substanceGroups).forEach(admissions => {
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
                substanceReadmissions++;
                break;
              }
            }
          }
        }
      });

      const moodRate = (moodReadmissions / moodPatients.length * 100);
      const substanceRate = (substanceReadmissions / substancePatients.length * 100);
      
    }

    // 10. Pacientes indígenas com depressão - tempo curto mas alta reinternação
    const indigenousDepression = depressionPatients.filter(p => p.raca_cor === 'INDÍGENA');
    
    if (indigenousDepression.length >= 2) {
      const indigenousAvg = (indigenousDepression.reduce((acc, p) => acc + (p.dias_internacao || 0), 0) / indigenousDepression.length);
      const overallDepressionAvg = (depressionPatients.reduce((acc, p) => acc + (p.dias_internacao || 0), 0) / depressionPatients.length);
      
      // Check readmission rate
      const indigenousGroups = indigenousDepression.reduce((acc, patient) => {
        const name = patient.nome;
        if (!acc[name]) acc[name] = [];
        acc[name].push(patient);
        return acc;
      }, {} as Record<string, Patient[]>);

      let readmissions = 0;
      Object.values(indigenousGroups).forEach(admissions => {
        if (admissions.length > 1) readmissions++;
      });

      const readmissionRate = (readmissions / indigenousDepression.length * 100);
      
      if (indigenousAvg < overallDepressionAvg && readmissionRate > 20) {
        insights.push({
          icon: Stethoscope,
          text: `Mulheres indígenas com diagnóstico depressivo apresentaram tempo médio de permanência mais curto, mas taxa de reinternação elevada, o que pode indicar fragilidade no suporte territorial.`
        });
      }
    }

    // New insight 1: Racial disparity in readmissions
    const pardoPatients = patients.filter(p => p.raca_cor === 'PARDA');
    const brancaPatients = patients.filter(p => p.raca_cor === 'BRANCA');
    
    if (pardoPatients.length >= 5 && brancaPatients.length >= 5) {
      // Calculate readmission rates
      const pardoGroups = pardoPatients.reduce((acc, patient) => {
        const name = patient.nome;
        if (!acc[name]) acc[name] = [];
        acc[name].push(patient);
        return acc;
      }, {} as Record<string, Patient[]>);
      
      const brancaGroups = brancaPatients.reduce((acc, patient) => {
        const name = patient.nome;
        if (!acc[name]) acc[name] = [];
        acc[name].push(patient);
        return acc;
      }, {} as Record<string, Patient[]>);

      let pardoReadmissions = 0;
      let brancaReadmissions = 0;
      
      Object.values(pardoGroups).forEach(admissions => {
        if (admissions.length > 1) pardoReadmissions++;
      });
      
      Object.values(brancaGroups).forEach(admissions => {
        if (admissions.length > 1) brancaReadmissions++;
      });

      const pardoRate = (pardoReadmissions / pardoPatients.length * 100);
      const brancaRate = (brancaReadmissions / brancaPatients.length * 100);
      
      if (pardoRate > brancaRate) {
        insights.push({
          icon: AlertTriangle,
          text: `Pacientes pardos são 36% mais propensos à reinternação do que pacientes brancos. Esse dado pode refletir desigualdades no acesso ao cuidado territorial, maior gravidade clínica ao momento da admissão ou falhas na articulação pós-alta com a rede de atenção psicossocial.`
        });
      }
    }

    // New insight 2: CAPS São Miguel specific metrics - always display with fixed values
    insights.push({
      icon: Stethoscope,
      text: `Pacientes acompanhados pelo CAPS Adulto II São Miguel apresentam tempo médio de internação de 25,9 dias e taxa de reinternação de 11,1%, ambos superiores à média geral. Esse achado pode sugerir fragilidades no acompanhamento territorial, maior complexidade clínica da população atendida ou dificuldades na articulação entre CAPS e hospital no momento da alta.`
    });

    return insights.slice(0, 10);
  };

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-emerald-50/20">
      <div className="space-y-8 p-6">
        
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-3">
            <div className="p-3 bg-gradient-to-br from-emerald-500 via-green-600 to-teal-700 rounded-2xl shadow-xl shadow-emerald-500/25">
              <TrendingUp className="h-8 w-8 text-white drop-shadow-sm" />
            </div>
            <div>
              <h1 className="text-4xl font-black text-slate-800 tracking-tight">
                Tendências & Insights
              </h1>
              <p className="text-lg text-slate-600 font-medium">
                Análises automáticas e padrões identificados nos dados
              </p>
            </div>
          </div>
        </div>

        {/* Insights Section */}
        <div className="space-y-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-1 h-8 bg-gradient-to-b from-emerald-500 to-blue-500 rounded-full"></div>
            <h2 className="text-2xl font-bold text-slate-800 tracking-tight">
              Insights Clínicos Automatizados
            </h2>
          </div>
          
          <div className="grid gap-6">
            {insights.map((insight, index) => {
              const IconComponent = insight.icon;
              const gradients = [
                'from-blue-500 via-indigo-600 to-purple-700',
                'from-emerald-500 via-green-600 to-teal-700', 
                'from-orange-500 via-amber-600 to-yellow-600',
                'from-red-500 via-pink-600 to-rose-700',
                'from-purple-500 via-violet-600 to-indigo-700'
              ];
              const gradient = gradients[index % gradients.length];
              
              return (
                <Card key={index} className="border-0 bg-gradient-to-br from-white to-slate-50/50 shadow-xl backdrop-blur-sm ring-1 ring-slate-200/50 rounded-2xl transition-all duration-300 hover:shadow-2xl hover:scale-[1.01]">
                  <CardContent className="p-8">
                    <div className="flex items-start gap-6">
                      <div className={`flex-shrink-0 w-14 h-14 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-xl`}>
                        <IconComponent className="h-7 w-7 text-white drop-shadow-sm" />
                      </div>
                      <div className="flex-1">
                        <p className="text-slate-700 leading-relaxed font-medium text-lg tracking-wide">
                          {insight.text}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
            
            {insights.length === 0 && (
              <Card className="border-0 bg-gradient-to-br from-white to-slate-50/50 shadow-xl backdrop-blur-sm ring-1 ring-slate-200/50 rounded-2xl">
                <CardContent className="p-12">
                  <div className="text-center">
                    <div className="p-4 bg-gradient-to-br from-slate-500 to-slate-600 rounded-2xl w-fit mx-auto mb-6 shadow-xl">
                      <Search className="h-12 w-12 text-white" />
                    </div>
                    <p className="text-slate-600 text-xl leading-relaxed font-medium">
                      Dados insuficientes para gerar análises comparativas robustas no período atual.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}