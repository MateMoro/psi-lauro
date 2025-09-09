import { useUserManagement } from '@/contexts/UserManagementContext';
import { useAuth } from '@/hooks/useAuth';
import { Badge } from '@/components/ui/badge';
import { Users, Building2 } from 'lucide-react';

interface CapsUserInfoProps {
  className?: string;
}

export default function CapsUserInfo({ className = '' }: CapsUserInfoProps) {
  const { profile } = useAuth();
  const { getUsersByCAPS, caps } = useUserManagement();

  // If current user has a CAPS association, show other users in the same CAPS
  if (!profile?.caps_referencia) {
    return null;
  }

  // Find the CAPS by name (since profile stores name, not ID)
  const currentCAPS = caps.find(cap => cap.nome === profile.caps_referencia);
  
  if (!currentCAPS) {
    return null;
  }

  const capsUsers = getUsersByCAPS(currentCAPS.id);
  
  if (capsUsers.length <= 1) {
    return null; // Don't show if only current user or no users
  }

  return (
    <div className={`bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200/50 ${className}`}>
      <div className="flex items-center gap-2 mb-3">
        <Building2 className="h-4 w-4 text-blue-600" />
        <h4 className="font-bold text-slate-800 text-sm">Equipe do {currentCAPS.nome}</h4>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {capsUsers.map(user => (
          <div 
            key={user.id} 
            className={`flex items-center gap-1 rounded-md px-2 py-1 text-xs transition-all ${
              user.user_id === profile.user_id 
                ? 'bg-blue-600 text-white shadow-sm' 
                : 'bg-white text-slate-600 border border-slate-200/50'
            }`}
          >
            <Users className="h-3 w-3" />
            <span className="font-medium">
              {user.nome}
              {user.user_id === profile.user_id ? ' (você)' : ''}
            </span>
            {user.role === 'coordenador' && (
              <Badge variant="default" className="text-xs ml-1 h-4">
                Coord
              </Badge>
            )}
          </div>
        ))}
      </div>
      
      <p className="text-xs text-slate-500 mt-2">
        {capsUsers.length} membro{capsUsers.length !== 1 ? 's' : ''} ativo{capsUsers.length !== 1 ? 's' : ''} neste CAPS
      </p>
    </div>
  );
}