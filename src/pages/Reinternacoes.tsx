import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { RefreshCw, Calendar, MapPin, User, Filter } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ReadmissionMetrics } from "@/components/dashboard/ReadmissionMetrics";

interface PatientAdmission {
  nome: string;
  caps_referencia: string;
  data_admissao: string;
  data_alta?: string;
  cid_grupo: string;
  genero: string;
}

interface ReadmissionPatient {
  nome: string;
  totalAdmissions: number;
  admissions: PatientAdmission[];
  averageInterval: number;
}

export default function Reinternacoes() {
  const [readmissions, setReadmissions] = useState<ReadmissionPatient[]>([]);
  const [filteredReadmissions, setFilteredReadmissions] = useState<ReadmissionPatient[]>([]);
  const [loading, setLoading] = useState(true);
  const [intervalFilter, setIntervalFilter] = useState<string>("all");
  const { toast } = useToast();

  useEffect(() => {
    fetchReadmissions();
  }, []);

  useEffect(() => {
    applyIntervalFilter();
  }, [readmissions, intervalFilter]);

  const fetchReadmissions = async () => {
    try {
      const { data, error } = await supabase
        .from('pacientes_planalto')
        .select('*')
        .order('nome, data_admissao');

      if (error) throw error;

      // Group by patient name and identify readmissions
      const patientGroups = (data || []).reduce((acc, patient) => {
        const name = patient.nome;
        if (!acc[name]) {
          acc[name] = [];
        }
        acc[name].push({
          nome: patient.nome,
          caps_referencia: patient.caps_referencia,
          data_admissao: patient.data_admissao,
          data_alta: patient.data_alta,
          cid_grupo: patient.cid_grupo,
          genero: patient.genero,
        });
        return acc;
      }, {} as Record<string, PatientAdmission[]>);

      // Filter patients with multiple admissions and calculate intervals
      const readmissionData: ReadmissionPatient[] = Object.entries(patientGroups)
        .filter(([, admissions]) => admissions.length > 1)
        .map(([name, admissions]) => {
          // Sort admissions by date
          const sortedAdmissions = admissions.sort((a, b) => 
            new Date(a.data_admissao).getTime() - new Date(b.data_admissao).getTime()
          );

           // Calculate intervals between admissions - corrected logic
           const intervals: number[] = [];
           for (let i = 1; i < sortedAdmissions.length; i++) {
             const prevDischarge = sortedAdmissions[i - 1].data_alta;
             const currentAdmission = sortedAdmissions[i].data_admissao;
             
             if (prevDischarge && currentAdmission) {
               const prevDischargeDate = new Date(prevDischarge);
               const currentAdmissionDate = new Date(currentAdmission);
               
               // Ensure we have valid dates and current admission is after previous discharge
               if (prevDischargeDate <= currentAdmissionDate) {
                 const interval = Math.floor(
                   (currentAdmissionDate.getTime() - prevDischargeDate.getTime()) / 
                   (1000 * 60 * 60 * 24)
                 );
                 if (interval >= 0) {
                   intervals.push(interval);
                 }
               }
             }
           }

          const averageInterval = intervals.length > 0 
            ? intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length 
            : 0;

          return {
            nome: name,
            totalAdmissions: sortedAdmissions.length,
            admissions: sortedAdmissions,
            averageInterval: Math.round(averageInterval),
          };
        })
        .sort((a, b) => b.totalAdmissions - a.totalAdmissions);

      setReadmissions(readmissionData);
    } catch (error) {
      console.error('Erro ao buscar reinternações:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados de reinternações.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const applyIntervalFilter = () => {
    if (intervalFilter === "all") {
      setFilteredReadmissions(readmissions);
      return;
    }

    const filtered = readmissions.filter(patient => {
      switch (intervalFilter) {
        case "7":
          return patient.averageInterval <= 7;
        case "15":
          return patient.averageInterval <= 15;
        case "30":
          return patient.averageInterval <= 30;
        case "30+":
          return patient.averageInterval > 30;
        default:
          return true;
      }
    });

    setFilteredReadmissions(filtered);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("pt-BR");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando dados de reinternações...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
          <RefreshCw className="h-8 w-8 text-primary" />
          Reinternações
        </h1>
        <p className="text-muted-foreground">
          Análise de pacientes com múltiplas internações
        </p>
      </div>

      {/* Filter Section */}
      <Card className="shadow-medium">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Filter className="h-5 w-5 text-primary" />
            Filtro por Intervalo de Reinternação
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-w-md">
            <Label htmlFor="interval-select" className="text-sm font-medium">
              Intervalo entre internações
            </Label>
            <Select
              value={intervalFilter}
              onValueChange={(value) => setIntervalFilter(value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Todos os intervalos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os intervalos</SelectItem>
                <SelectItem value="7">Até 7 dias</SelectItem>
                <SelectItem value="15">Até 15 dias</SelectItem>
                <SelectItem value="30">Até 30 dias</SelectItem>
                <SelectItem value="30+">Acima de 30 dias</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="shadow-medium">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total de Pacientes Reinternados
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {filteredReadmissions.length}
                </p>
              </div>
              <User className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-medium">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total de Readmissões
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {filteredReadmissions.reduce((sum, p) => sum + p.totalAdmissions, 0)}
                </p>
              </div>
              <RefreshCw className="h-8 w-8 text-chart-3" />
            </div>
          </CardContent>
        </Card>

      </div>

      {/* Readmission Metrics */}
      <ReadmissionMetrics />

      {/* Readmissions Table */}
      <Card className="shadow-medium">
        <CardHeader>
          <CardTitle>Pacientes com Múltiplas Internações</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredReadmissions.length === 0 ? (
            <div className="text-center py-8">
              <RefreshCw className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Nenhuma reinternação encontrada</p>
            </div>
          ) : (
            <div className="space-y-6">
              {filteredReadmissions.map((patient, index) => (
                <div key={index} className="border border-border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <User className="h-5 w-5 text-primary" />
                      <h3 className="text-lg font-semibold">{patient.nome}</h3>
                      <Badge variant="secondary">
                        {patient.totalAdmissions} internações
                      </Badge>
                      {patient.averageInterval > 0 && (
                        <Badge variant="outline">
                          Intervalo médio: {patient.averageInterval} dias
                        </Badge>
                      )}
                    </div>
                    <Badge 
                      variant={patient.admissions[0]?.genero === 'MASC' ? 'default' : patient.admissions[0]?.genero === 'FEM' ? 'secondary' : 'outline'}
                    >
                      {patient.admissions[0]?.genero === 'MASC' ? 'Masculino' : patient.admissions[0]?.genero === 'FEM' ? 'Feminino' : 'Outros'}
                    </Badge>
                  </div>

                  <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">
                        {patient.admissions[0]?.cid_grupo || 'N/A'}
                      </Badge>
                      <span className="text-sm text-muted-foreground">Diagnóstico</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{patient.admissions[0]?.caps_referencia || 'N/A'}</span>
                    </div>
                  </div>

                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Internação</TableHead>
                        <TableHead>Data Admissão</TableHead>
                        <TableHead>Data Alta</TableHead>
                        <TableHead>Duração</TableHead>
                        <TableHead>Intervalo</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {patient.admissions.map((admission, admissionIndex) => {
                        const prevAdmission = patient.admissions[admissionIndex - 1];
                       let interval = null;
                       if (prevAdmission?.data_alta && admission.data_admissao) {
                         const prevDischargeDate = new Date(prevAdmission.data_alta);
                         const currentAdmissionDate = new Date(admission.data_admissao);
                         
                         if (prevDischargeDate <= currentAdmissionDate) {
                           interval = Math.floor(
                             (currentAdmissionDate.getTime() - prevDischargeDate.getTime()) / 
                             (1000 * 60 * 60 * 24)
                           );
                           if (interval < 0) interval = null;
                         }
                       }

                        const duration = admission.data_alta && admission.data_admissao
                          ? Math.floor(
                              (new Date(admission.data_alta).getTime() - 
                               new Date(admission.data_admissao).getTime()) / 
                              (1000 * 60 * 60 * 24)
                            )
                          : null;

                        return (
                          <TableRow key={admissionIndex}>
                            <TableCell className="font-medium">
                              {admissionIndex + 1}ª internação
                            </TableCell>
                            <TableCell className="font-medium">
                              {formatDate(admission.data_admissao)}
                            </TableCell>
                            <TableCell>
                              {formatDate(admission.data_alta || '')}
                            </TableCell>
                            <TableCell>
                              {duration !== null ? (
                                <Badge variant="outline">
                                  {duration} dias
                                </Badge>
                              ) : (
                                <span className="text-muted-foreground">Em curso</span>
                              )}
                            </TableCell>
                            <TableCell>
                              {interval !== null ? (
                                <Badge variant="outline">
                                  {interval} dias
                                </Badge>
                              ) : (
                                <span className="text-muted-foreground">—</span>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}