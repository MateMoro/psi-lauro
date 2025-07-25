import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { TrendingUp, Calendar, Clock, Activity } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface TrendData {
  period: string;
  avgStayDays: number;
  totalPatients: number;
  readmissions: number;
}

interface PatientData {
  data_admissao: string;
  data_alta?: string;
  dias_internacao: number;
  caps_referencia: string;
  cid_grupo: string;
  nome: string;
}

export default function Tendencias() {
  const [trendData, setTrendData] = useState<TrendData[]>([]);
  const [capsTrends, setCapsTrends] = useState<Array<{name: string, avgStay: number, patients: number}>>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchTrendData();
  }, []);

  const fetchTrendData = async () => {
    try {
      const { data, error } = await supabase
        .from('pacientes_planalto')
        .select('*')
        .order('data_admissao');

      if (error) throw error;

      if (!data || data.length === 0) {
        setLoading(false);
        return;
      }

      // Group data by month/year
      const monthlyData = data.reduce((acc, patient: PatientData) => {
        if (!patient.data_admissao) return acc;
        
        const date = new Date(patient.data_admissao);
        const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        
        if (!acc[monthYear]) {
          acc[monthYear] = {
            patients: [],
            names: new Set<string>()
          };
        }
        
        acc[monthYear].patients.push(patient);
        acc[monthYear].names.add(patient.nome);
        
        return acc;
      }, {} as Record<string, { patients: PatientData[], names: Set<string> }>);

      // Calculate trends
      const trends: TrendData[] = Object.entries(monthlyData)
        .map(([period, data]) => {
          const avgStayDays = data.patients.reduce((sum, p) => 
            sum + (p.dias_internacao || 0), 0) / data.patients.length || 0;
          
          const readmissions = data.patients.length - data.names.size;
          
          return {
            period: new Date(period).toLocaleDateString('pt-BR', { 
              year: 'numeric', 
              month: 'short' 
            }),
            avgStayDays: Number(avgStayDays.toFixed(1)),
            totalPatients: data.patients.length,
            readmissions
          };
        })
        .sort((a, b) => a.period.localeCompare(b.period));

      setTrendData(trends);

      // Calculate CAPS trends
      const capsData = data.reduce((acc, patient: PatientData) => {
        const caps = patient.caps_referencia || 'Não informado';
        
        if (!acc[caps]) {
          acc[caps] = {
            totalStayDays: 0,
            totalPatients: 0
          };
        }
        
        acc[caps].totalStayDays += patient.dias_internacao || 0;
        acc[caps].totalPatients += 1;
        
        return acc;
      }, {} as Record<string, { totalStayDays: number, totalPatients: number }>);

      const capsAnalysis = Object.entries(capsData)
        .map(([name, data]) => ({
          name,
          avgStay: Number((data.totalStayDays / data.totalPatients).toFixed(1)),
          patients: data.totalPatients
        }))
        .sort((a, b) => b.patients - a.patients)
        .slice(0, 8);

      setCapsTrends(capsAnalysis);

    } catch (error) {
      console.error('Erro ao buscar dados de tendências:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados de tendências.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando análise de tendências...</p>
        </div>
      </div>
    );
  }

  if (trendData.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <TrendingUp className="h-8 w-8 text-primary" />
            Tendências
          </h1>
          <p className="text-muted-foreground">Análise temporal e tendências</p>
        </div>
        
        <Card className="shadow-medium">
          <CardContent className="py-12">
            <div className="text-center">
              <Activity className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Dados Insuficientes para Análise de Tendências
              </h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                Não há dados suficientes distribuídos ao longo do tempo para gerar 
                análises significativas de tendências. Esta funcionalidade ficará 
                disponível quando houver mais dados históricos.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
          <TrendingUp className="h-8 w-8 text-primary" />
          Tendências
        </h1>
        <p className="text-muted-foreground">
          Análise temporal e identificação de padrões
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="shadow-medium">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Períodos Analisados
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {trendData.length}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-medium">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Tendência Geral
                </p>
                <p className="text-2xl font-bold text-chart-2">
                  {trendData.length >= 2 
                    ? trendData[trendData.length - 1].avgStayDays > trendData[0].avgStayDays 
                      ? "↗ Crescente" 
                      : "↘ Decrescente"
                    : "Estável"
                  }
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-chart-2" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-medium">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Variação Máxima
                </p>
                <p className="text-2xl font-bold text-chart-3">
                  {Math.max(...trendData.map(d => d.avgStayDays)) - 
                   Math.min(...trendData.map(d => d.avgStayDays))} dias
                </p>
              </div>
              <Clock className="h-8 w-8 text-chart-3" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Time Series Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-medium">
          <CardHeader>
            <CardTitle>Tempo Médio de Internação ao Longo do Tempo</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="period" 
                  tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                />
                <YAxis 
                  tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                />
                <Tooltip 
                  formatter={(value) => [`${value} dias`, 'Tempo Médio']}
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="avgStayDays" 
                  stroke="hsl(var(--chart-1))" 
                  strokeWidth={2}
                  dot={{ fill: 'hsl(var(--chart-1))', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="shadow-medium">
          <CardHeader>
            <CardTitle>Volume de Pacientes por Período</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="period" 
                  tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                />
                <YAxis 
                  tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                />
                <Tooltip 
                  formatter={(value) => [value, 'Pacientes']}
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}
                />
                <Bar 
                  dataKey="totalPatients" 
                  fill="hsl(var(--chart-2))" 
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* CAPS Analysis */}
      <Card className="shadow-medium">
        <CardHeader>
          <CardTitle>Tempo Médio de Internação por CAPS</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={capsTrends} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                type="number" 
                tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
              />
              <YAxis 
                type="category" 
                dataKey="name" 
                tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                width={120}
              />
              <Tooltip 
                formatter={(value) => [`${value} dias`, 'Tempo Médio']}
                labelFormatter={(label) => `CAPS: ${label}`}
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  fontSize: '12px'
                }}
              />
              <Bar 
                dataKey="avgStay" 
                fill="hsl(var(--chart-4))" 
                radius={[0, 4, 4, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}