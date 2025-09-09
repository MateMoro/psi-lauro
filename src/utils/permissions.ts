import { UserRole } from '@/contexts/auth-context';

export interface PagePermission {
  path: string;
  name: string;
  roles: UserRole[];
  description?: string;
}

export interface CAPSType {
  type: 'Adulto' | 'AD' | 'Infantil';
  name: string;
}

// Define page permissions based on user roles
export const PAGE_PERMISSIONS: PagePermission[] = [
  {
    path: '/dashboard',
    name: 'Visão Geral',
    roles: ['coordenador', 'gestor_caps'],
    description: 'Dashboard principal com métricas gerais'
  },
  {
    path: '/indicadores-assistenciais',
    name: 'Indicadores Assistenciais',
    roles: ['coordenador', 'gestor_caps'],
    description: 'Métricas de qualidade e desempenho'
  },
  {
    path: '/perfil-epidemiologico',
    name: 'Perfil Epidemiológico',
    roles: ['coordenador', 'gestor_caps'],
    description: 'Características demográficas dos pacientes'
  },
  {
    path: '/procedencia',
    name: 'Procedência',
    roles: ['coordenador', 'gestor_caps'],
    description: 'Origem e encaminhamentos dos pacientes'
  },
  {
    path: '/interconsultas',
    name: 'Interconsultas',
    roles: ['coordenador', 'gestor_caps'],
    description: 'Volume e análise de interconsultas'
  },
  {
    path: '/qualidade-satisfacao',
    name: 'Qualidade e Satisfação',
    roles: ['coordenador', 'gestor_caps'],
    description: 'Avaliação da experiência dos pacientes'
  },
  {
    path: '/sobre-servico',
    name: 'Institucional',
    roles: ['coordenador', 'gestor_caps'],
    description: 'Informações sobre o serviço'
  },
  {
    path: '/configuracoes',
    name: 'Configurações',
    roles: ['coordenador'],
    description: 'Configurações do sistema (apenas coordenador)'
  },
];

// CAPS types for filtering and comparison
export const CAPS_TYPES: CAPSType[] = [
  { type: 'Adulto', name: 'CAPS Adulto' },
  { type: 'AD', name: 'CAPS AD' },
  { type: 'Infantil', name: 'CAPS Infantil' },
];

/**
 * Check if a user role can access a specific page
 */
export function canAccessPage(userRole: UserRole | null, pagePath: string): boolean {
  if (!userRole) return false;

  const permission = PAGE_PERMISSIONS.find(p => p.path === pagePath);
  if (!permission) {
    // If page is not in permissions list, allow access by default
    // This prevents breaking existing functionality
    return true;
  }

  return permission.roles.includes(userRole);
}

/**
 * Get all pages accessible by a user role
 */
export function getAccessiblePages(userRole: UserRole | null): PagePermission[] {
  if (!userRole) return [];

  return PAGE_PERMISSIONS.filter(permission => 
    permission.roles.includes(userRole)
  );
}

/**
 * Check if user is coordinator (full access)
 */
export function isCoordinator(userRole: UserRole | null): boolean {
  return userRole === 'coordenador';
}

/**
 * Check if user is a CAPS manager (restricted to their CAPS)
 */
export function isCAPSManager(userRole: UserRole | null): boolean {
  return userRole === 'gestor_caps';
}

/**
 * Check if user is part of multiprofessional team (now equivalent to gestor_caps)
 */
export function isTeamMember(userRole: UserRole | null): boolean {
  return userRole === 'gestor_caps';
}

/**
 * Get CAPS type from CAPS reference name
 * This function attempts to determine the CAPS type based on naming patterns
 */
export function getCAPSType(capsReference: string): CAPSType['type'] | null {
  if (!capsReference) return null;

  const ref = capsReference.toLowerCase();
  
  if (ref.includes('ad') || ref.includes('álcool') || ref.includes('drogas')) {
    return 'AD';
  }
  
  if (ref.includes('infantil') || ref.includes('criança') || ref.includes('adolescente')) {
    return 'Infantil';
  }
  
  // Default to Adulto if no specific pattern is found
  return 'Adulto';
}

/**
 * Filter data based on user role and CAPS access
 * For CAPS managers, only show data from their CAPS and same-type CAPS for comparisons
 */
export function filterDataByUserAccess<T extends { caps_referencia?: string | null }>(
  data: T[],
  userRole: UserRole | null,
  userCAPSReference?: string | null
): T[] {
  if (!userRole) return [];

  // Coordinator sees all data
  if (isCoordinator(userRole)) {
    return data;
  }

  // CAPS manager sees only their CAPS data
  if (isCAPSManager(userRole) && userCAPSReference) {
    return data.filter(item => item.caps_referencia === userCAPSReference);
  }

  // Team members see all data (but no configuration access)
  if (isTeamMember(userRole)) {
    return data;
  }

  return [];
}

/**
 * Get comparable CAPS for benchmarking (same type)
 * Used for CAPS managers to compare with similar CAPS
 */
export function getComparableCAPSReferences(
  allCAPSReferences: string[],
  userCAPSReference: string
): string[] {
  const userCAPSType = getCAPSType(userCAPSReference);
  if (!userCAPSType) return [userCAPSReference];

  return allCAPSReferences.filter(caps => 
    getCAPSType(caps) === userCAPSType
  );
}

/**
 * Check if user can access configuration/settings
 */
export function canAccessSettings(userRole: UserRole | null): boolean {
  return isCoordinator(userRole);
}

/**
 * Get role display name in Portuguese
 */
export function getRoleDisplayName(userRole: UserRole): string {
  const roleNames: Record<UserRole, string> = {
    coordenador: 'Coordenador',
    gestor_caps: 'Gestor CAPS'
  };

  return roleNames[userRole] || 'Usuário';
}