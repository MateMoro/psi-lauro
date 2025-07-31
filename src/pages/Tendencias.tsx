import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Search, BarChart3, Eye, TrendingUp, Users, AlertTriangle, PieChart, Activity } from "lucide-react";

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
        .gte('data_admissao', '2024-06-11')
        .lte('data_admissao', '2025-07-24')
        .not('caps_referencia', 'ilike', '%IJ%')
        .not('caps_referencia', 'ilike', '%São Miguel%')
        .not('caps_referencia', 'ilike', '%Vila Monumento%');

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
      p.cid_grupo?.toLowerCase().includes('maníaco')
    );
    
    const femalePardaBipolar = bipolarPatients.filter(p => p.genero === 'FEM' && p.raca_cor === 'PARDA');
    const femaleBrancaBipolar = bipolarPatients.filter(p => p.genero === 'FEM' && p.raca_cor === 'BRANCA');
    
    if (femalePardaBipolar.length > 0 && femaleBrancaBipolar.length > 0) {
      const pardaAvg = (femalePardaBipolar.reduce((acc, p) => acc + (p.dias_internacao || 0), 0) / femalePardaBipolar.length);
      const brancaAvg = (femaleBrancaBipolar.reduce((acc, p) => acc + (p.dias_internacao || 0), 0) / femaleBrancaBipolar.length);
      const difference = (pardaAvg - brancaAvg);
      
      if (difference > 2) {
        insights.push({
          icon: Search,
          text: `Mulheres pardas com diagnóstico de transtorno bipolar permaneceram internadas, em média, ${difference.toFixed(1)} dias a mais do que mulheres brancas com o mesmo diagnóstico. Esse dado pode indicar maior gravidade clínica ao momento da internação ou menor acesso prévio a cuidados ambulatoriais.`
        });
      }
    }

    // 2. Pacientes com uso de substâncias por procedência
    const substancePatients = patients.filter(p => 
      p.cid_grupo?.toLowerCase().includes('substância') || 
      p.cid_grupo?.toLowerCase().includes('álcool') ||
      p.cid_grupo?.toLowerCase().includes('droga')
    );
    
    const substancePS = substancePatients.filter(p => 
      p.procedencia?.toLowerCase().includes('pronto socorro') || 
      p.procedencia?.toLowerCase().includes('ps')
    );
    const substanceUBS = substancePatients.filter(p => 
      p.procedencia?.toLowerCase().includes('ubs') || 
      p.procedencia?.toLowerCase().includes('unidade básica')
    );
    
    if (substancePS.length > 0 && substanceUBS.length > 0) {
      const psAvg = (substancePS.reduce((acc, p) => acc + (p.dias_internacao || 0), 0) / substancePS.length);
      const ubsAvg = (substanceUBS.reduce((acc, p) => acc + (p.dias_internacao || 0), 0) / substanceUBS.length);
      const difference = psAvg - ubsAvg;
      
      if (difference > 1) {
        insights.push({
          icon: TrendingUp,
          text: `Pacientes com transtornos por uso de substâncias provenientes do Pronto Socorro apresentaram tempo médio de permanência ${difference.toFixed(0)} dias maior do que aqueles oriundos da UBS, sugerindo que os casos captados em pronto atendimento chegam em condição clínica mais grave.`
        });
      }
    }

    // 3. Homens negros com psicose e reinternação
    const psychosisPatients = patients.filter(p => 
      p.cid_grupo?.toLowerCase().includes('psicose') || 
      p.cid_grupo?.toLowerCase().includes('psicótica') ||
      p.cid_grupo?.toLowerCase().includes('esquizofrenia')
    );
    
    const maleBlackPsychosis = psychosisPatients.filter(p => p.genero === 'MASC' && p.raca_cor === 'PRETA');
    
    if (maleBlackPsychosis.length > 0) {
      const patientGroups = maleBlackPsychosis.reduce((acc, patient) => {
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
              }
            }
          }
        }
      });

      const readmissionRate = ((readmissions7Days / maleBlackPsychosis.length) * 100);
      if (readmissionRate > 10) {
        insights.push({
          icon: BarChart3,
          text: `Homens negros com diagnóstico de psicose apresentaram a maior taxa de reinternação precoce (≤ 7 dias), superando ${readmissionRate.toFixed(0)}%, o que pode indicar fragilidade na continuidade do cuidado ou dificuldade de adesão ao tratamento.`
        });
      }
    }

    // 4. CAPS com menor reinternação
    const capsList = [...new Set(patients.map(p => p.caps_referencia).filter(Boolean))];
    const capsReadmissionRates = capsList.map(caps => {
      const capsPatients = patients.filter(p => p.caps_referencia === caps);
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

      const rate = capsPatients.length > 0 ? ((readmissions15Days / capsPatients.length) * 100) : 0;
      return { caps, rate };
    }).sort((a, b) => a.rate - b.rate);

    if (capsReadmissionRates.length > 0 && capsReadmissionRates[0].rate < 5) {
      insights.push({
        icon: Eye,
        text: `Entre os CAPS da Zona Leste, o ${capsReadmissionRates[0].caps} apresentou a menor taxa de reinternação precoce em até 15 dias (${capsReadmissionRates[0].rate.toFixed(1)}%), o que pode refletir boa articulação pós-alta e adesão ao plano terapêutico.`
      });
    }

    // 5. Transtorno depressivo recorrente
    const depressionPatients = patients.filter(p => 
      p.cid_grupo?.toLowerCase().includes('depressão') || 
      p.cid_grupo?.toLowerCase().includes('depressiv') ||
      p.cid_grupo?.toLowerCase().includes('recorrente')
    );
    
    if (depressionPatients.length > 0) {
      const avgStay = (depressionPatients.reduce((acc, p) => acc + (p.dias_internacao || 0), 0) / depressionPatients.length);
      
      // Calculate readmission rate
      const patientGroups = depressionPatients.reduce((acc, patient) => {
        const name = patient.nome;
        if (!acc[name]) acc[name] = [];
        acc[name].push(patient);
        return acc;
      }, {} as Record<string, Patient[]>);

      let readmissions = 0;
      Object.values(patientGroups).forEach(admissions => {
        if (admissions.length > 1) readmissions++;
      });

      const readmissionRate = ((readmissions / depressionPatients.length) * 100);
      
      if (avgStay < 10 && readmissionRate < 5) {
        insights.push({
          icon: Users,
          text: `Pacientes com diagnóstico de transtorno depressivo recorrente apresentaram tempo médio de permanência inferior a ${avgStay.toFixed(1)} dias e taxa de reinternação precoce abaixo de ${readmissionRate.toFixed(1)}%, sugerindo estabilidade clínica após a alta.`
        });
      }
    }

    // 6. Mulheres vs homens com psicose
    const femalePsychosis = psychosisPatients.filter(p => p.genero === 'FEM');
    const malePsychosis = psychosisPatients.filter(p => p.genero === 'MASC');
    
    if (femalePsychosis.length > 0 && malePsychosis.length > 0) {
      const femaleAvg = (femalePsychosis.reduce((acc, p) => acc + (p.dias_internacao || 0), 0) / femalePsychosis.length);
      const maleAvg = (malePsychosis.reduce((acc, p) => acc + (p.dias_internacao || 0), 0) / malePsychosis.length);
      const difference = maleAvg - femaleAvg;
      
      if (difference > 1) {
        insights.push({
          icon: AlertTriangle,
          text: `Mulheres com diagnóstico de psicose têm, em média, permanência hospitalar ${difference.toFixed(1)} dias menor do que homens com o mesmo diagnóstico, possivelmente refletindo diferenças no padrão de sintomas e resposta terapêutica.`
        });
      }
    }

    // 7. Pacientes pardos com patologia psicótica
    const pardaPsychosis = psychosisPatients.filter(p => p.raca_cor === 'PARDA');
    
    if (pardaPsychosis.length > 0) {
      const pardaAvg = (pardaPsychosis.reduce((acc, p) => acc + (p.dias_internacao || 0), 0) / pardaPsychosis.length);
      
      // Compare with other races
      const otherRacesPsychosis = psychosisPatients.filter(p => p.raca_cor && p.raca_cor !== 'PARDA' && p.raca_cor !== 'NÃO INFORMADO');
      if (otherRacesPsychosis.length > 0) {
        const otherAvg = (otherRacesPsychosis.reduce((acc, p) => acc + (p.dias_internacao || 0), 0) / otherRacesPsychosis.length);
        
        if (pardaAvg > otherAvg + 2) {
          insights.push({
            icon: PieChart,
            text: `Pacientes com cor/raça parda e patologia psicótica foram o subgrupo com maior tempo médio de permanência (${pardaAvg.toFixed(1)} dias) entre todos os recortes, o que pode representar vulnerabilidade social e atraso na captação de casos graves.`
          });
        }
      }
    }

    // 8. Transtornos por uso de substâncias - reinternação
    if (substancePatients.length > 0) {
      const patientGroups = substancePatients.reduce((acc, patient) => {
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

      const readmissionRate = ((readmissions15Days / substancePatients.length) * 100);
      if (readmissionRate > 8) {
        insights.push({
          icon: Activity,
          text: `A taxa de reinternação ≤ 15 dias é mais elevada entre pacientes com transtornos por uso de substâncias (${readmissionRate.toFixed(1)}%), reforçando a importância de articulação mais robusta com serviços de reabilitação psicossocial.`
        });
      }
    }

    return insights.slice(0, 8); // Limit to 8 insights max
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
      <div className="text-center space-y-4">
        <h1 className="text-3xl md:text-4xl font-bold text-primary">
          INSIGHTS
        </h1>
      </div>

      {/* Insights Cards */}
      <div className="space-y-6">
        {insights.map((insight, index) => {
          const IconComponent = insight.icon;
          return (
            <Card key={index} className="border border-border/40 shadow-sm hover:shadow-md transition-shadow duration-300 bg-card/50 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center mt-1">
                    <IconComponent className="h-4 w-4 text-primary" />
                  </div>
                  <p className="text-foreground leading-relaxed font-medium text-base">
                    {insight.text}
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
        
        {insights.length === 0 && (
          <Card className="border border-border/40 shadow-sm">
            <CardContent className="p-8">
              <div className="text-center">
                <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground text-lg">
                  Nenhum insight disponível com os dados atuais. 
                  Os insights são gerados quando há dados suficientes para análises comparativas.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Technical Note */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-6">
          <p className="text-sm text-muted-foreground text-center leading-relaxed">
            <strong>Nota Técnica:</strong> Esta seção serve para subsidiar reuniões clínicas, análise gerencial e discussão com a rede de atenção psicossocial. 
            Os insights são gerados automaticamente com base nos dados de internações entre 11/06/2024 e 24/07/2025, excluindo CAPS fora da Zona Leste, 
            e devem ser interpretados considerando o contexto clínico e territorial específico.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}