import { useState, useEffect } from "react";
import { TrendingUp, Clock, MapPin, Users, Brain, Activity, BarChart3, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { HorizontalBarChart } from "@/components/dashboard/charts/HorizontalBarChart";
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
  type: 'caps' | 'procedencia' | 'genero' | 'diagnostico' | 'geral' | 'idade';
  priority: 'high' | 'medium' | 'low';
}

interface DiagnosisStats {
  diagnosis: string;
  avgStay: number;
  readmissionRate: number;
  count: number;
  elderlyPercentage: number;
}

interface CapsStats {
  caps: string;
  avgStay: number;
  patientCount: number;
  readmissionRate: number;
}

interface ProcedenciaStats {
  procedencia: string;
  avgStay: number;
  count: number;
  spaPercentage: number;
}

export default function Tendencias() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [insights, setInsights] = useState<Insight[]>([]);
  const [diagnosisStats, setDiagnosisStats] = useState<DiagnosisStats[]>([]);
  const [capsStats, setCapsStats] = useState<CapsStats[]>([]);
  const [procedenciaStats, setProcedenciaStats] = useState<ProcedenciaStats[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchPatients();
  }, []);

  useEffect(() => {
    if (patients.length > 0) {
      generateAnalytics();
    }
  }, [patients]);

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

  const generateAnalytics = () => {
    // 1. Análise por Diagnóstico
    const diagnosisAnalysis = generateDiagnosisAnalysis();
    setDiagnosisStats(diagnosisAnalysis);

    // 2. Análise por CAPS
    const capsAnalysis = generateCapsAnalysis();
    setCapsStats(capsAnalysis);

    // 3. Análise por Procedência
    const procedenciaAnalysis = generateProcedenciaAnalysis();
    setProcedenciaStats(procedenciaAnalysis);

    // 4. Gerar insights principais
    generateKeyInsights(diagnosisAnalysis, capsAnalysis, procedenciaAnalysis);
  };

  const generateDiagnosisAnalysis = (): DiagnosisStats[] => {
    const diagnosisGroups = patients.reduce((acc, p) => {
      if (!p.cid_grupo) return acc;
      if (!acc[p.cid_grupo]) {
        acc[p.cid_grupo] = [];
      }
      acc[p.cid_grupo].push(p);
      return acc;
    }, {} as Record<string, Patient[]>);

    return Object.entries(diagnosisGroups).map(([diagnosis, patientList]) => {
      const avgStay = patientList.reduce((sum, p) => sum + (p.dias_internacao || 0), 0) / patientList.length;
      
      // Calculate readmission rate
      const patientNames = patientList.map(p => p.nome);
      const uniqueNames = new Set(patientNames);
      const readmissionRate = ((patientNames.length - uniqueNames.size) / uniqueNames.size) * 100;

      // Calculate elderly percentage (>60 years)
      const elderlyCount = patientList.filter(p => {
        if (!p.data_nascimento) return false;
        const age = new Date().getFullYear() - new Date(p.data_nascimento).getFullYear();
        return age > 60;
      }).length;
      const elderlyPercentage = (elderlyCount / patientList.length) * 100;

      return {
        diagnosis,
        avgStay,
        readmissionRate,
        count: patientList.length,
        elderlyPercentage
      };
    }).sort((a, b) => b.avgStay - a.avgStay);
  };

  const generateCapsAnalysis = (): CapsStats[] => {
    const capsGroups = patients.reduce((acc, p) => {
      if (!p.caps_referencia) return acc;
      if (!acc[p.caps_referencia]) {
        acc[p.caps_referencia] = [];
      }
      acc[p.caps_referencia].push(p);
      return acc;
    }, {} as Record<string, Patient[]>);

    return Object.entries(capsGroups).map(([caps, patientList]) => {
      const avgStay = patientList.reduce((sum, p) => sum + (p.dias_internacao || 0), 0) / patientList.length;
      
      // Calculate readmission rate
      const patientNames = patientList.map(p => p.nome);
      const uniqueNames = new Set(patientNames);
      const readmissionRate = ((patientNames.length - uniqueNames.size) / uniqueNames.size) * 100;

      return {
        caps,
        avgStay,
        patientCount: patientList.length,
        readmissionRate
      };
    }).sort((a, b) => b.patientCount - a.patientCount);
  };

  const generateProcedenciaAnalysis = (): ProcedenciaStats[] => {
    const procedenciaGroups = patients.reduce((acc, p) => {
      if (!p.procedencia) return acc;
      if (!acc[p.procedencia]) {
        acc[p.procedencia] = [];
      }
      acc[p.procedencia].push(p);
      return acc;
    }, {} as Record<string, Patient[]>);

    return Object.entries(procedenciaGroups).map(([procedencia, patientList]) => {
      const avgStay = patientList.reduce((sum, p) => sum + (p.dias_internacao || 0), 0) / patientList.length;
      
      // Calculate SPA percentage
      const spaCount = patientList.filter(p => 
        p.cid_grupo?.includes('substância') || p.cid_grupo?.includes('SPA')
      ).length;
      const spaPercentage = (spaCount / patientList.length) * 100;

      return {
        procedencia,
        avgStay,
        count: patientList.length,
        spaPercentage
      };
    }).sort((a, b) => b.avgStay - a.avgStay);
  };

  const generateKeyInsights = (diagnosisStats: DiagnosisStats[], capsStats: CapsStats[], procedenciaStats: ProcedenciaStats[]) => {
    const newInsights: Insight[] = [];

    // Top diagnosis with longest stay
    if (diagnosisStats.length > 0) {
      const topDiagnosis = diagnosisStats[0];
      newInsights.push({
        id: 'top-diagnosis-stay',
        title: 'Diagnóstico com Maior Permanência',
        description: `Pacientes com "${topDiagnosis.diagnosis}" apresentam o maior tempo médio de internação na rede.`,
        icon: Brain,
        value: `${topDiagnosis.avgStay.toFixed(1)} dias`,
        type: 'diagnostico',
        priority: 'high'
      });
    }

    // Highest readmission diagnosis
    const highestReadmission = diagnosisStats.sort((a, b) => b.readmissionRate - a.readmissionRate)[0];
    if (highestReadmission && highestReadmission.readmissionRate > 10) {
      newInsights.push({
        id: 'highest-readmission',
        title: 'Diagnóstico com Maior Taxa de Reinternação',
        description: `"${highestReadmission.diagnosis}" apresenta a maior taxa de reinternação, indicando possível necessidade de acompanhamento ambulatorial intensificado.`,
        icon: AlertTriangle,
        value: `${highestReadmission.readmissionRate.toFixed(1)}%`,
        type: 'diagnostico',
        priority: 'high'
      });
    }

    // CAPS with highest stay
    if (capsStats.length > 0) {
      const topCaps = capsStats.sort((a, b) => b.avgStay - a.avgStay)[0];
      newInsights.push({
        id: 'caps-highest-stay',
        title: 'CAPS com Maior Permanência',
        description: `O ${topCaps.caps} apresenta a maior média de permanência, sugerindo casos de maior complexidade clínica.`,
        icon: Clock,
        value: `${topCaps.avgStay.toFixed(1)} dias`,
        type: 'caps',
        priority: 'medium'
      });
    }

    // Procedencia with highest stay
    if (procedenciaStats.length > 0) {
      const topProcedencia = procedenciaStats[0];
      const displayName = topProcedencia.procedencia === "Hospital Wadomiro de Paula – PS" 
        ? "Hospital Planalto – Porta"
        : topProcedencia.procedencia === "Hospital Waldomiro de Paula – Enfermaria"
        ? "Hospital Planalto – Transf Interna"
        : topProcedencia.procedencia;
        
      newInsights.push({
        id: 'procedencia-highest-stay',
        title: 'Procedência com Maior Tempo de Internação',
        description: `Pacientes provenientes do ${displayName} têm maior tempo médio de internação, indicando maior gravidade dos casos encaminhados.`,
        icon: MapPin,
        value: `${topProcedencia.avgStay.toFixed(1)} dias`,
        type: 'procedencia',
        priority: 'medium'
      });
    }

    // Age analysis
    const elderlyPatients = patients.filter(p => {
      if (!p.data_nascimento) return false;
      const age = new Date().getFullYear() - new Date(p.data_nascimento).getFullYear();
      return age > 60;
    });
    
    if (elderlyPatients.length > 0) {
      const elderlyAvgStay = elderlyPatients.reduce((sum, p) => sum + (p.dias_internacao || 0), 0) / elderlyPatients.length;
      const elderlyPercentage = (elderlyPatients.length / patients.length) * 100;
      
      newInsights.push({
        id: 'elderly-analysis',
        title: 'Perfil Etário de Maior Permanência',
        description: `Pacientes acima de 60 anos representam ${elderlyPercentage.toFixed(1)}% dos casos e têm permanência média elevada.`,
        icon: Users,
        value: `${elderlyAvgStay.toFixed(1)} dias`,
        type: 'idade',
        priority: 'medium'
      });
    }

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

  const getTopDiagnosisChart = () => {
    return diagnosisStats.slice(0, 5).map((stat, index) => ({
      name: stat.diagnosis.length > 30 ? stat.diagnosis.substring(0, 30) + "..." : stat.diagnosis,
      value: Math.round(stat.avgStay),
      percentage: Math.round(stat.avgStay),
      color: `hsl(var(--chart-${index + 1}))`
    }));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Tendências e Insights</h1>
        <p className="text-muted-foreground">Análises clínicas automáticas extraídas dos dados assistenciais</p>
      </div>

      {/* Key Insights Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {insights.map((insight) => (
          <Card key={insight.id} className={`shadow-medium hover:shadow-soft transition-shadow ${
            insight.priority === 'high' ? 'border-destructive/30 bg-destructive/5' : 
            insight.priority === 'medium' ? 'border-warning/30 bg-warning/5' : ''
          }`}>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${
                  insight.priority === 'high' ? 'bg-destructive/20' :
                  insight.priority === 'medium' ? 'bg-warning/20' :
                  'bg-gradient-primary'
                }`}>
                  <insight.icon className={`h-5 w-5 ${
                    insight.priority === 'high' ? 'text-destructive' :
                    insight.priority === 'medium' ? 'text-warning' :
                    'text-white'
                  }`} />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-base font-semibold">
                    {insight.title}
                  </CardTitle>
                  {insight.priority === 'high' && (
                    <Badge variant="destructive" className="text-xs mt-1">Atenção</Badge>
                  )}
                </div>
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

      {/* Charts and Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Diagnoses by Stay Duration */}
        <Card className="shadow-medium">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Top 5 Diagnósticos - Tempo Médio de Permanência
            </CardTitle>
          </CardHeader>
          <CardContent>
            <HorizontalBarChart
              data={getTopDiagnosisChart()}
              title=""
              description="Dias de internação por diagnóstico"
            />
          </CardContent>
        </Card>

        {/* CAPS Analysis Table */}
        <Card className="shadow-medium">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              CAPS - Análise Comparativa
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>CAPS</TableHead>
                  <TableHead className="text-right">Pacientes</TableHead>
                  <TableHead className="text-right">Permanência Média</TableHead>
                  <TableHead className="text-right">Taxa Reinternação</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {capsStats.slice(0, 5).map((caps) => (
                  <TableRow key={caps.caps}>
                    <TableCell className="font-medium text-sm">
                      {caps.caps.length > 20 ? caps.caps.substring(0, 20) + "..." : caps.caps}
                    </TableCell>
                    <TableCell className="text-right">{caps.patientCount}</TableCell>
                    <TableCell className="text-right">
                      <Badge variant="outline">{caps.avgStay.toFixed(1)} dias</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge variant={caps.readmissionRate > 15 ? "destructive" : "secondary"}>
                        {caps.readmissionRate.toFixed(1)}%
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analysis Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Diagnosis Analysis */}
        <Card className="shadow-medium">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              Análise por Diagnóstico
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Diagnóstico</TableHead>
                  <TableHead className="text-right">Casos</TableHead>
                  <TableHead className="text-right">Permanência</TableHead>
                  <TableHead className="text-right">Idosos (%)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {diagnosisStats.slice(0, 6).map((diag) => (
                  <TableRow key={diag.diagnosis}>
                    <TableCell className="font-medium text-sm">
                      {diag.diagnosis.length > 25 ? diag.diagnosis.substring(0, 25) + "..." : diag.diagnosis}
                    </TableCell>
                    <TableCell className="text-right">{diag.count}</TableCell>
                    <TableCell className="text-right">
                      <Badge variant="outline">{diag.avgStay.toFixed(1)} dias</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge variant={diag.elderlyPercentage > 30 ? "secondary" : "outline"}>
                        {diag.elderlyPercentage.toFixed(0)}%
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Procedencia Analysis */}
        <Card className="shadow-medium">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              Procedência × Perfil de Gravidade
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Procedência</TableHead>
                  <TableHead className="text-right">Casos</TableHead>
                  <TableHead className="text-right">Permanência</TableHead>
                  <TableHead className="text-right">SPA (%)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {procedenciaStats.map((proc) => {
                  const displayName = proc.procedencia === "Hospital Wadomiro de Paula – PS" 
                    ? "Hospital Planalto – Porta"
                    : proc.procedencia === "Hospital Waldomiro de Paula – Enfermaria"
                    ? "Hospital Planalto – Transf Interna"
                    : proc.procedencia;
                    
                  return (
                    <TableRow key={proc.procedencia}>
                      <TableCell className="font-medium text-sm">
                        {displayName.length > 25 ? displayName.substring(0, 25) + "..." : displayName}
                      </TableCell>
                      <TableCell className="text-right">{proc.count}</TableCell>
                      <TableCell className="text-right">
                        <Badge variant="outline">{proc.avgStay.toFixed(1)} dias</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge variant={proc.spaPercentage > 20 ? "destructive" : "secondary"}>
                          {proc.spaPercentage.toFixed(0)}%
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}