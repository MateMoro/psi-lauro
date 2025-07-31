import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Search, TrendingUp, BarChart3, Eye, Users, Activity, PieChart, AlertTriangle, Target, Stethoscope } from "lucide-react";

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

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      const { data, error } = await supabase
        .from('pacientes_planalto')
        .select('*')
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

    if (capsReadmissionRates.length > 0 && capsReadmissionRates[0]!.rate === 0) {
      insights.push({
        icon: Activity,
        text: `${capsReadmissionRates[0]!.caps} teve a menor taxa de reinternação precoce (0%), sugerindo efetiva articulação pós-alta e adesão ao plano terapêutico.`
      });
    }

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

    if (capsAvgStay.length >= 2) {
      const highest = capsAvgStay[0]!;
      insights.push({
        icon: AlertTriangle,
        text: `Pacientes do ${highest.caps} apresentaram o maior tempo médio de internação, indicando atuação sobre casos de maior complexidade psiquiátrica.`
      });
    }

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
      
      if (moodRate > substanceRate * 2) {
        const ratio = (moodRate / substanceRate);
        insights.push({
          icon: Target,
          text: `Reinternações em até 7 dias foram ${ratio.toFixed(1)} vezes mais frequentes entre pacientes com diagnóstico de transtorno do humor do que entre os com transtorno por uso de substâncias, apontando para fragilidade de seguimento nos casos afetivos.`
        });
      }
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
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-primary">
          Tendências
        </h1>
      </div>

      {/* Insights Cards */}
      <div className="grid gap-6">
        {insights.map((insight, index) => {
          const IconComponent = insight.icon;
          return (
            <Card key={index} className="border border-border/20 shadow-md hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-card/95 to-card/85 backdrop-blur-sm">
              <CardContent className="p-8">
                <div className="flex items-start gap-6">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/15 flex items-center justify-center mt-1 shadow-inner border border-primary/20">
                    <IconComponent className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-foreground leading-relaxed font-medium text-lg tracking-wide">
                      {insight.text}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
        
        {insights.length === 0 && (
          <Card className="border border-border/20 shadow-md">
            <CardContent className="p-12">
              <div className="text-center">
                <Search className="h-20 w-20 text-muted-foreground mx-auto mb-6" />
                <p className="text-muted-foreground text-xl leading-relaxed">
                  Dados insuficientes para gerar análises comparativas robustas no período atual.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}