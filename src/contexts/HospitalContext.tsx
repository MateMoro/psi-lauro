import React, { createContext, useState, useEffect, useContext } from 'react';
import type { Hospital, HospitalContextType } from '@/lib/hospital-utils';
import { getTableName } from '@/lib/hospital-utils';

const HospitalContext = createContext<HospitalContextType | undefined>(undefined);

const HOSPITAL_STORAGE_KEY = 'psi-selected-hospital';

export const HospitalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedHospital, setSelectedHospitalState] = useState<Hospital>('tiradentes');

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(HOSPITAL_STORAGE_KEY);
    if (saved && (saved === 'planalto' || saved === 'tiradentes')) {
      setSelectedHospitalState(saved as Hospital);
    } else {
      // Force Tiradentes as default if no saved value
      setSelectedHospitalState('tiradentes');
    }
  }, []);

  const setSelectedHospital = (hospital: Hospital) => {
    setSelectedHospitalState(hospital);
    localStorage.setItem(HOSPITAL_STORAGE_KEY, hospital);
  };

  const getTableNameForContext = () => {
    return getTableName(selectedHospital);
  };

  const value: HospitalContextType = {
    selectedHospital,
    setSelectedHospital,
    getTableName: getTableNameForContext,
  };

  return (
    <HospitalContext.Provider value={value}>
      {children}
    </HospitalContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useHospital = () => {
  const context = useContext(HospitalContext);
  if (context === undefined) {
    throw new Error('useHospital must be used within a HospitalProvider');
  }
  return context;
};