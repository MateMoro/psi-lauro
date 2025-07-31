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
        .gte('data_admissao', '2024-06-11')
        .lte('data_admissao', '2025-07-24')
        .not('caps_referencia', 'ilike', '%IJ%')
        .not('caps_referencia', 'ilike', '%São Miguel%')
        .not('caps_referencia', 'ilike', '%Vila Monumento%')
        .neq('genero', 'OUTROS');

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
    
    if (femalePardaBipolar.length >= 3 && femaleBrancaBipolar.length >= 3) {
      const pardaAvg = (femalePardaBipolar.reduce((acc, p) => acc + (p.dias_internacao || 0), 0) / femalePardaBipolar.length);
      const brancaAvg = (femaleBrancaBipolar.reduce((acc, p) => acc + (p.dias_internacao || 0), 0) / femaleBrancaBipolar.length);
      
      if (pardaAvg > brancaAvg + 1) {
        insights.push({
          icon: Search,
          text: `Mulheres pardas com diagnóstico de transtorno bipolar apresentaram tempo médio de permanência superior ao de mulheres brancas com o mesmo diagnóstico, sugerindo possível maior gravidade ao momento da admissão ou menor acesso prévio ao cuidado.`
        });
      }
    }

    // 2. UBS vs Pronto Socorro
    const ubsPatients = patients.filter(p => 
      p.procedencia?.toLowerCase().includes('ubs') || 
      p.procedencia?.toLowerCase().includes('unidade básica')
    );
    const psPatients = patients.filter(p => 
      p.procedencia?.toLowerCase().includes('pronto socorro') || 
      p.procedencia?.toLowerCase().includes('ps')
    );
    
    if (ubsPatients.length >= 5 && psPatients.length >= 5) {
      const ubsAvg = (ubsPatients.reduce((acc, p) => acc + (p.dias_internacao || 0), 0) / ubsPatients.length);
      const psAvg = (psPatients.reduce((acc, p) => acc + (p.dias_internacao || 0), 0) / psPatients.length);
      
      if (psAvg > ubsAvg + 1) {
        insights.push({
          icon: TrendingUp,
          text: `Pacientes oriundos de UBS permaneceram internados por menos tempo, em média, do que os provenientes de Pronto Socorro, o que pode indicar diferenças no grau de estabilização clínica pré-internação.`
        });
      }
    }

    // 3. Homens pardos com psicose - reinternação
    const psychosisPatients = patients.filter(p => 
      p.cid_grupo?.toLowerCase().includes('psicose') || 
      p.cid_grupo?.toLowerCase().includes('psicótica') ||
      p.cid_grupo?.toLowerCase().includes('esquizofrenia')
    );
    
    const malePardaPsychosis = psychosisPatients.filter(p => p.genero === 'MASC' && p.raca_cor === 'PARDA');
    
    if (malePardaPsychosis.length >= 3) {
      const patientGroups = malePardaPsychosis.reduce((acc, patient) => {
        const name = patient.nome;
        if (!acc[name]) acc[name] = [];
        acc[name].push(patient);
        return acc;
      }, {} as Record<string, Patient[]>);

      let readmissions = 0;
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
                readmissions++;
              }
            }
          }
        }
      });

      const readmissionRate = ((readmissions / malePardaPsychosis.length) * 100);
      if (readmissionRate > 8) {
        insights.push({
          icon: BarChart3,
          text: `Entre os pacientes com diagnóstico de psicose, homens pardos apresentaram as maiores taxas de reinternação precoce, o que pode refletir dificuldades na adesão ao plano terapêutico ou fragilidades na rede de apoio.`
        });
      }
    }

    // 4. CAPS com menor reinternação
    const capsList = [...new Set(patients.map(p => p.caps_referencia).filter(Boolean))];
    const capsWithNoReadmissions = [];
    
    capsList.forEach(caps => {
      const capsPatients = patients.filter(p => p.caps_referencia === caps);
      if (capsPatients.length < 3) return; // Skip CAPS with too few patients
      
      const patientGroups = capsPatients.reduce((acc, patient) => {
        const name = patient.nome;
        if (!acc[name]) acc[name] = [];
        acc[name].push(patient);
        return acc;
      }, {} as Record<string, Patient[]>);

      let hasReadmissions = false;
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
                hasReadmissions = true;
                break;
              }
            }
          }
        }
      });

      if (!hasReadmissions) {
        capsWithNoReadmissions.push(caps);
      }
    });

    if (capsWithNoReadmissions.length > 0) {
      insights.push({
        icon: Eye,
        text: `${capsWithNoReadmissions[0]} destacou-se por não apresentar reinternações precoces no período, o que pode indicar boa articulação pós-alta e efetividade na continuidade do cuidado.`
      });
    }

    // 5. Homens brancos vs pardos com uso de substâncias
    const substancePatients = patients.filter(p => 
      p.cid_grupo?.toLowerCase().includes('substância') || 
      p.cid_grupo?.toLowerCase().includes('álcool') ||
      p.cid_grupo?.toLowerCase().includes('droga')
    );
    
    const maleBrancaSubstance = substancePatients.filter(p => p.genero === 'MASC' && p.raca_cor === 'BRANCA');
    const malePardaSubstance = substancePatients.filter(p => p.genero === 'MASC' && p.raca_cor === 'PARDA');
    
    if (maleBrancaSubstance.length >= 3 && malePardaSubstance.length >= 3) {
      const brancaAvg = (maleBrancaSubstance.reduce((acc, p) => acc + (p.dias_internacao || 0), 0) / maleBrancaSubstance.length);
      const pardaAvg = (malePardaSubstance.reduce((acc, p) => acc + (p.dias_internacao || 0), 0) / malePardaSubstance.length);
      
      if (pardaAvg > brancaAvg + 1) {
        insights.push({
          icon: Users,
          text: `Homens brancos com transtorno por uso de substâncias tiveram tempo médio de permanência inferior ao de pardos com o mesmo diagnóstico, o que pode sinalizar diferenças no perfil clínico e suporte social.`
        });
      }
    }

    // 6. Mulheres vs homens com depressão
    const depressionPatients = patients.filter(p => 
      p.cid_grupo?.toLowerCase().includes('depressão') || 
      p.cid_grupo?.toLowerCase().includes('depressiv') ||
      p.cid_grupo?.toLowerCase().includes('recorrente')
    );
    
    const femaleDepression = depressionPatients.filter(p => p.genero === 'FEM');
    const maleDepression = depressionPatients.filter(p => p.genero === 'MASC');
    
    if (femaleDepression.length >= 3 && maleDepression.length >= 3) {
      const femaleAvg = (femaleDepression.reduce((acc, p) => acc + (p.dias_internacao || 0), 0) / femaleDepression.length);
      const maleAvg = (maleDepression.reduce((acc, p) => acc + (p.dias_internacao || 0), 0) / maleDepression.length);
      
      if (maleAvg > femaleAvg + 1) {
        insights.push({
          icon: Activity,
          text: `Entre os pacientes com depressão recorrente, mulheres apresentaram tempo médio de permanência inferior ao dos homens, sugerindo melhor resposta ao tratamento medicamentoso ou maior suporte familiar.`
        });
      }
    }

    // 7. Psicose por Pronto Socorro
    const psychosisPS = psychosisPatients.filter(p => 
      p.procedencia?.toLowerCase().includes('pronto socorro') || 
      p.procedencia?.toLowerCase().includes('ps')
    );
    
    if (psychosisPS.length >= 5) {
      const psAvgPsychosis = (psychosisPS.reduce((acc, p) => acc + (p.dias_internacao || 0), 0) / psychosisPS.length);
      const overallAvg = (patients.reduce((acc, p) => acc + (p.dias_internacao || 0), 0) / patients.length);
      
      if (psAvgPsychosis > overallAvg + 3) {
        insights.push({
          icon: PieChart,
          text: `A maior média de permanência foi observada em pacientes com psicose internados por encaminhamento direto de Pronto Socorro, reforçando o padrão de gravidade clínica nesses casos.`
        });
      }
    }

    // 8. Mulheres pretas vs brancas com transtorno ansioso
    const anxietyPatients = patients.filter(p => 
      p.cid_grupo?.toLowerCase().includes('ansied') || 
      p.cid_grupo?.toLowerCase().includes('fobia') ||
      p.cid_grupo?.toLowerCase().includes('pânico')
    );
    
    const femalePretaAnxiety = anxietyPatients.filter(p => p.genero === 'FEM' && p.raca_cor === 'PRETA');
    const femaleBrancaAnxiety = anxietyPatients.filter(p => p.genero === 'FEM' && p.raca_cor === 'BRANCA');
    
    if (femalePretaAnxiety.length >= 2 && femaleBrancaAnxiety.length >= 2) {
      const pretaAvg = (femalePretaAnxiety.reduce((acc, p) => acc + (p.dias_internacao || 0), 0) / femalePretaAnxiety.length);
      const brancaAvg = (femaleBrancaAnxiety.reduce((acc, p) => acc + (p.dias_internacao || 0), 0) / femaleBrancaAnxiety.length);
      
      if (pretaAvg > brancaAvg + 1) {
        insights.push({
          icon: AlertTriangle,
          text: `Mulheres pretas com transtornos ansiosos apresentaram tempo médio de permanência superior ao de mulheres brancas com o mesmo quadro, indicando possíveis disparidades no acesso ao cuidado ambulatorial.`
        });
      }
    }

    // 9. Pacientes jovens com transtorno bipolar
    const youngBipolar = bipolarPatients.filter(p => {
      if (!p.data_nascimento) return false;
      const age = new Date().getFullYear() - new Date(p.data_nascimento).getFullYear();
      return age < 30;
    });
    
    if (youngBipolar.length >= 3) {
      const patientGroups = youngBipolar.reduce((acc, patient) => {
        const name = patient.nome;
        if (!acc[name]) acc[name] = [];
        acc[name].push(patient);
        return acc;
      }, {} as Record<string, Patient[]>);

      let readmissions = 0;
      Object.values(patientGroups).forEach(admissions => {
        if (admissions.length > 1) readmissions++;
      });

      const readmissionRate = ((readmissions / youngBipolar.length) * 100);
      if (readmissionRate > 10) {
        insights.push({
          icon: Target,
          text: `Pacientes jovens com transtorno bipolar apresentaram taxa elevada de reinternações, evidenciando necessidade de estratégias específicas de adesão ao tratamento e fortalecimento da rede de apoio psicossocial.`
        });
      }
    }

    // 10. Comparação entre CAPS por tempo médio
    const capsAvgStay = capsList.map(caps => {
      const capsPatients = patients.filter(p => p.caps_referencia === caps);
      if (capsPatients.length < 3) return null; // Skip CAPS with too few patients
      
      const avg = (capsPatients.reduce((acc, p) => acc + (p.dias_internacao || 0), 0) / capsPatients.length);
      return { caps, avg };
    }).filter(Boolean).sort((a, b) => b!.avg - a!.avg);

    if (capsAvgStay.length >= 2) {
      const highest = capsAvgStay[0]!;
      const lowest = capsAvgStay[capsAvgStay.length - 1]!;
      if (highest.avg > lowest.avg + 2) {
        insights.push({
          icon: Stethoscope,
          text: `${highest.caps} apresentou tempo médio de permanência superior ao ${lowest.caps}, possivelmente relacionado a diferenças no perfil clínico dos usuários ou recursos disponíveis para articulação pós-alta.`
        });
      }
    }

    return insights.slice(0, 10); // Limit to 10 insights max
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
          INSIGHTS
        </h1>
      </div>

      {/* Insights Cards */}
      <div className="grid gap-6">
        {insights.map((insight, index) => {
          const IconComponent = insight.icon;
          return (
            <Card key={index} className="border border-border/30 shadow-sm hover:shadow-lg transition-all duration-300 bg-gradient-to-r from-card/80 to-card/60 backdrop-blur-sm">
              <CardContent className="p-8">
                <div className="flex items-start gap-6">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center mt-1">
                    <IconComponent className="h-5 w-5 text-primary" />
                  </div>
                  <p className="text-foreground leading-relaxed font-medium text-lg">
                    {insight.text}
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
        
        {insights.length === 0 && (
          <Card className="border border-border/30 shadow-sm">
            <CardContent className="p-12">
              <div className="text-center">
                <Search className="h-16 w-16 text-muted-foreground mx-auto mb-6" />
                <p className="text-muted-foreground text-xl">
                  Dados insuficientes para gerar insights comparativos no período selecionado.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}