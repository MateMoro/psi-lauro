import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  TrendingUp, 
  Users, 
  Activity, 
  AlertTriangle, 
  Target, 
  Stethoscope,
  Brain,
  Heart,
  Clock,
  UserCheck
} from "lucide-react";

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
        .not('caps_referencia', 'ilike', '%ij%');

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
          icon: Brain,
          text: `Mulheres pardas com transtorno bipolar ficaram ${percentDiff.toFixed(0)}% mais tempo internadas do que mulheres brancas com o mesmo diagnóstico, possivelmente refletindo acesso mais tardio ao cuidado ou quadro clínico mais grave na admissão.`
        });
      }
    }

    // 2. Homens brancos vs pretos com uso de substâncias
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
      const brancaAvg = (maleBrancaSubstance.reduce((acc, p) => acc + (p.dias_internacao || 0), 0) / maleBrancaSubstance.length);
      const pretaAvg = (malePretaSubstance.reduce((acc, p) => acc + (p.dias_internacao || 0), 0) / malePretaSubstance.length);
      
      if (brancaAvg > pretaAvg) {
        const percentDiff = ((brancaAvg - pretaAvg) / pretaAvg * 100);
        insights.push({
          icon: TrendingUp,
          text: `Homens brancos com transtornos por uso de substâncias apresentaram tempo de permanência ${percentDiff.toFixed(0)}% maior que homens pretos com o mesmo diagnóstico, sugerindo possível diferença na complexidade clínica ou acesso a serviços especializados.`
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
          icon: AlertTriangle,
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
          icon: Heart,
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
        if (admissions.length > 1) readmissions7Days++;
      });

      const readmissionRate = (readmissions7Days / youngPsychosis.length * 100);
      if (readmissionRate > 10) {
        insights.push({
          icon: Users,
          text: `Jovens (18–30 anos) com psicose apresentaram taxa de reinternação significativamente elevada, sugerindo dificuldades na adesão terapêutica e continuidade de cuidado nessa faixa etária.`
        });
      }
    }

    // 6. CAPS com melhor desempenho
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

    if (capsReadmissionRates.length > 0 && capsReadmissionRates[0]!.rate < 5) {
      insights.push({
        icon: Activity,
        text: `${capsReadmissionRates[0]!.caps} demonstrou excelente articulação terapêutica com baixíssima taxa de reinternação, sugerindo efetiva coordenação do cuidado pós-alta.`
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
          icon: Brain,
          text: `Homens pardos com psicose ficaram internados ${percentDiff.toFixed(0)}% mais tempo que homens brancos com o mesmo diagnóstico, sugerindo possível diferença na complexidade clínica ou suporte familiar disponível.`
        });
      }
    }

    // 8. CAPS com maior complexidade clínica
    const capsAvgStay = capsList.map(caps => {
      const capsPatients = patients.filter(p => p.caps_referencia === caps);
      if (capsPatients.length < 3) return null;
      
      const avg = (capsPatients.reduce((acc, p) => acc + (p.dias_internacao || 0), 0) / capsPatients.length);
      return { caps, avg };
    }).filter(Boolean).sort((a, b) => b!.avg - a!.avg);

    if (capsAvgStay.length >= 2) {
      const highest = capsAvgStay[0]!;
      if (highest.avg > 15) {
        insights.push({
          icon: Stethoscope,
          text: `Pacientes vinculados ao ${highest.caps} apresentaram o maior tempo médio de internação (${highest.avg.toFixed(1)} dias), indicando atendimento a casos de maior complexidade psiquiátrica.`
        });
      }
    }

    // 9. Perfil de idade em transtornos depressivos
    const olderDepression = depressionPatients.filter(p => {
      if (!p.data_nascimento) return false;
      const age = new Date().getFullYear() - new Date(p.data_nascimento).getFullYear();
      return age >= 60;
    });
    
    const youngerDepression = depressionPatients.filter(p => {
      if (!p.data_nascimento) return false;
      const age = new Date().getFullYear() - new Date(p.data_nascimento).getFullYear();
      return age >= 18 && age <= 40;
    });
    
    if (olderDepression.length >= 3 && youngerDepression.length >= 3) {
      const olderAvg = (olderDepression.reduce((acc, p) => acc + (p.dias_internacao || 0), 0) / olderDepression.length);
      const youngerAvg = (youngerDepression.reduce((acc, p) => acc + (p.dias_internacao || 0), 0) / youngerDepression.length);
      
      if (olderAvg > youngerAvg) {
        const percentDiff = ((olderAvg - youngerAvg) / youngerAvg * 100);
        insights.push({
          icon: Clock,
          text: `Pacientes idosos (≥60 anos) com depressão permaneceram ${percentDiff.toFixed(0)}% mais tempo internados que adultos jovens, possivelmente devido a comorbidades clínicas e maior complexidade psicossocial.`
        });
      }
    }

    // 10. Diferença de gênero em transtornos por uso de substâncias
    const maleSubstance = substancePatients.filter(p => 
      p.genero === 'MASC' || p.genero?.toLowerCase().includes('masc')
    );
    const femaleSubstance = substancePatients.filter(p => 
      p.genero === 'FEM' || p.genero?.toLowerCase().includes('fem')
    );
    
    if (maleSubstance.length >= 5 && femaleSubstance.length >= 3) {
      const maleAvg = (maleSubstance.reduce((acc, p) => acc + (p.dias_internacao || 0), 0) / maleSubstance.length);
      const femaleAvg = (femaleSubstance.reduce((acc, p) => acc + (p.dias_internacao || 0), 0) / femaleSubstance.length);
      
      if (Math.abs(maleAvg - femaleAvg) > 2) {
        const longer = maleAvg > femaleAvg ? 'Homens' : 'Mulheres';
        const percentDiff = maleAvg > femaleAvg ? 
          ((maleAvg - femaleAvg) / femaleAvg * 100) :
          ((femaleAvg - maleAvg) / maleAvg * 100);
        
        insights.push({
          icon: UserCheck,
          text: `${longer} com transtornos por uso de substâncias apresentaram tempo de internação ${percentDiff.toFixed(0)}% maior, sugerindo diferenças nos padrões de uso ou na resposta ao tratamento entre os gêneros.`
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
          <p className="text-muted-foreground">Carregando dados...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-foreground flex items-center justify-center gap-3">
          <TrendingUp className="h-8 w-8 text-primary" />
          Tendências
        </h1>
        <p className="text-muted-foreground">
          Insights clínico-epidemiológicos baseados em análises comparativas dos dados
        </p>
      </div>

      {insights.length === 0 ? (
        <Card className="shadow-medium">
          <CardContent className="text-center py-12">
            <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              Dados insuficientes para gerar insights significativos
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {insights.map((insight, index) => (
            <Card key={index} className="shadow-medium hover:shadow-large transition-shadow duration-200">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="p-3 bg-primary/10 rounded-lg">
                      <insight.icon className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="text-foreground leading-relaxed text-sm md:text-base">
                      {insight.text}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}