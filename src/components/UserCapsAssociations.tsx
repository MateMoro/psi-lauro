import { useUserManagement } from '@/contexts/UserManagementContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Building2 } from 'lucide-react';

export default function UserCapsAssociations() {
  const { users, caps } = useUserManagement();

  // Get active users grouped by CAPS
  const usersByCAPS = caps.map(cap => ({
    caps: cap,
    users: users.filter(user => user.caps_id === cap.id && user.ativo)
  })).filter(item => item.users.length > 0);

  if (usersByCAPS.length === 0) {
    return (
      <Card className="border-0 bg-gradient-to-br from-white to-slate-50/50 shadow-xl backdrop-blur-sm ring-1 ring-slate-200/50 rounded-2xl">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3 text-slate-800">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
              <Building2 className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-black tracking-tight">🏥 Associações CAPS ↔ Usuários</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-500 text-center py-4">
            Nenhum usuário está associado aos CAPS no momento.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 bg-gradient-to-br from-white to-slate-50/50 shadow-xl backdrop-blur-sm ring-1 ring-slate-200/50 rounded-2xl">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-3 text-slate-800">
          <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
            <Building2 className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-black tracking-tight">🏥 Associações CAPS ↔ Usuários</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {usersByCAPS.map(({ caps, users: capsUsers }) => (
          <div key={caps.id} className="bg-slate-50/50 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <Building2 className="h-4 w-4 text-blue-600" />
              <h3 className="font-bold text-slate-800">{caps.nome}</h3>
              <Badge variant="secondary" className="text-xs">
                {caps.tipo} - {caps.municipio}
              </Badge>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {capsUsers.map(user => (
                <div 
                  key={user.id} 
                  className="flex items-center gap-2 bg-white rounded-lg px-3 py-2 shadow-sm border border-slate-200/50"
                >
                  <Users className="h-3 w-3 text-emerald-600" />
                  <span className="text-sm font-medium text-slate-700">
                    {user.nome}
                  </span>
                  <Badge 
                    variant={user.role === 'coordenador' ? 'default' : 'secondary'}
                    className="text-xs"
                  >
                    {user.role === 'coordenador' ? 'Coord.' : 'Gestor'}
                  </Badge>
                </div>
              ))}
            </div>
            
            <p className="text-xs text-slate-500 mt-2">
              {capsUsers.length} usuário{capsUsers.length !== 1 ? 's' : ''} associado{capsUsers.length !== 1 ? 's' : ''}
            </p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}