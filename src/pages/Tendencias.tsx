import { useState, useEffect } from "react";
import { TrendingUp, Clock, MapPin, Users, Brain, Activity } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
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
}

interface Insight {
  id: string;
  title: string;
  description: string;
  icon: any;
  value: string;
  type: 'caps' | 'procedencia' | 'genero' | 'diagnostico' | 'geral';
}

export default function Tendencias() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDiagnosis, setSelectedDiagnosis] = useState<string>("");
  const [availableDiagnoses, setAvailableDiagnoses] = useState<string[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchPatients();
  }, []);

  useEffect(() => {
    if (patients.length > 0) {
      generateInsights();
    }
  }, [patients, selectedDiagnosis]);

  const fetchPatients = async () => {
    try {
      const { data, error } = await supabase
        .from('pacientes_planalto')
        .select('*');

      if (error) throw error;

      setPatients(data || []);
      
      // Extract unique diagnoses
      const uniqueDiagnoses = [...new Set(data?.map(p => p.cid_grupo).filter(Boolean))];
      setAvailableDiagnoses(uniqueDiagnoses);
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
    const filteredPatients = selectedDiagnosis 
      ? patients.filter(p => p.cid_grupo === selectedDiagnosis)
      : patients;

    const newInsights: Insight[] = [];

    // CAPS com maior média de permanência
    const capsPermanencia = filteredPatients.reduce((acc, p) => {
      if (!p.caps_referencia || !p.dias_internacao) return acc;
      if (!acc[p.caps_referencia]) {
        acc[p.caps_referencia] = { total: 0, count: 0 };
      }
      acc[p.caps_referencia].total += p.dias_internacao;
      acc[p.caps_referencia].count += 1;
      return acc;
    }, {} as Record<string, { total: number; count: number }>);

    const capsMedias = Object.entries(capsPermanencia)
      .map(([caps, data]) => ({ caps, media: data.total / data.count }))
      .sort((a, b) => b.media - a.media);

    if (capsMedias.length > 0) {
      newInsights.push({
        id: 'caps-permanencia',
        title: 'CAPS com Maior Permanência',
        description: `O CAPS ${capsMedias[0].caps} apresenta a maior média de permanência.`,
        icon: Clock,
        value: `${capsMedias[0].media.toFixed(1)} dias`,
        type: 'caps'
      });
    }

    // Procedência com maior tempo médio
    const procedenciaTempo = filteredPatients.reduce((acc, p) => {
      if (!p.procedencia || !p.dias_internacao) return acc;
      if (!acc[p.procedencia]) {
        acc[p.procedencia] = { total: 0, count: 0 };
      }
      acc[p.procedencia].total += p.dias_internacao;
      acc[p.procedencia].count += 1;
      return acc;
    }, {} as Record<string, { total: number; count: number }>);

    const procedenciaMedias = Object.entries(procedenciaTempo)
      .map(([proc, data]) => ({ proc, media: data.total / data.count }))
      .sort((a, b) => b.media - a.media);

    if (procedenciaMedias.length > 0) {
      const procName = procedenciaMedias[0].proc === "Hospital Wadomiro de Paula – PS" 
        ? "Hospital Planalto – Porta"
        : procedenciaMedias[0].proc === "Hospital Waldomiro de Paula – Enfermaria"
        ? "Hospital Planalto – Transf Interna"
        : procedenciaMedias[0].proc;

      newInsights.push({
        id: 'procedencia-tempo',
        title: 'Procedência com Maior Tempo de Internação',
        description: `Pacientes provenientes do ${procName} têm maior tempo médio de internação.`,
        icon: MapPin,
        value: `${procedenciaMedias[0].media.toFixed(1)} dias`,
        type: 'procedencia'
      });
    }

    // Análise por gênero
    const generoDistribuicao = filteredPatients.reduce((acc, p) => {
      const genero = p.genero === 'MASC' ? 'Masculino' : p.genero === 'FEM' ? 'Feminino' : 'Outros';
      acc[genero] = (acc[genero] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const generoMaioria = Object.entries(generoDistribuicao)
      .sort(([,a], [,b]) => b - a)[0];

    if (generoMaioria) {
      const porcentagem = ((generoMaioria[1] / filteredPatients.length) * 100).toFixed(1);
      newInsights.push({
        id: 'genero-distribuicao',
        title: 'Distribuição por Gênero',
        description: `A maioria dos pacientes é do sexo ${generoMaioria[0].toLowerCase()}.`,
        icon: Users,
        value: `${porcentagem}%`,
        type: 'genero'
      });
    }

    // Diagnóstico com maior permanência (apenas se não houver filtro de diagnóstico)
    if (!selectedDiagnosis) {
      const diagnosticoPermanencia = patients.reduce((acc, p) => {
        if (!p.cid_grupo || !p.dias_internacao) return acc;
        if (!acc[p.cid_grupo]) {
          acc[p.cid_grupo] = { total: 0, count: 0 };
        }
        acc[p.cid_grupo].total += p.dias_internacao;
        acc[p.cid_grupo].count += 1;
        return acc;
      }, {} as Record<string, { total: number; count: number }>);

      const diagnosticoMedias = Object.entries(diagnosticoPermanencia)
        .map(([diag, data]) => ({ diag, media: data.total / data.count }))
        .sort((a, b) => b.media - a.media);

      if (diagnosticoMedias.length > 0) {
        let diagName = diagnosticoMedias[0].diag;
        if (diagName === 'Espectro da Esquizofrenia e Transtornos Psicóticos') {
          diagName = 'Esquizofrenia e outros transtornos psicóticos';
        }

        newInsights.push({
          id: 'diagnostico-permanencia',
          title: 'Diagnóstico com Maior Permanência',
          description: `A média de permanência associada ao diagnóstico "${diagName}" é a mais longa.`,
          icon: Brain,
          value: `${diagnosticoMedias[0].media.toFixed(1)} dias`,
          type: 'diagnostico'
        });
      }
    }

    // Insight de readmissões
    const pacientesNomes = filteredPatients.map(p => p.nome);
    const nomesUnicos = new Set(pacientesNomes);
    const readmissoes = pacientesNomes.length - nomesUnicos.size;
    const taxaReadmissao = ((readmissoes / nomesUnicos.size) * 100).toFixed(1);

    newInsights.push({
      id: 'readmissoes',
      title: 'Taxa de Readmissão',
      description: `${readmissoes} pacientes apresentaram múltiplas internações no período analisado.`,
      icon: Activity,
      value: `${taxaReadmissao}%`,
      type: 'geral'
    });

    setInsights(newInsights);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando insights...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Tendências e Insights</h1>
        <p className="text-muted-foreground">Análises automáticas extraídas dos dados clínicos</p>
      </div>

      {/* Filtro por Diagnóstico */}
      <Card className="shadow-medium">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <TrendingUp className="h-5 w-5 text-primary" />
            Filtro de Análise
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-w-md">
            <Label htmlFor="diagnosis-select" className="text-sm font-medium">
              Filtrar por Diagnóstico
            </Label>
            <Select
              value={selectedDiagnosis || "all"}
              onValueChange={(value) => setSelectedDiagnosis(value === "all" ? "" : value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Todos os diagnósticos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os diagnósticos</SelectItem>
                {availableDiagnoses.map((diagnosis) => (
                  <SelectItem key={diagnosis} value={diagnosis}>
                    {diagnosis}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Insights Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {insights.map((insight) => (
          <Card key={insight.id} className="shadow-medium hover:shadow-soft transition-shadow">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-primary rounded-lg">
                  <insight.icon className="h-5 w-5 text-white" />
                </div>
                <CardTitle className="text-base font-semibold">
                  {insight.title}
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">
                {insight.description}
              </p>
              <div className="text-2xl font-bold text-primary">
                {insight.value}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedDiagnosis && (
        <Card className="shadow-medium bg-accent/20 border-accent">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Brain className="h-4 w-4" />
              <span>Análise filtrada para: <strong>{selectedDiagnosis}</strong></span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}