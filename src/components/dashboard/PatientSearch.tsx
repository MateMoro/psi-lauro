import { useState } from "react";
import { Search, User, Calendar, MapPin } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Patient {
  nome: string;
  cid_grupo: string;
  caps_referencia: string;
  data_admissao: string;
  data_alta?: string;
  genero: string;
}

interface PatientSearchProps {
  patients: Patient[];
}

export function PatientSearch({ patients }: PatientSearchProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  const filteredPatients = patients.filter(patient =>
    patient.nome?.toLowerCase().includes(searchTerm.toLowerCase())
  ).slice(0, 5);

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("pt-BR");
  };

  return (
    <Card className="shadow-medium">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Search className="h-5 w-5 text-primary" />
          Pesquisa de Pacientes
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Digite o nome do paciente..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {searchTerm && (
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {filteredPatients.length > 0 ? (
              filteredPatients.map((patient, index) => (
                <div
                  key={index}
                  className="p-3 border border-border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                  onClick={() => setSelectedPatient(patient)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-primary" />
                      <span className="font-medium">{patient.nome}</span>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {patient.genero === 'M' ? 'Masculino' : 'Feminino'}
                    </Badge>
                  </div>
                  <div className="mt-1 text-sm text-muted-foreground">
                    {patient.cid_grupo} • {patient.caps_referencia}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                Nenhum paciente encontrado
              </div>
            )}
          </div>
        )}

        {selectedPatient && (
          <div className="mt-4 p-4 bg-muted/30 rounded-lg border border-border">
            <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <User className="h-4 w-4 text-primary" />
              Detalhes do Paciente
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <span className="font-medium min-w-[100px]">Nome:</span>
                <span>{selectedPatient.nome}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium min-w-[100px]">Diagnóstico:</span>
                <Badge variant="secondary">{selectedPatient.cid_grupo}</Badge>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-3 w-3 text-muted-foreground" />
                <span className="font-medium min-w-[80px]">CAPS:</span>
                <span>{selectedPatient.caps_referencia}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-3 w-3 text-muted-foreground" />
                <span className="font-medium min-w-[80px]">Admissão:</span>
                <span>{formatDate(selectedPatient.data_admissao)}</span>
              </div>
              {selectedPatient.data_alta && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-3 w-3 text-muted-foreground" />
                  <span className="font-medium min-w-[80px]">Alta:</span>
                  <span>{formatDate(selectedPatient.data_alta)}</span>
                </div>
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              className="mt-3"
              onClick={() => setSelectedPatient(null)}
            >
              Fechar
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}