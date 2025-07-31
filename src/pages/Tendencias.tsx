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
          text: `Mulheres pardas com diagnóstico de transtorno bipolar apresentaram tempo médio de internação ${percentDiff.toFixed(0)}% maior do que mulheres brancas com o mesmo diagnóstico, o que pode indicar diferenças de acesso prévio ao cuidado ou gravidade clínica na admissão.`
        });
      }
    }

    // 2. Pacientes com psicose por cor/raça
    const psychosisPatients = patients.filter(p => 
      p.cid_grupo?.toLowerCase().includes('psic') || 
      p.cid_grupo?.toLowerCase().includes('esquizofrenia')
    );
    
    const pretaPsychosis = psychosisPatients.filter(p => p.raca_cor === 'PRETA');
    const pardaPsychosis = psychosisPatients.filter(p => p.raca_cor === 'PARDA');
    
    if (pretaPsychosis.length >= 3 && pardaPsychosis.length >= 3) {
      const pretaAvg = (pretaPsychosis.reduce((acc, p) => acc + (p.dias_internacao || 0), 0) / pretaPsychosis.length);
      const pardaAvg = (pardaPsychosis.reduce((acc, p) => acc + (p.dias_internacao || 0), 0) / pardaPsychosis.length);
      
      if (pretaAvg > pardaAvg + 2) {
        insights.push({
          icon: TrendingUp,
          text: `Pacientes com diagnóstico de psicose e cor preta permaneceram em média ${(pretaAvg - pardaAvg).toFixed(0)} dias a mais internados que os pacientes pardos com o mesmo diagnóstico, sugerindo maior complexidade clínica ou dificuldades de suporte extrahospitalar.`
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
      p.procedencia?.toLowerCase().includes('unidade básica') ||
      p.procedencia?.toLowerCase().includes('posto')
    );
    
    if (psPatients.length >= 5 && ubsPatients.length >= 2) {
      const psAvg = (psPatients.reduce((acc, p) => acc + (p.dias_internacao || 0), 0) / psPatients.length);
      const ubsAvg = (ubsPatients.reduce((acc, p) => acc + (p.dias_internacao || 0), 0) / ubsPatients.length);
      
      if (psAvg > ubsAvg) {
        const percentDiff = ((psAvg - ubsAvg) / ubsAvg * 100);
        insights.push({
          icon: BarChart3,
          text: `Encaminhados via Pronto Socorro tiveram tempo médio de internação ${percentDiff.toFixed(0)}% superior aos que vieram da UBS, o que pode refletir perfil clínico mais grave ou falhas na atenção primária.`
        });
      }
    }

    // 4. Reinternação por raça em uso de substâncias
    const substancePatients = patients.filter(p => 
      p.cid_grupo?.toLowerCase().includes('substância') || 
      p.cid_grupo?.toLowerCase().includes('álcool') ||
      p.cid_grupo?.toLowerCase().includes('droga')
    );
    
    if (substancePatients.length > 0) {
      const patientGroups = substancePatients.reduce((acc, patient) => {
        const name = patient.nome;
        if (!acc[name]) acc[name] = [];
        acc[name].push(patient);
        return acc;
      }, {} as Record<string, Patient[]>);

      let brancaReadmissions = 0;
      let brancaTotal = 0;
      
      Object.values(patientGroups).forEach(admissions => {
        const hasReadmission = admissions.length > 1;
        const raceColor = admissions[0]?.raca_cor;
        
        if (raceColor === 'BRANCA') {
          brancaTotal++;
          if (hasReadmission) {
            // Check if it's early readmission (≤ 7 days)
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
                  brancaReadmissions++;
                  break;
                }
              }
            }
          }
        }
      });

      if (brancaTotal > 0 && brancaReadmissions > 0) {
        const rate = (brancaReadmissions / brancaTotal * 100);
        if (rate > 15) {
          insights.push({
            icon: Eye,
            text: `Homens brancos com diagnóstico de uso de substâncias apresentaram maior taxa de reinternação precoce (≤ 7 dias) entre todos os recortes analisados, sugerindo fragilidade no acompanhamento ambulatorial.`
          });
        }
      }
    }

    // 5. CAPS com menor reinternação
    const capsList = [...new Set(patients.map(p => p.caps_referencia).filter(Boolean))];
    const capsWithLowReadmission = [];
    
    capsList.forEach(caps => {
      const capsPatients = patients.filter(p => p.caps_referencia === caps);
      if (capsPatients.length < 3) return;
      
      const patientGroups = capsPatients.reduce((acc, patient) => {
        const name = patient.nome;
        if (!acc[name]) acc[name] = [];
        acc[name].push(patient);
        return acc;
      }, {} as Record<string, Patient[]>);

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
              
              if (daysBetween <= 15) {
                readmissions15Days++;
              }
            }
          }
        }
      });

      const rate = (readmissions15Days / capsPatients.length * 100);
      if (rate < 2) {
        capsWithLowReadmission.push({ caps, rate });
      }
    });

    if (capsWithLowReadmission.length > 0) {
      const bestCaps = capsWithLowReadmission[0];
      insights.push({
        icon: Users,
        text: `${bestCaps.caps} teve a menor taxa de reinternação em até 15 dias (${bestCaps.rate.toFixed(1)}%), sinalizando boa articulação terapêutica pós-alta.`
      });
    }

    // 6. Mulheres pretas vs brancas com depressão
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
        const percentDiff = ((pretaAvg - brancaAvg) / brancaAvg * 100);
        insights.push({
          icon: Activity,
          text: `Mulheres pretas com diagnóstico depressivo tiveram internações ${percentDiff.toFixed(0)}% mais longas que mulheres brancas com o mesmo quadro, o que pode apontar para maior vulnerabilidade social e barreiras no acesso inicial.`
        });
      }
    }

    // 7. Jovens com psicose e reinternação
    const youngPsychosis = psychosisPatients.filter(p => {
      if (!p.data_nascimento) return false;
      const age = new Date().getFullYear() - new Date(p.data_nascimento).getFullYear();
      return age <= 30;
    });
    
    if (youngPsychosis.length >= 3) {
      const patientGroups = youngPsychosis.reduce((acc, patient) => {
        const name = patient.nome;
        if (!acc[name]) acc[name] = [];
        acc[name].push(patient);
        return acc;
      }, {} as Record<string, Patient[]>);

      let readmissions = 0;
      Object.values(patientGroups).forEach(admissions => {
        if (admissions.length > 1) readmissions++;
      });

      const readmissionRate = (readmissions / youngPsychosis.length * 100);
      if (readmissionRate > 10) {
        insights.push({
          icon: PieChart,
          text: `Jovens até 30 anos com diagnóstico psicótico apresentam as maiores taxas de reinternação precoce, o que pode refletir interrupções terapêuticas frequentes nesse grupo etário.`
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
        text: `Entre os CAPS da Zona Leste, o ${highest.caps} teve o maior tempo médio de permanência dos pacientes internados, indicando possível atuação sobre casos de maior complexidade.`
      });
    }

    // 9. Homens pardos vs brancos com uso de substâncias
    const malePardaSubstance = substancePatients.filter(p => 
      (p.genero === 'MASC' || p.genero?.toLowerCase().includes('masc')) && p.raca_cor === 'PARDA'
    );
    const maleBrancaSubstance = substancePatients.filter(p => 
      (p.genero === 'MASC' || p.genero?.toLowerCase().includes('masc')) && p.raca_cor === 'BRANCA'
    );
    
    if (malePardaSubstance.length >= 2 && maleBrancaSubstance.length >= 2) {
      const pardaAvg = (malePardaSubstance.reduce((acc, p) => acc + (p.dias_internacao || 0), 0) / malePardaSubstance.length);
      const brancaAvg = (maleBrancaSubstance.reduce((acc, p) => acc + (p.dias_internacao || 0), 0) / maleBrancaSubstance.length);
      
      if (pardaAvg > brancaAvg + 2) {
        insights.push({
          icon: Target,
          text: `Homens pardos com transtornos por uso de substâncias têm tempo médio de internação significativamente superior ao de homens brancos com o mesmo diagnóstico, sugerindo abordagem tardia ou menor adesão ao tratamento prévio.`
        });
      }
    }

    // 10. Procedência hospitalar e tempo de permanência
    const hospitalPatients = patients.filter(p => 
      p.procedencia?.toLowerCase().includes('hospital') && 
      !p.procedencia?.toLowerCase().includes('ps') &&
      !p.procedencia?.toLowerCase().includes('pronto socorro')
    );
    
    if (hospitalPatients.length >= 5) {
      const hospitalAvg = (hospitalPatients.reduce((acc, p) => acc + (p.dias_internacao || 0), 0) / hospitalPatients.length);
      const overallAvg = (patients.reduce((acc, p) => acc + (p.dias_internacao || 0), 0) / patients.length);
      
      if (hospitalAvg > overallAvg + 3) {
        insights.push({
          icon: Stethoscope,
          text: `Pacientes transferidos diretamente de outros hospitais apresentaram tempo médio de permanência superior à média geral, indicando maior complexidade dos casos ou necessidade de estabilização prolongada.`
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
        <h1 className="text-4xl font-bold text-primary mb-2">
          Tendências
        </h1>
        <p className="text-muted-foreground text-lg">
          Análises clínico-epidemiológicas baseadas em cruzamentos demográficos e clínicos
        </p>
      </div>

      {/* Insights Cards */}
      <div className="grid gap-6">
        {insights.map((insight, index) => {
          const IconComponent = insight.icon;
          return (
            <Card key={index} className="border border-border/20 shadow-md hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-card/90 to-card/70 backdrop-blur-sm">
              <CardContent className="p-8">
                <div className="flex items-start gap-6">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mt-1 shadow-inner">
                    <IconComponent className="h-6 w-6 text-primary" />
                  </div>
                  <p className="text-foreground leading-relaxed font-medium text-lg tracking-wide">
                    {insight.text}
                  </p>
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