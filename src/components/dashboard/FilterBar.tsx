import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Filter, X, ChevronUp, ChevronDown } from "lucide-react";

interface FilterBarProps {
  onFiltersChange: (filters: DashboardFilters) => void;
  availableCaps: string[];
  availableProcedencias: string[];
  availableDiagnoses: string[];
  availableCores: string[];
}

export interface DashboardFilters {
  capsReferencia?: string;
  genero?: string;
  faixaEtaria?: string;
  procedencia?: string;
  patologia?: string;
  cor?: string;
}

export function FilterBar({ onFiltersChange, availableCaps, availableProcedencias, availableDiagnoses, availableCores }: FilterBarProps) {
  const [filters, setFilters] = useState<DashboardFilters>({});
  const [isCollapsed, setIsCollapsed] = useState(false);

  const updateFilters = (newFilters: Partial<DashboardFilters>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    onFiltersChange(updatedFilters);
  };

  const clearFilters = () => {
    setFilters({});
    onFiltersChange({});
  };

  const removeFilter = (filterKey: keyof DashboardFilters) => {
    const updatedFilters = { ...filters };
    delete updatedFilters[filterKey];
    setFilters(updatedFilters);
    onFiltersChange(updatedFilters);
  };

  // Count active filters
  const activeFiltersCount = useMemo(() => {
    return Object.values(filters).filter(value => value !== undefined && value !== "").length;
  }, [filters]);

  // Get filter display labels
  const getFilterLabel = (key: keyof DashboardFilters, value: string) => {
    switch (key) {
      case 'genero':
        return value === 'MASC' ? 'Masculino' : value === 'FEM' ? 'Feminino' : value;
      case 'faixaEtaria':
        return `${value} anos`;
      case 'capsReferencia':
        return `CAPS: ${value}`;
      case 'procedencia':
        return `Proc: ${value.length > 20 ? value.substring(0, 20) + '...' : value}`;
      case 'patologia':
        return `Pat: ${value.length > 20 ? value.substring(0, 20) + '...' : value}`;
      case 'cor':
        return `Cor: ${value}`;
      default:
        return value;
    }
  };

  return (
    <Card className="shadow-medium mb-6">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Filter className="h-5 w-5 text-primary" />
            Filtros Dinâmicos
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {activeFiltersCount} ativo{activeFiltersCount > 1 ? 's' : ''}
              </Badge>
            )}
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden"
            onClick={() => setIsCollapsed(!isCollapsed)}
          >
            {isCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
          </Button>
        </div>
        
        {/* Active Filters Display */}
        {activeFiltersCount > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {Object.entries(filters).map(([key, value]) => {
              if (!value) return null;
              return (
                <Badge
                  key={key}
                  variant="outline"
                  className="flex items-center gap-1 px-2 py-1"
                >
                  {getFilterLabel(key as keyof DashboardFilters, value)}
                  <button
                    onClick={() => removeFilter(key as keyof DashboardFilters)}
                    className="ml-1 hover:bg-destructive/20 rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              );
            })}
          </div>
        )}
      </CardHeader>
      <CardContent className={`space-y-4 ${isCollapsed ? 'hidden md:block' : ''}`}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 items-end">
          {/* CAPS Filter */}
          <div className="space-y-2">
            <Label htmlFor="caps-select" className="text-sm font-medium">
              CAPS de Referência
            </Label>
            <Select
              value={filters.capsReferencia || "all"}
              onValueChange={(value) => updateFilters({ capsReferencia: value === "all" ? undefined : value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Todos os CAPS" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os CAPS</SelectItem>
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
              Sexo
            </Label>
            <Select
              value={filters.genero || "all"}
              onValueChange={(value) => updateFilters({ genero: value === "all" ? undefined : value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="MASC">Masculino</SelectItem>
                <SelectItem value="FEM">Feminino</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Procedencia Filter */}
          <div className="space-y-2">
            <Label htmlFor="procedencia-select" className="text-sm font-medium">
              Procedência
            </Label>
            <Select
              value={filters.procedencia || "all"}
              onValueChange={(value) => updateFilters({ procedencia: value === "all" ? undefined : value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Todas as procedências" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as procedências</SelectItem>
                {availableProcedencias.map((procedencia) => (
                  <SelectItem key={procedencia} value={procedencia}>
                    {procedencia === "Hospital Wadomiro de Paula – PS" ? "Hospital Planalto – Porta" :
                     procedencia === "Hospital Waldomiro de Paula – Enfermaria" ? "Hospital Planalto – Transf Interna" : 
                     procedencia}
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
              value={filters.faixaEtaria || "all"}
              onValueChange={(value) => updateFilters({ faixaEtaria: value === "all" ? undefined : value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Todas as idades" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as idades</SelectItem>
                <SelectItem value="<18">&lt;18</SelectItem>
                <SelectItem value="18–25">18–25 anos</SelectItem>
                <SelectItem value="26–44">26–44 anos</SelectItem>
                <SelectItem value="45–64">45–64 anos</SelectItem>
                <SelectItem value="65+">65+ anos</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Patologia Filter */}
          <div className="space-y-2">
            <Label htmlFor="patologia-select" className="text-sm font-medium">
              Patologia
            </Label>
            <Select
              value={filters.patologia || "all"}
              onValueChange={(value) => updateFilters({ patologia: value === "all" ? undefined : value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Todas as patologias" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as patologias</SelectItem>
                {availableDiagnoses.map((diagnosis) => (
                  <SelectItem key={diagnosis} value={diagnosis}>
                    {diagnosis}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Cor Filter */}
          <div className="space-y-2">
            <Label htmlFor="cor-select" className="text-sm font-medium">
              Cor
            </Label>
            <Select
              value={filters.cor || "all"}
              onValueChange={(value) => updateFilters({ cor: value === "all" ? undefined : value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Todas as cores" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as cores</SelectItem>
                {availableCores.map((cor) => (
                  <SelectItem key={cor} value={cor}>
                    {cor}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex justify-end">
          <Button 
            variant="outline" 
            onClick={clearFilters} 
            className="text-sm hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 transition-all duration-200"
            disabled={activeFiltersCount === 0}
          >
            <X className="h-4 w-4 mr-2" />
            Limpar Filtros
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}