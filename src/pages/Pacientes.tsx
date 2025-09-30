import { useState } from "react";
import { UserPlus, Search, AlertTriangle, User, MapPin, Calendar } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { usePacientes, PacienteEnriquecido } from "@/hooks/usePacientes";
import { PacienteModal } from "@/components/pacientes/PacienteModal";

export default function Pacientes() {
  const { pacientes, searchTerm, setSearchTerm, isLoading, error } = usePacientes();
  const [selectedPaciente, setSelectedPaciente] = useState<PacienteEnriquecido | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handlePacienteClick = (paciente: PacienteEnriquecido) => {
    setSelectedPaciente(paciente);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedPaciente(null);
  };

  const formatarData = (data: string | null) => {
    if (!data) return "Não informado";
    return new Date(data).toLocaleDateString('pt-BR');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="space-y-6 lg:space-y-8">

        {/* Header Section */}
        <div className="mb-4 lg:mb-8">
          <div className="flex items-center gap-3 lg:gap-4 mb-3">
            <div className="p-2 lg:p-3 bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-700 rounded-xl lg:rounded-2xl shadow-xl shadow-blue-500/25">
              <UserPlus className="h-6 w-6 lg:h-8 lg:w-8 text-white drop-shadow-sm" />
            </div>
            <div>
              <h1 className="text-2xl lg:text-4xl font-black text-slate-800 tracking-tight">
                Pacientes
              </h1>
              <p className="text-sm lg:text-lg text-slate-600 font-medium">
                Gestão e visualização de dados dos pacientes
              </p>
            </div>
          </div>
        </div>

        {/* Search Section */}
        <div className="bg-gradient-to-br from-slate-50 to-white shadow-lg backdrop-blur-sm ring-1 ring-slate-200/50 rounded-xl p-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar por nome, iniciais ou CNS..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 text-base"
            />
          </div>
          {searchTerm && (
            <p className="mt-2 text-sm text-gray-600">
              {pacientes.length} paciente(s) encontrado(s) para "{searchTerm}"
            </p>
          )}
        </div>

        {/* Content Area */}
        <div className="bg-gradient-to-br from-slate-50 to-white shadow-lg backdrop-blur-sm ring-1 ring-slate-200/50 rounded-xl p-6">
          {error && (
            <Alert className="mb-6">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Erro ao carregar dados dos pacientes. Tente novamente.
              </AlertDescription>
            </Alert>
          )}

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, index) => (
                <Card key={index} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-2/3" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : pacientes.length === 0 ? (
            <div className="text-center py-12">
              <UserPlus className="mx-auto h-16 w-16 text-slate-400 mb-4" />
              <h3 className="text-lg font-semibold text-slate-700 mb-2">
                {searchTerm ? "Nenhum paciente encontrado" : "Nenhum paciente cadastrado"}
              </h3>
              <p className="text-slate-500">
                {searchTerm
                  ? "Tente ajustar os termos de busca ou verifique a ortografia."
                  : "Os dados dos pacientes aparecerão aqui quando estiverem disponíveis."
                }
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pacientes.map((paciente) => (
                <Card
                  key={paciente.id}
                  className="cursor-pointer hover:shadow-md transition-all duration-200 hover:scale-105"
                  onClick={() => handlePacienteClick(paciente)}
                >
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center justify-between text-base">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-blue-600" />
                        <span className="truncate">
                          {paciente.nome || "Nome não informado"}
                        </span>
                      </div>
                      {paciente.numeroInternacoes > 2 && (
                        <AlertTriangle className="h-4 w-4 text-red-500 flex-shrink-0" />
                      )}
                    </CardTitle>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="h-3 w-3" />
                      <span>{paciente.idade} anos</span>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                        CNS
                      </label>
                      <p className="text-sm font-mono">
                        {paciente.cns || "Não informado"}
                      </p>
                    </div>

                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                        Diagnóstico Principal
                      </label>
                      <div className="mt-1">
                        {paciente.cid_grupo ? (
                          <Badge variant="outline" className="text-xs">
                            {paciente.cid_grupo}
                          </Badge>
                        ) : (
                          <span className="text-sm text-gray-400">Não informado</span>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                        CAPS de Referência
                      </label>
                      <div className="flex items-center gap-1 mt-1">
                        <MapPin className="h-3 w-3 text-gray-400" />
                        <span className="text-sm truncate">
                          {paciente.caps_referencia || "Não informado"}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t">
                      <div>
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                          Nº de Internações
                        </label>
                        <div className="mt-1">
                          <Badge
                            variant={paciente.numeroInternacoes > 2 ? "destructive" : "secondary"}
                            className="text-xs"
                          >
                            {paciente.numeroInternacoes}
                          </Badge>
                        </div>
                      </div>
                      {paciente.numeroInternacoes > 2 && (
                        <div className="flex items-center gap-1 text-red-600">
                          <AlertTriangle className="h-3 w-3" />
                          <span className="text-xs font-medium">Alerta</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Statistics Summary */}
        {!isLoading && pacientes.length > 0 && (
          <div className="bg-gradient-to-br from-slate-50 to-white shadow-lg backdrop-blur-sm ring-1 ring-slate-200/50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-slate-700 mb-4">Resumo</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">{pacientes.length}</p>
                <p className="text-sm text-gray-600">Total de Pacientes</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">
                  {pacientes.filter(p => p.numeroInternacoes === 1).length}
                </p>
                <p className="text-sm text-gray-600">Primeira Internação</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-yellow-600">
                  {pacientes.filter(p => p.numeroInternacoes === 2).length}
                </p>
                <p className="text-sm text-gray-600">Segunda Internação</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-red-600">
                  {pacientes.filter(p => p.numeroInternacoes > 2).length}
                </p>
                <p className="text-sm text-gray-600">Múltiplas Reinternações</p>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Modal de Detalhes do Paciente */}
      <PacienteModal
        paciente={selectedPaciente}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
}