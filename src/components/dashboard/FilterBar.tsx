import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Filter } from "lucide-react";

interface FilterBarProps {
  onFiltersChange: (filters: DashboardFilters) => void;
  availableCaps: string[];
  availableProcedencias: string[];
}

export interface DashboardFilters {
  capsReferencia?: string;
  genero?: string;
  faixaEtaria?: string;
  procedencia?: string;
}

export function FilterBar({ onFiltersChange, availableCaps, availableProcedencias }: FilterBarProps) {
  const [filters, setFilters] = useState<DashboardFilters>({});

  const updateFilters = (newFilters: Partial<DashboardFilters>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    onFiltersChange(updatedFilters);
  };

  const clearFilters = () => {
    setFilters({});
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* CAPS Filter */}
          <div className="space-y-2">
            <Label htmlFor="caps-select" className="text-sm font-medium">
              CAPS de Referência
            </Label>
            <Select
              value={filters.capsReferencia || ""}
              onValueChange={(value) => updateFilters({ capsReferencia: value || undefined })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Todos os CAPS" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos os CAPS</SelectItem>
                {availableCaps.map((caps) => (
                  <SelectItem key={caps} value={caps}>
                    {caps}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Gender Filter */}
          <div className="space-y-2">
            <Label htmlFor="gender-select" className="text-sm font-medium">
              Gênero
            </Label>
            <Select
              value={filters.genero || ""}
              onValueChange={(value) => updateFilters({ genero: value || undefined })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos</SelectItem>
                <SelectItem value="MASC">Masculino</SelectItem>
                <SelectItem value="FEM">Feminino</SelectItem>
                <SelectItem value="OUTROS">Outros</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Procedencia Filter */}
          <div className="space-y-2">
            <Label htmlFor="procedencia-select" className="text-sm font-medium">
              Procedência
            </Label>
            <Select
              value={filters.procedencia || ""}
              onValueChange={(value) => updateFilters({ procedencia: value || undefined })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Todas as procedências" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todas as procedências</SelectItem>
                {availableProcedencias.map((procedencia) => (
                  <SelectItem key={procedencia} value={procedencia}>
                    {procedencia}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Age Range Filter */}
          <div className="space-y-2">
            <Label htmlFor="age-select" className="text-sm font-medium">
              Faixa Etária
            </Label>
            <Select
              value={filters.faixaEtaria || ""}
              onValueChange={(value) => updateFilters({ faixaEtaria: value || undefined })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Todas as idades" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todas as idades</SelectItem>
                <SelectItem value="0-17">0-17 anos</SelectItem>
                <SelectItem value="18-30">18-30 anos</SelectItem>
                <SelectItem value="31-50">31-50 anos</SelectItem>
                <SelectItem value="51-70">51-70 anos</SelectItem>
                <SelectItem value="70+">70+ anos</SelectItem>
              </SelectContent>
            </Select>
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