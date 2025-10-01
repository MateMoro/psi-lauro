export type Hospital = 'planalto' | 'tiradentes';

export interface HospitalContextType {
  selectedHospital: Hospital;
  setSelectedHospital: (hospital: Hospital) => void;
  getTableName: () => string;
  getCapacity: () => number;
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

export const getHospitalCapacity = (hospital: Hospital): number => {
  return hospital === 'planalto' ? 16 : 10;
};

// Patient interface for average stay calculation
export interface Patient {
  data_alta?: string;
  dias_internacao: number;
  data_admissao: string;
}

// Extended patient interface for readmission calculation
export interface PatientWithCNS extends Patient {
  cns?: string | number;
  nome?: string;
}

// Helper functions for date handling
export const parseLocalDate = (s?: string | null): Date | null => {
  if (!s) return null;
  const [y, m, d] = s.split('-').map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
};

const todayLocal = () => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
};

const lastDayOfPreviousMonth = () => {
  const now = todayLocal();
  return new Date(now.getFullYear(), now.getMonth(), 0);
};

/**
 * Calcula a média de permanência correta seguindo a lógica Python:
 * 1. Filtra apenas pacientes com alta válida (data_alta não-nula)
 * 2. Filtra apenas permanências positivas (dias_internacao > 0)
 * 3. Limita altas até o último dia do mês anterior ao atual
 * 4. Calcula: soma(dias_internacao) / quantidade_pacientes_válidos
 */
export interface DateRange {
  start?: Date; // opcional: começo do período (inclusive)
  end?: Date;   // opcional: fim do período (inclusive)
}

/**
 * Calcula a média de permanência (dias) com regras:
 * 1) Considera apenas internações com alta válida (data_alta não-nula e parsável)
 * 2) Permanência > 0
 * 3) Por padrão, limita até o último dia do MÊS ANTERIOR ao mês atual (BR local)
 * 4) Recalcula permanência com base em data_admissao/data_alta; se faltar, usa dias_internacao
 * 5) Se range for informado, aplica { start, end } (inclusive) sobre a data_alta
 */
export const calculateCorrectAverageStay = (
  patients: Patient[],
  range?: DateRange
): number => {
  const defaultEnd = lastDayOfPreviousMonth();
  const periodEnd = range?.end ?? defaultEnd;
  const periodStart = range?.start; // opcional

  // Filtrar pacientes válidos dentro do período
  const validPatients = patients.filter((p) => {
    if (!p.data_alta) return false;

    const alta = parseLocalDate(p.data_alta);
    if (!alta) return false;

    // Range por data de ALTA
    if (periodStart && alta < periodStart) return false;
    if (alta > periodEnd) return false;

    // Recalcula permanência (preferencial)
    const adm = parseLocalDate(p.data_admissao);
    let stayDays = 0;
    if (adm && alta) {
      const ms = alta.getTime() - adm.getTime();
      stayDays = Math.floor(ms / (1000 * 60 * 60 * 24));
    } else {
      // Fallback para o campo de origem quando não der para recomputar
      stayDays = p.dias_internacao || 0;
    }

    return stayDays > 0;
  });

  if (validPatients.length === 0) return 0;

  // Soma usando o mesmo critério de cima (recomputa por datas; fallback se preciso)
  const totalDays = validPatients.reduce((sum, p) => {
    const alta = parseLocalDate(p.data_alta);
    const adm = parseLocalDate(p.data_admissao);
    if (adm && alta) {
      const ms = alta.getTime() - adm.getTime();
      return sum + Math.floor(ms / (1000 * 60 * 60 * 24));
    }
    return sum + (p.dias_internacao || 0);
  }, 0);

  return totalDays / validPatients.length;
};

/**
 * Calcula a taxa de reinternação seguindo a lógica de IndicadoresAssistenciais:
 * 1. Agrupa pacientes por CNS (ignora pacientes sem CNS)
 * 2. Para cada paciente, ordena internações por data de admissão
 * 3. Conta reinternações quando o intervalo entre alta e próxima admissão está dentro do período especificado
 * 4. Retorna: (reinternações / total_altas) * 100
 *
 * @param patients Array de pacientes com CNS
 * @param days Número de dias para considerar como reinternação (7, 15, 30, etc.)
 * @returns Taxa de reinternação em porcentagem
 */
export const calculateReadmissionRate = (
  patients: PatientWithCNS[],
  days: number
): number => {
  let reinternacoes = 0;
  let altas_total = 0;

  // Group patients by CNS only (not name fallback) - skip patients without CNS
  const patientGroups = patients.reduce((acc, patient) => {
    if (!patient.cns) return acc; // Skip patients without CNS
    const identifier = patient.cns.toString();
    if (!acc[identifier]) {
      acc[identifier] = [];
    }
    acc[identifier].push(patient);
    return acc;
  }, {} as Record<string, PatientWithCNS[]>);

  Object.values(patientGroups).forEach(admissions => {
    const sortedAdmissions = admissions.sort((a, b) =>
      new Date(a.data_admissao).getTime() - new Date(b.data_admissao).getTime()
    );

    // Get all discharge dates (excluding null/undefined)
    const datas_alta = sortedAdmissions
      .map(admission => admission.data_alta)
      .filter(alta => alta !== null && alta !== undefined) as string[];

    const datas_adm = sortedAdmissions.map(admission => admission.data_admissao);

    // Count readmissions: for each discharge that has a next admission
    for (let i = 0; i < datas_alta.length - 1; i++) {
      altas_total += 1;
      const dischargeDate = new Date(datas_alta[i]);
      const nextAdmissionDate = new Date(datas_adm[i + 1]);

      const daysBetween = Math.floor(
        (nextAdmissionDate.getTime() - dischargeDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (daysBetween > 0 && daysBetween <= days) {
        reinternacoes++;
      }
    }

    // Add the last discharge to total (if exists)
    if (datas_alta.length > 0) {
      altas_total += 1;
    }
  });

  return altas_total > 0 ? (reinternacoes / altas_total * 100) : 0;
};

/**
 * Formata um número decimal para o padrão brasileiro (vírgula como separador decimal).
 * Sempre retorna o número com a quantidade especificada de casas decimais.
 *
 * @param num Número a ser formatado
 * @param decimals Quantidade de casas decimais (padrão: 1)
 * @returns String formatada no padrão brasileiro (ex: "5,3", "12,0")
 */
export const formatDecimalBR = (num: number, decimals: number = 1): string => {
  return num.toFixed(decimals).replace('.', ',');
};
