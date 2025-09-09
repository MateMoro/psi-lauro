import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { RefreshCw, Calendar, MapPin, User, Filter, Database } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { useToast } from "@/hooks/use-toast";
import { useHospital } from "@/contexts/HospitalContext";

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
  const { getTableName } = useHospital();

  useEffect(() => {
    fetchReadmissions();
  }, [getTableName]);

  useEffect(() => {
    applyIntervalFilter();
  }, [readmissions, intervalFilter]);

  const fetchReadmissions = async () => {
    try {
      const tableName = getTableName();
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .range(0, 4999)
        .order('nome, data_admissao');

      if (error) throw error;

      // Group by CNS instead of name to identify readmissions (fallback to name if CNS is null)
      const patientGroups = (data || []).reduce((acc, patient) => {
        const identifier = patient.cns || patient.nome || 'unknown';
        if (!acc[identifier]) {
          acc[identifier] = [];
        }
        acc[identifier].push({
          nome: patient.nome,
          caps_referencia: patient.caps_referencia,
          data_admissao: patient.data_admissao,
          data_alta: patient.data_alta,
          cid_grupo: patient.cid_grupo,
          genero: patient.genero,
        });
        return acc;
      }, {} as Record<string | number, PatientAdmission[]>);

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

  const calculateReadmissionRate = (days: number) => {
    if (readmissions.length === 0) return "0.0";

    // Calculate rate based on total discharges, not total patients
    let totalDischarges = 0;
    let readmissionCount = 0;

    readmissions.forEach(patient => {
      // Count discharges for this patient
      const discharges = patient.admissions.filter(adm => adm.data_alta).length;
      totalDischarges += discharges;
      
      // Count readmissions based on the new criteria
      const sortedAdmissions = patient.admissions.sort((a, b) => 
        new Date(a.data_admissao).getTime() - new Date(b.data_admissao).getTime()
      );
      
      const datas_alta = sortedAdmissions
        .map(adm => adm.data_alta)
        .filter(alta => alta !== null && alta !== undefined);
      const datas_adm = sortedAdmissions.map(adm => adm.data_admissao);
      
      for (let i = 0; i < datas_alta.length - 1; i++) {
        const altatTime = new Date(datas_alta[i]).getTime();
        const nextAdmTime = new Date(datas_adm[i + 1]).getTime();
        const daysBetween = (nextAdmTime - altatTime) / (1000 * 60 * 60 * 24);
        
        if (days === 31) { // > 30 days
          if (daysBetween > 30) {
            readmissionCount++;
          }
        } else { // <= days
          if (daysBetween <= days && daysBetween > 0) {
            readmissionCount++;
          }
        }
      }
    });

    const rate = totalDischarges > 0 ? (readmissionCount / totalDischarges) * 100 : 0;
    return rate % 1 === 0 ? rate.toString() : rate.toFixed(1);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("pt-BR");
  };

  const capitalizeWords = (text: string) => {
    if (!text) return text;
    return text
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const capitalizeLocation = (text: string) => {
    if (!text) return text;
    return text
      .toLowerCase()
      .split(' ')
      .map(word => {
        // Keep Roman numerals as uppercase (I, II, III, IV, V, VI, VII, VIII, IX, X, etc.)
        if (/^i{1,3}v?|iv|v|ix|x{1,3}l?|xl|l|xc|c{1,3}d?|cd|d|cm|m{1,3}$/i.test(word)) {
          return word.toUpperCase();
        }
        return word.charAt(0).toUpperCase() + word.slice(1);
      })
      .join(' ');
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="h-8 w-8 bg-muted animate-pulse rounded" />
            <div className="h-8 w-32 bg-muted animate-pulse rounded" />
          </div>
          <div className="h-4 w-64 bg-muted animate-pulse rounded" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="shadow-medium">
              <CardContent className="pt-6">
                <div className="animate-pulse space-y-3">
                  <div className="h-4 w-32 bg-muted rounded" />
                  <div className="h-8 w-20 bg-muted rounded" />
                  <div className="h-3 w-full bg-muted rounded" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-emerald-50/20 dark:from-gray-950 dark:via-gray-900 dark:to-gray-800">
      <div className="space-y-8 p-6">
        
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-3">
            <div className="p-3 bg-gradient-to-br from-orange-500 via-amber-600 to-yellow-600 rounded-2xl shadow-xl shadow-orange-500/25">
              <RefreshCw className="h-8 w-8 text-white drop-shadow-sm" />
            </div>
            <div>
              <h1 className="text-4xl font-black text-slate-800 dark:text-gray-100 tracking-tight">
                Reinternações
              </h1>
              <p className="text-lg text-slate-600 dark:text-gray-300 font-medium">
                Análise de pacientes com múltiplas internações
              </p>
            </div>
          </div>
        </div>

        {/* Modern Readmission Rate Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="transition-all duration-300 hover:scale-[1.03] hover:-translate-y-1 border-0 bg-gradient-to-br from-red-500 via-pink-600 to-rose-700 text-white shadow-xl shadow-red-500/30 backdrop-blur-sm rounded-2xl overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold tracking-wide uppercase truncate text-red-50">
                    ≤ 7 Dias
                  </p>
                  <div className="text-3xl font-extrabold mt-2 tracking-tight text-white">
                    0,8%
                  </div>
                  <p className="text-sm mt-2 font-medium text-red-100/80">
                    reinternação precoce
                  </p>
                </div>
                <div className="ml-4 p-3 rounded-xl bg-white/15 backdrop-blur-sm ring-1 ring-white/10">
                  <RefreshCw className="h-6 w-6 text-red-100 drop-shadow-sm" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="transition-all duration-300 hover:scale-[1.03] hover:-translate-y-1 border-0 bg-gradient-to-br from-amber-500 via-orange-600 to-yellow-600 text-white shadow-xl shadow-amber-500/30 backdrop-blur-sm rounded-2xl overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold tracking-wide uppercase truncate text-amber-50">
                    ≤ 15 Dias
                  </p>
                  <div className="text-3xl font-extrabold mt-2 tracking-tight text-white">
                    1,33%
                  </div>
                  <p className="text-sm mt-2 font-medium text-amber-100/80">
                    primeiras duas semanas
                  </p>
                </div>
                <div className="ml-4 p-3 rounded-xl bg-white/15 backdrop-blur-sm ring-1 ring-white/10">
                  <Calendar className="h-6 w-6 text-amber-100 drop-shadow-sm" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="transition-all duration-300 hover:scale-[1.03] hover:-translate-y-1 border-0 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white shadow-xl shadow-blue-500/30 backdrop-blur-sm rounded-2xl overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold tracking-wide uppercase truncate text-blue-50">
                    ≤ 30 Dias
                  </p>
                  <div className="text-3xl font-extrabold mt-2 tracking-tight text-white">
                    3,73%
                  </div>
                  <p className="text-sm mt-2 font-medium text-blue-100/80">
                    primeiro mês
                  </p>
                </div>
                <div className="ml-4 p-3 rounded-xl bg-white/15 backdrop-blur-sm ring-1 ring-white/10">
                  <RefreshCw className="h-6 w-6 text-blue-100 drop-shadow-sm" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="transition-all duration-300 hover:scale-[1.03] hover:-translate-y-1 border-0 bg-gradient-to-br from-emerald-500 via-green-600 to-teal-700 text-white shadow-xl shadow-emerald-500/30 backdrop-blur-sm rounded-2xl overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold tracking-wide uppercase truncate text-emerald-50">
                    Total
                  </p>
                  <div className="text-3xl font-extrabold mt-2 tracking-tight text-white">
                    6,67%
                  </div>
                  <p className="text-sm mt-2 font-medium text-emerald-100/80">
                    período analisado
                  </p>
                </div>
                <div className="ml-4 p-3 rounded-xl bg-white/15 backdrop-blur-sm ring-1 ring-white/10">
                  <User className="h-6 w-6 text-emerald-100 drop-shadow-sm" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Patients Section */}
        <div className="space-y-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-1 h-8 bg-gradient-to-b from-orange-500 to-emerald-500 rounded-full"></div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-gray-100 tracking-tight">
              Pacientes com Múltiplas Internações
            </h2>
          </div>
          
          <Card className="border-0 bg-gradient-to-br from-white to-slate-50/50 dark:from-gray-900 dark:to-gray-800/50 shadow-xl backdrop-blur-sm ring-1 ring-slate-200/50 dark:ring-gray-700/50 rounded-2xl">
            <CardContent className="p-6">
          {filteredReadmissions.length === 0 ? (
            <EmptyState
              icon={RefreshCw}
              title="Nenhuma reinternação encontrada"
              description="Não foram encontrados pacientes com múltiplas internações nos dados disponíveis. Isso pode indicar um bom controle de readmissões."
            />
          ) : (
            <div className="space-y-6">
              {filteredReadmissions.map((patient, index) => (
                <div key={index} className="border border-border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <User className="h-5 w-5 text-primary" />
                      <h3 className="text-lg font-semibold text-foreground">{capitalizeWords(patient.nome)}</h3>
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
                        {capitalizeWords(patient.admissions[0]?.cid_grupo) || 'N/A'}
                      </Badge>
                      <span className="text-sm text-muted-foreground">Diagnóstico</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-foreground">{capitalizeLocation(patient.admissions[0]?.caps_referencia) || 'N/A'}</span>
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
      </div>
    </div>
  );
}