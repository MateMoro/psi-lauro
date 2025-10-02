import { Building2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useHospital } from "@/contexts/HospitalContext";
import { getHospitalDisplayName } from "@/lib/hospital-utils";
import type { Hospital } from "@/lib/hospital-utils";

export function HospitalSelector() {
  const { selectedHospital, setSelectedHospital } = useHospital();

  const handleHospitalChange = (value: Hospital) => {
    setSelectedHospital(value);
  };

  return (
    <div className="flex items-center gap-2">
      <Building2 className="hidden md:block h-4 w-4 text-slate-600" />
      <Select value={selectedHospital} onValueChange={handleHospitalChange}>
        <SelectTrigger className="w-32 md:w-[220px] h-10 text-xs md:text-sm border-slate-300 bg-white/80 backdrop-blur-sm">
          <SelectValue placeholder="Hospital" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="planalto">
            {getHospitalDisplayName('planalto')}
          </SelectItem>
          <SelectItem value="tiradentes">
            {getHospitalDisplayName('tiradentes')}
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}