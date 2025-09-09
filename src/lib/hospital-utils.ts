export type Hospital = 'planalto' | 'tiradentes';

export interface HospitalContextType {
  selectedHospital: Hospital;
  setSelectedHospital: (hospital: Hospital) => void;
  getTableName: () => string;
}

export const getHospitalDisplayName = (hospital: Hospital): string => {
  switch (hospital) {
    case 'planalto':
      return 'Hospital Planalto';
    case 'tiradentes':
      return 'Hospital Tiradentes';
    default:
      return 'Hospital';
  }
};

export const getTableName = (hospital: Hospital): string => {
  return hospital === 'planalto' ? 'pacientes_planalto' : 'pacientes_tiradentes';
};