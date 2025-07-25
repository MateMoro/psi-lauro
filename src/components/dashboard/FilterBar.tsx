import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Filter } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface FilterBarProps {
  onFiltersChange: (filters: DashboardFilters) => void;
  availableCaps: string[];
}

export interface DashboardFilters {
  capsReferencia?: string[];
  genero?: string;
  faixaEtaria?: string;
  dataInicio?: Date;
  dataFim?: Date;
}

const faixasEtarias = [
  { value: "0-17", label: "0-17 anos" },
  { value: "18-30", label: "18-30 anos" },
  { value: "31-50", label: "31-50 anos" },
  { value: "51-70", label: "51-70 anos" },
  { value: "70+", label: "70+ anos" },
];

const generos = [
  { value: "M", label: "Masculino" },
  { value: "F", label: "Feminino" },
];

export function FilterBar({ onFiltersChange, availableCaps }: FilterBarProps) {
  const [filters, setFilters] = useState<DashboardFilters>({});
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({});

  const updateFilters = (newFilters: Partial<DashboardFilters>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    onFiltersChange(updatedFilters);
  };

  const clearFilters = () => {
    setFilters({});
    setDateRange({});
    onFiltersChange({});
  };

  return (
    <Card className="shadow-medium mb-6">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Filter className="h-5 w-5 text-primary" />
          Filtros Dinâmicos
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* CAPS de Referência */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">CAPS de Referência</Label>
            <Select onValueChange={(value) => updateFilters({ capsReferencia: [value] })}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecionar CAPS" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {availableCaps.map((caps) => (
                  <SelectItem key={caps} value={caps}>
                    {caps}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Gênero */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Gênero</Label>
            <Select onValueChange={(value) => updateFilters({ genero: value })}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecionar gênero" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {generos.map((genero) => (
                  <SelectItem key={genero.value} value={genero.value}>
                    {genero.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Faixa Etária */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Faixa Etária</Label>
            <Select onValueChange={(value) => updateFilters({ faixaEtaria: value })}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecionar faixa" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                {faixasEtarias.map((faixa) => (
                  <SelectItem key={faixa.value} value={faixa.value}>
                    {faixa.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Período */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Período</Label>
            <div className="flex gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="flex-1 justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange.from ? (
                      format(dateRange.from, "dd/MM", { locale: ptBR })
                    ) : (
                      "Início"
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dateRange.from}
                    onSelect={(date) => {
                      setDateRange({ ...dateRange, from: date });
                      updateFilters({ dataInicio: date });
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>

              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="flex-1 justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange.to ? (
                      format(dateRange.to, "dd/MM", { locale: ptBR })
                    ) : (
                      "Fim"
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dateRange.to}
                    onSelect={(date) => {
                      setDateRange({ ...dateRange, to: date });
                      updateFilters({ dataFim: date });
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <Button variant="outline" onClick={clearFilters} className="text-sm">
            Limpar Filtros
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}