import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Brain, TrendingUp } from "lucide-react";

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

  // Calculate insights based on patient data
  const generateInsights = () => {
    if (patients.length === 0) return [];
    
    const insights = [];

    // 1. Average stay by race and diagnosis comparison
    const psychosisPatients = patients.filter(p => 
      p.cid_grupo?.toLowerCase().includes('psicose') || 
      p.cid_grupo?.toLowerCase().includes('psicótica') ||
      p.cid_grupo?.toLowerCase().includes('esquizofrenia')
    );
    
    if (psychosisPatients.length > 0) {
      const maleStats = psychosisPatients
        .filter(p => p.genero === 'MASC')
        .reduce((acc, p) => {
          const race = p.raca_cor || 'Não informado';
          if (!acc[race]) acc[race] = { total: 0, count: 0 };
          acc[race].total += p.dias_internacao || 0;
          acc[race].count += 1;
          return acc;
        }, {} as Record<string, { total: number; count: number }>);

      const pardoAvg = maleStats['PARDA'] ? (maleStats['PARDA'].total / maleStats['PARDA'].count).toFixed(1) : '0';
      const brancaAvg = maleStats['BRANCA'] ? (maleStats['BRANCA'].total / maleStats['BRANCA'].count).toFixed(1) : '0';
      
      if (maleStats['PARDA']?.count > 0 && maleStats['BRANCA']?.count > 0) {
        insights.push(`Homens pardos com diagnóstico de psicose apresentam maior tempo médio de internação (${pardoAvg} dias) do que homens brancos com o mesmo diagnóstico (${brancaAvg} dias), sugerindo possível diferença na gravidade da crise ou acesso prévio ao cuidado.`);
      }
    }

    // 2. Readmission rates by CAPS
    const capsList = [...new Set(patients.map(p => p.caps_referencia).filter(Boolean))];
    capsList.forEach(caps => {
      const capsPatients = patients.filter(p => p.caps_referencia === caps);
      const patientGroups = capsPatients.reduce((acc, patient) => {
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

      const readmissionRate = capsPatients.length > 0 ? ((readmissions7Days / capsPatients.length) * 100).toFixed(1) : '0.0';
      if (Number(readmissionRate) > 5) {
        insights.push(`O ${caps} apresenta taxa de reinternação precoce (≤ 7 dias) de ${readmissionRate}%, acima da média institucional, indicando fragilidade na articulação pós-alta ou menor retaguarda territorial.`);
      }
    });

    // 3. Average stay by origin
    const psPatients = patients.filter(p => p.procedencia?.toLowerCase().includes('pronto socorro') || p.procedencia?.toLowerCase().includes('ps'));
    const ubsPatients = patients.filter(p => p.procedencia?.toLowerCase().includes('ubs') || p.procedencia?.toLowerCase().includes('unidade básica'));
    
    if (psPatients.length > 0 && ubsPatients.length > 0) {
      const psAvg = (psPatients.reduce((acc, p) => acc + (p.dias_internacao || 0), 0) / psPatients.length).toFixed(1);
      const ubsAvg = (ubsPatients.reduce((acc, p) => acc + (p.dias_internacao || 0), 0) / ubsPatients.length).toFixed(1);
      const difference = (Number(psAvg) - Number(ubsAvg)).toFixed(1);
      
      if (Number(difference) > 0) {
        insights.push(`Pacientes encaminhados de Pronto Socorro permanecem internados em média ${difference} dias a mais que os oriundos de UBS, o que pode refletir diferentes níveis de complexidade clínica ou dificuldade de estabilização prévia.`);
      }
    }

    // 4. Gender and race comparison for depression
    const depressionPatients = patients.filter(p => 
      p.cid_grupo?.toLowerCase().includes('depressão') || 
      p.cid_grupo?.toLowerCase().includes('depressiv') ||
      p.cid_grupo?.toLowerCase().includes('humor')
    );
    
    if (depressionPatients.length > 0) {
      const femaleBlackAvg = depressionPatients
        .filter(p => p.genero === 'FEM' && p.raca_cor === 'PRETA')
        .reduce((acc, p, _, arr) => acc + (p.dias_internacao || 0) / arr.length, 0);
      
      const femaleWhiteAvg = depressionPatients
        .filter(p => p.genero === 'FEM' && p.raca_cor === 'BRANCA')
        .reduce((acc, p, _, arr) => acc + (p.dias_internacao || 0) / arr.length, 0);

      if (femaleBlackAvg > 0 && femaleWhiteAvg > 0 && femaleBlackAvg > femaleWhiteAvg) {
        insights.push(`Mulheres pretas com diagnóstico de transtorno depressivo têm tempo médio de permanência maior (${femaleBlackAvg.toFixed(1)} dias) do que mulheres brancas com o mesmo diagnóstico (${femaleWhiteAvg.toFixed(1)} dias), sugerindo possíveis diferenças no acesso ao cuidado ambulatorial ou maior severidade clínica.`);
      }
    }

    // 5. Young patients with bipolar disorder
    const bipolarPatients = patients.filter(p => 
      p.cid_grupo?.toLowerCase().includes('bipolar') || 
      p.cid_grupo?.toLowerCase().includes('maníaco')
    );
    
    const youngBipolar = bipolarPatients.filter(p => {
      if (!p.data_nascimento) return false;
      const age = new Date().getFullYear() - new Date(p.data_nascimento).getFullYear();
      return age < 30;
    });

    if (youngBipolar.length > 0) {
      // Calculate readmission rate for young bipolar patients
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

      const readmissionRate = ((readmissions / youngBipolar.length) * 100).toFixed(1);
      if (Number(readmissionRate) > 15) {
        insights.push(`Pacientes jovens (<30 anos) com transtorno bipolar apresentam alta taxa de reinternação precoce (${readmissionRate}%), levantando hipótese de baixa adesão ao tratamento ou dificuldades no cuidado compartilhado com a RAPS.`);
      }
    }

    // 6. CAPS comparison
    const capsAvgStay = capsList.map(caps => {
      const capsPatients = patients.filter(p => p.caps_referencia === caps);
      const avg = capsPatients.length > 0 ? 
        (capsPatients.reduce((acc, p) => acc + (p.dias_internacao || 0), 0) / capsPatients.length).toFixed(1) : '0';
      return { caps, avg: Number(avg) };
    }).sort((a, b) => b.avg - a.avg);

    if (capsAvgStay.length >= 2) {
      const highest = capsAvgStay[0];
      const lowest = capsAvgStay[capsAvgStay.length - 1];
      if (highest.avg > lowest.avg + 3) {
        insights.push(`O tempo médio de internação é maior entre os pacientes do ${highest.caps} (${highest.avg} dias) comparado ao ${lowest.caps} (${lowest.avg} dias), possivelmente associado a diferenças nos recursos de apoio ou gravidade dos quadros clínicos.`);
      }
    }

    // 7. Substance use disorders readmission
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

      const readmissionRate = ((readmissions15Days / substancePatients.length) * 100).toFixed(1);
      if (Number(readmissionRate) > 10) {
        insights.push(`A taxa de reinternação ≤ 15 dias é mais elevada entre pacientes com transtornos por uso de substâncias (${readmissionRate}%), reforçando a importância de articulação mais robusta com serviços de reabilitação psicossocial.`);
      }
    }

    // 8. Psychotic vs depressive disorders comparison
    const psychoticAvgStay = psychosisPatients.length > 0 ? 
      (psychosisPatients.reduce((acc, p) => acc + (p.dias_internacao || 0), 0) / psychosisPatients.length).toFixed(1) : '0';
    
    const depressiveAvgStay = depressionPatients.length > 0 ? 
      (depressionPatients.reduce((acc, p) => acc + (p.dias_internacao || 0), 0) / depressionPatients.length).toFixed(1) : '0';

    if (Number(psychoticAvgStay) > Number(depressiveAvgStay) + 5) {
      insights.push(`Pacientes diagnosticados com transtornos psicóticos têm maior tempo médio de permanência hospitalar (${psychoticAvgStay} dias) do que aqueles com transtornos depressivos (${depressiveAvgStay} dias), refletindo maior complexidade clínica e necessidade de estabilização prolongada.`);
    }

    return insights;
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
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl md:text-3xl font-bold text-primary flex items-center justify-center gap-2">
          <Brain className="h-8 w-8" />
          Frases Interpretativas (Insights Automáticos)
        </h1>
        <p className="text-muted-foreground">
          Análises clínico-demográficas baseadas nos dados de internação psiquiátrica
        </p>
      </div>

      {/* Insights Section */}
      <div className="space-y-4">
        {insights.map((insight, index) => (
          <Card key={index} className="shadow-lg border border-border/50 hover:shadow-xl transition-shadow duration-300">
            <CardContent className="p-6">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center mt-1">
                  <TrendingUp className="h-3 w-3 text-primary" />
                </div>
                <p className="text-sm text-foreground leading-relaxed font-medium">
                  {insight}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {insights.length === 0 && (
          <Card className="shadow-lg border border-border/50">
            <CardContent className="p-6">
              <div className="text-center">
                <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground italic">
                  Nenhum insight automático disponível com os dados atuais. 
                  Os insights são gerados quando há dados suficientes para análises comparativas.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Summary Card */}
      <Card className="shadow-medium bg-muted/30">
        <CardHeader>
          <CardTitle className="text-primary flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Resumo dos Dados
          </CardTitle>
          <CardDescription>
            Informações gerais sobre a base de dados analisada
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div className="p-4 bg-background rounded-lg border">
              <p className="text-2xl font-bold text-primary">{patients.length}</p>
              <p className="text-sm text-muted-foreground">Total de Pacientes</p>
            </div>
            <div className="p-4 bg-background rounded-lg border">
              <p className="text-2xl font-bold text-primary">
                {[...new Set(patients.map(p => p.caps_referencia).filter(Boolean))].length}
              </p>
              <p className="text-sm text-muted-foreground">CAPS Analisados</p>
            </div>
            <div className="p-4 bg-background rounded-lg border">
              <p className="text-2xl font-bold text-primary">
                {[...new Set(patients.map(p => p.cid_grupo).filter(Boolean))].length}
              </p>
              <p className="text-sm text-muted-foreground">Diagnósticos Únicos</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Technical Note */}
      <Card className="shadow-sm border-primary/20">
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground text-center">
            <strong>Nota Técnica:</strong> Esta seção serve para subsidiar reuniões clínicas, análise gerencial e discussão com a rede de atenção psicossocial. 
            Os insights são gerados automaticamente com base nos dados disponíveis e devem ser interpretados considerando o contexto clínico e territorial específico.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}