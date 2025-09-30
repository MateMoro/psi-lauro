import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, User, MapPin, Activity, Calendar, IdCard } from "lucide-react";
import { PacienteEnriquecido } from "@/hooks/usePacientes";

interface PacienteModalProps {
  paciente: PacienteEnriquecido | null;
  isOpen: boolean;
  onClose: () => void;
}

export function PacienteModal({ paciente, isOpen, onClose }: PacienteModalProps) {
  if (!paciente) return null;

  const formatarData = (data: string | null) => {
    if (!data) return "Não informado";
    return new Date(data).toLocaleDateString('pt-BR');
  };

  const temAlertaReinternacao = paciente.numeroInternacoes > 2;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <User className="h-5 w-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <span className="text-xl font-semibold">
                {paciente.nome || "Nome não informado"}
              </span>
              {temAlertaReinternacao && (
                <div className="flex items-center gap-2 mt-1">
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                  <span className="text-sm text-red-600 font-medium">
                    Paciente com múltiplas reinternações
                  </span>
                </div>
              )}
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informações Básicas */}
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                <IdCard className="h-4 w-4" />
                Informações Básicas
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Nome Completo</label>
                  <p className="text-sm mt-1">{paciente.nome || "Não informado"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Idade</label>
                  <p className="text-sm mt-1">{paciente.idade} anos</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">CNS</label>
                  <p className="text-sm mt-1 font-mono">{paciente.cns || "Não informado"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Gênero</label>
                  <p className="text-sm mt-1">{paciente.genero || "Não informado"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Raça/Cor</label>
                  <p className="text-sm mt-1">{paciente.raca_cor || "Não informado"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Data de Nascimento</label>
                  <p className="text-sm mt-1">{formatarData(paciente.data_nascimento)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Informações Clínicas */}
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Informações Clínicas
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-gray-600">Diagnóstico Principal (CID)</label>
                  <div className="mt-1">
                    {paciente.cid ? (
                      <Badge variant="outline" className="text-sm">
                        {paciente.cid}
                      </Badge>
                    ) : (
                      <p className="text-sm text-gray-500">Não informado</p>
                    )}
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-gray-600">Grupo Diagnóstico</label>
                  <p className="text-sm mt-1">{paciente.cid_grupo || "Não informado"}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Informações de Internação */}
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Informações de Internação
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Data de Admissão</label>
                  <p className="text-sm mt-1">{formatarData(paciente.data_admissao)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Data de Alta</label>
                  <p className="text-sm mt-1">{formatarData(paciente.data_alta)}</p>
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-gray-600">
                    Número de Internações
                    {temAlertaReinternacao && (
                      <AlertTriangle className="inline h-4 w-4 text-red-500 ml-1" />
                    )}
                  </label>
                  <div className="mt-1">
                    <Badge
                      variant={temAlertaReinternacao ? "destructive" : "secondary"}
                      className="text-sm"
                    >
                      {paciente.numeroInternacoes} internação(ões)
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* CAPS de Referência */}
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                CAPS de Referência
              </h3>
              <p className="text-sm">{paciente.caps_referencia || "Não informado"}</p>
            </CardContent>
          </Card>

          {/* Alerta de Reinternação */}
          {temAlertaReinternacao && (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-red-800">Alerta de Reinternação</h4>
                    <p className="text-sm text-red-700 mt-1">
                      Este paciente possui {paciente.numeroInternacoes} internações registradas,
                      indicando necessidade de atenção especial para continuidade do cuidado
                      e prevenção de novas reinternações.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}