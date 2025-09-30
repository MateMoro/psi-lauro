import { useAuth } from '@/hooks/useAuth';
import { useUserManagement } from '@/contexts/UserManagementContext';

// Import UserProfile type from UserManagementContext
type UserProfile = {
  id: string;
  user_id: string;
  email: string;
  nome: string;
  role: 'coordenador' | 'gestor_caps';
  caps_id: string | null;
  hospital_id: string | null;
  ativo: boolean;
  created_at: string;
  updated_at: string;
  caps?: { nome: string };
  hospitais?: { nome: string };
};
import UserCapsAssociations from '@/components/UserCapsAssociations';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, DialogTrigger as AlertDialogTrigger, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Settings, Shield, User, Database, UserPlus, Edit, Trash2, KeyRound, RefreshCw, Lock } from 'lucide-react';
import { getRoleDisplayName } from '@/utils/permissions';
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';


export default function Configuracoes() {
  const { user, profile, getUserRole } = useAuth();
  const userRole = getUserRole();
  const { toast } = useToast();
  const { 
    users, 
    caps, 
    hospitals, 
    loading: contextLoading, 
    refreshUsers, 
    refreshAll 
  } = useUserManagement();
  
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  
  // Form states
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showChangePasswordDialog, setShowChangePasswordDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    role: 'gestor_caps' as 'coordenador' | 'gestor_caps',
    caps_id: '',
    hospital_id: '',
    password: ''
  });

  // Password change form state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const refreshData = async () => {
    setRefreshing(true);
    await refreshAll();
    setRefreshing(false);
    toast({
      title: "Dados atualizados",
      description: "A lista de usuários foi atualizada com sucesso.",
    });
  };

  // Create new user
  const handleCreateUser = async () => {
    console.log('➕ [DEBUG] Starting user creation...');
    console.log('📝 [DEBUG] Form data for new user:', formData);
    
    setLoading(true);
    try {
      // First, create user in auth.users
      console.log('🔐 [DEBUG] Creating auth user...');
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      });

      console.log('🔐 [DEBUG] Auth creation response:', { authData, authError });

      if (authError) throw authError;

      if (authData.user) {
        // Then create profile
        const profileData = {
          user_id: authData.user.id,
          email: formData.email,
          nome: formData.nome,
          role: formData.role,
          caps_id: formData.caps_id === '' ? null : formData.caps_id,
          hospital_id: formData.hospital_id === 'none' ? null : formData.hospital_id === '' ? null : formData.hospital_id,
          ativo: true
        };
        
        console.log('👤 [DEBUG] Creating user profile with data:', profileData);
        
        const { error: profileError } = await supabase
          .from('user_profiles')
          .insert(profileData);

        console.log('👤 [DEBUG] Profile creation error:', profileError);

        if (profileError) throw profileError;

        toast({
          title: "Usuário criado com sucesso",
          description: `${formData.nome} foi adicionado ao sistema.`,
        });

        setShowCreateDialog(false);
        resetForm();
        await refreshUsers();
      }
    } catch (error: unknown) {
      console.error('Error creating user:', error);
      toast({
        title: "Erro ao criar usuário",
        description: error instanceof Error ? error.message : "Não foi possível criar o usuário.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Update user
  const handleUpdateUser = async () => {
    if (!selectedUser) return;
    
    console.log('🔍 [DEBUG] Starting user update...');
    console.log('📝 [DEBUG] Selected user:', selectedUser);
    console.log('📝 [DEBUG] Form data:', formData);
    
    // Prepare the update data
    const updateData = {
      nome: formData.nome,
      email: formData.email,
      role: formData.role,
      caps_id: formData.caps_id === '' ? null : formData.caps_id,
      hospital_id: formData.hospital_id === 'none' ? null : formData.hospital_id === '' ? null : formData.hospital_id,
      updated_at: new Date().toISOString()
    };
    
    console.log('🔧 [DEBUG] Form caps_id value:', formData.caps_id);
    console.log('🔧 [DEBUG] Final caps_id for update:', updateData.caps_id);
    
    console.log('🚀 [DEBUG] Update data to be sent:', updateData);
    console.log('🎯 [DEBUG] Updating user with ID:', selectedUser.id);
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .update(updateData)
        .eq('id', selectedUser.id)
        .select();

      console.log('📨 [DEBUG] Supabase response data:', data);
      console.log('❌ [DEBUG] Supabase response error:', error);

      if (error) throw error;

      console.log('✅ [DEBUG] Update successful, showing toast...');
      toast({
        title: "Usuário atualizado",
        description: `${formData.nome} foi atualizado com sucesso.`,
      });

      setShowEditDialog(false);
      setSelectedUser(null);
      resetForm();
      
      console.log('🔄 [DEBUG] Refreshing users...');
      await refreshUsers();
      console.log('🔄 [DEBUG] Users refreshed');
    } catch (error: unknown) {
      console.error('💥 [DEBUG] Error updating user:', error);
      toast({
        title: "Erro ao atualizar usuário",
        description: error instanceof Error ? error.message : "Não foi possível atualizar o usuário.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      console.log('🏁 [DEBUG] Update process finished');
    }
  };

  // Delete user completely (hard delete)
  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    
    console.log('🗑️ [DEBUG] Starting user complete deletion...');
    console.log('👤 [DEBUG] Selected user for deletion:', selectedUser);
    
    setLoading(true);
    try {
      // Step 1: Delete from user_profiles table
      console.log('📋 [DEBUG] Deleting user profile from database...');
      const { error: profileError } = await supabase
        .from('user_profiles')
        .delete()
        .eq('id', selectedUser.id);

      if (profileError) {
        console.error('💥 [DEBUG] Error deleting profile:', profileError);
        throw profileError;
      }
      console.log('✅ [DEBUG] User profile deleted successfully');

      // Step 2: Delete from auth.users (admin function)
      console.log('🔐 [DEBUG] Deleting user from auth...');
      const { error: authError } = await supabase.auth.admin.deleteUser(selectedUser.user_id);
      
      if (authError) {
        console.error('💥 [DEBUG] Error deleting auth user:', authError);
        // If auth deletion fails, we could rollback profile deletion here
        console.warn('⚠️ [DEBUG] Profile was deleted but auth user could not be removed');
      } else {
        console.log('✅ [DEBUG] Auth user deleted successfully');
      }

      toast({
        title: "Usuário removido",
        description: `${selectedUser.nome} foi completamente removido do sistema.`,
      });

      setShowDeleteDialog(false);
      setSelectedUser(null);
      await refreshUsers();
    } catch (error: unknown) {
      console.error('💥 [DEBUG] Error deleting user:', error);
      toast({
        title: "Erro ao remover usuário",
        description: error instanceof Error ? error.message : "Não foi possível remover o usuário completamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Soft delete user (deactivate)
  const handleDeactivateUser = async () => {
    if (!selectedUser) return;
    
    console.log('⏸️ [DEBUG] Starting user deactivation...');
    console.log('👤 [DEBUG] Selected user for deactivation:', selectedUser);
    
    setLoading(true);
    try {
      // Deactivate instead of deleting
      const updateData = { 
        ativo: false,
        updated_at: new Date().toISOString()
      };
      
      console.log('🔄 [DEBUG] Deactivation data:', updateData);
      const { data, error } = await supabase
        .from('user_profiles')
        .update(updateData)
        .eq('id', selectedUser.id)
        .select();

      console.log('📨 [DEBUG] Deactivation response:', { data, error });

      if (error) throw error;

      toast({
        title: "Usuário desativado",
        description: `${selectedUser.nome} foi desativado do sistema.`,
      });

      setShowDeleteDialog(false);
      setSelectedUser(null);
      await refreshUsers();
    } catch (error: unknown) {
      console.error('💥 [DEBUG] Error deactivating user:', error);
      toast({
        title: "Erro ao desativar usuário",
        description: error instanceof Error ? error.message : "Não foi possível desativar o usuário.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Reset password
  const handleResetPassword = async (userProfile: UserProfile) => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(userProfile.email, {
        redirectTo: `${window.location.origin}/reset-password`
      });

      if (error) throw error;

      toast({
        title: "Email de redefinição enviado",
        description: `Um email para redefinir a senha foi enviado para ${userProfile.email}.`,
      });
    } catch (error: unknown) {
      console.error('Error resetting password:', error);
      toast({
        title: "Erro ao redefinir senha",
        description: error instanceof Error ? error.message : "Não foi possível enviar o email de redefinição.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Change current user password
  const handleChangePassword = async () => {
    if (!user) return;

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast({
        title: "Erro na confirmação",
        description: "A nova senha e a confirmação devem ser iguais.",
        variant: "destructive",
      });
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      toast({
        title: "Senha muito fraca",
        description: "A nova senha deve ter pelo menos 6 caracteres.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // First verify current password by attempting to sign in
      const { error: verifyError } = await supabase.auth.signInWithPassword({
        email: user.email!,
        password: passwordForm.currentPassword,
      });

      if (verifyError) {
        toast({
          title: "Senha atual incorreta",
          description: "A senha atual informada está incorreta.",
          variant: "destructive",
        });
        return;
      }

      // If verification successful, update password
      const { error } = await supabase.auth.updateUser({
        password: passwordForm.newPassword
      });

      if (error) throw error;

      toast({
        title: "Senha alterada com sucesso",
        description: "Sua senha foi alterada com sucesso.",
      });

      setShowChangePasswordDialog(false);
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error: unknown) {
      console.error('Error changing password:', error);
      toast({
        title: "Erro ao alterar senha",
        description: error instanceof Error ? error.message : "Não foi possível alterar a senha.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      nome: '',
      email: '',
      role: 'gestor_caps',
      caps_id: '',
      hospital_id: 'none',
      password: ''
    });
  };

  const openEditDialog = (userProfile: UserProfile) => {
    console.log('🔍 [DEBUG] Opening edit dialog for user:', userProfile);
    console.log('📝 [DEBUG] User caps_id:', userProfile.caps_id);
    console.log('📝 [DEBUG] User hospital_id:', userProfile.hospital_id);
    
    setSelectedUser(userProfile);
    const newFormData = {
      nome: userProfile.nome,
      email: userProfile.email,
      role: userProfile.role,
      caps_id: userProfile.caps_id || '',
      hospital_id: userProfile.hospital_id || 'none',
      password: ''
    };
    
    console.log('📝 [DEBUG] Setting form data:', newFormData);
    setFormData(newFormData);
    setShowEditDialog(true);
  };

  const openDeleteDialog = (userProfile: UserProfile) => {
    setSelectedUser(userProfile);
    setShowDeleteDialog(true);
  };

  if (userRole !== 'coordenador') {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center gap-3 mb-6">
          <Settings className="h-6 w-6 text-slate-700" />
          <h1 className="text-2xl font-bold text-slate-800">Configurações do Sistema</h1>
        </div>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <Shield className="mx-auto h-16 w-16 text-slate-400 mb-4" />
              <h3 className="text-lg font-semibold text-slate-700 mb-2">
                Acesso Restrito
              </h3>
              <p className="text-slate-500">
                Esta seção é restrita apenas para usuários com perfil de coordenador.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-emerald-50/20">
      <div className="space-y-8 p-6">
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-3">
            <div className="p-3 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 rounded-2xl shadow-xl shadow-blue-500/25">
              <Settings className="h-8 w-8 text-white drop-shadow-sm" />
            </div>
            <div>
              <h1 className="text-4xl font-black text-slate-800 tracking-tight">
                Configurações do Sistema
              </h1>
              <p className="text-lg text-slate-600 font-medium">
                Administração de usuários e configurações
              </p>
            </div>
          </div>
        </div>

        {/* Current User Information */}
        <Card className="border-0 bg-gradient-to-br from-white to-slate-50/50 shadow-xl backdrop-blur-sm ring-1 ring-slate-200/50 rounded-2xl">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-slate-800">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                <User className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-black tracking-tight">👤 Suas Informações</span>
            </CardTitle>
            <CardDescription>
              Detalhes do usuário atual e permissões de acesso
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-600">Nome</label>
                <p className="text-sm text-slate-800 mt-1 font-medium">
                  {profile?.nome || 'Não informado'}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600">Email</label>
                <p className="text-sm text-slate-800 mt-1 font-medium">{user?.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600">Função</label>
                <Badge variant="secondary" className="mt-1">
                  {userRole ? getRoleDisplayName(userRole) : 'Não definida'}
                </Badge>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600">Status</label>
                <Badge variant="default" className="mt-1 bg-green-100 text-green-800">
                  Ativo
                </Badge>
              </div>
            </div>
            
            <div className="pt-4 border-t border-slate-200">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-slate-800">Segurança da Conta</h4>
                  <p className="text-xs text-slate-600 mt-1">Gerencie a senha da sua conta</p>
                </div>
                <Dialog open={showChangePasswordDialog} onOpenChange={setShowChangePasswordDialog}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Lock className="h-4 w-4 mr-2" />
                      Alterar Senha
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Alterar Senha</DialogTitle>
                      <DialogDescription>
                        Para alterar sua senha, digite a senha atual e defina uma nova senha.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="current-password">Senha Atual</Label>
                        <Input
                          id="current-password"
                          type="password"
                          value={passwordForm.currentPassword}
                          onChange={(e) => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
                          placeholder="Digite sua senha atual"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="new-password">Nova Senha</Label>
                        <Input
                          id="new-password"
                          type="password"
                          value={passwordForm.newPassword}
                          onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                          placeholder="Digite a nova senha (mín. 6 caracteres)"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="confirm-password">Confirmar Nova Senha</Label>
                        <Input
                          id="confirm-password"
                          type="password"
                          value={passwordForm.confirmPassword}
                          onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                          placeholder="Digite novamente a nova senha"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="button" variant="outline" onClick={() => {
                        setShowChangePasswordDialog(false);
                        setPasswordForm({
                          currentPassword: '',
                          newPassword: '',
                          confirmPassword: ''
                        });
                      }}>
                        Cancelar
                      </Button>
                      <Button type="button" onClick={handleChangePassword} disabled={loading}>
                        {loading ? 'Alterando...' : 'Alterar Senha'}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* User Management */}
        <Card className="border-0 bg-gradient-to-br from-white to-slate-50/50 shadow-xl backdrop-blur-sm ring-1 ring-slate-200/50 rounded-2xl">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-3 text-slate-800">
                <div className="p-2 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl shadow-lg">
                  <User className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-black tracking-tight">👥 Gestão de Usuários</span>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={refreshData}
                  disabled={refreshing}
                  variant="outline"
                  size="sm"
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                  Atualizar
                </Button>
                <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                  <DialogTrigger asChild>
                    <Button size="sm" onClick={() => resetForm()}>
                      <UserPlus className="h-4 w-4 mr-2" />
                      Novo Usuário
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Criar Novo Usuário</DialogTitle>
                      <DialogDescription>
                        Adicione um novo usuário ao sistema com as permissões apropriadas.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="nome">Nome Completo</Label>
                        <Input
                          id="nome"
                          value={formData.nome}
                          onChange={(e) => setFormData({...formData, nome: e.target.value})}
                          placeholder="Digite o nome completo"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({...formData, email: e.target.value})}
                          placeholder="Digite o email"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="password">Senha Inicial</Label>
                        <Input
                          id="password"
                          type="password"
                          value={formData.password}
                          onChange={(e) => setFormData({...formData, password: e.target.value})}
                          placeholder="Digite a senha inicial"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="role">Função</Label>
                        <Select value={formData.role} onValueChange={(value: 'coordenador' | 'gestor_caps') => setFormData({...formData, role: value})}>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione a função" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="coordenador">Coordenador</SelectItem>
                            <SelectItem value="gestor_caps">Gestor CAPS</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      {formData.role === 'gestor_caps' && (
                        <div className="grid gap-2">
                          <Label htmlFor="caps">CAPS de Referência</Label>
                          <Select value={formData.caps_id} onValueChange={(value) => setFormData({...formData, caps_id: value})}>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o CAPS" />
                            </SelectTrigger>
                            <SelectContent>
                              {caps.map((cap) => (
                                <SelectItem key={cap.id} value={cap.id}>
                                  {cap.nome}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                      <div className="grid gap-2">
                        <Label htmlFor="hospital">Hospital (Opcional)</Label>
                        <Select value={formData.hospital_id} onValueChange={(value) => setFormData({...formData, hospital_id: value})}>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o hospital" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">Nenhum</SelectItem>
                            {hospitals.map((hospital) => (
                              <SelectItem key={hospital.id} value={hospital.id}>
                                {hospital.nome}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="button" variant="outline" onClick={() => setShowCreateDialog(false)}>
                        Cancelar
                      </Button>
                      <Button type="button" onClick={handleCreateUser} disabled={loading}>
                        {loading ? 'Criando...' : 'Criar Usuário'}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardTitle>
            <CardDescription>
              Cadastre, edite e gerencie usuários do sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            {(loading || contextLoading) && !refreshing ? (
              <div className="text-center py-8">
                <RefreshCw className="mx-auto h-8 w-8 animate-spin text-slate-400 mb-4" />
                <p className="text-slate-500">Carregando usuários...</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Função</TableHead>
                    <TableHead>CAPS/Hospital</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((userProfile) => (
                    <TableRow key={userProfile.id}>
                      <TableCell className="font-medium">{userProfile.nome}</TableCell>
                      <TableCell>{userProfile.email}</TableCell>
                      <TableCell>
                        <Badge variant={userProfile.role === 'coordenador' ? 'default' : 'secondary'}>
                          {getRoleDisplayName(userProfile.role)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {userProfile.caps?.nome || userProfile.hospitais?.nome || 'Não definido'}
                      </TableCell>
                      <TableCell>
                        <Badge variant={userProfile.ativo ? 'default' : 'destructive'}>
                          {userProfile.ativo ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openEditDialog(userProfile)}
                            disabled={loading}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleResetPassword(userProfile)}
                            disabled={loading}
                          >
                            <KeyRound className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openDeleteDialog(userProfile)}
                            disabled={loading || userProfile.user_id === user?.id}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* System Information */}
        <Card className="border-0 bg-gradient-to-br from-white to-slate-50/50 shadow-xl backdrop-blur-sm ring-1 ring-slate-200/50 rounded-2xl">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-slate-800">
              <div className="p-2 bg-gradient-to-br from-purple-500 to-violet-600 rounded-xl shadow-lg">
                <Database className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-black tracking-tight">⚙️ Informações do Sistema</span>
            </CardTitle>
            <CardDescription>
              Detalhes técnicos e versão do sistema
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <label className="font-medium text-slate-600">Sistema</label>
                <p className="text-slate-800 mt-1 font-medium">IntegraRAPS</p>
              </div>
              <div>
                <label className="font-medium text-slate-600">Versão</label>
                <p className="text-slate-800 mt-1 font-medium">v1.0 (01.09.2025)</p>
              </div>
              <div>
                <label className="font-medium text-slate-600">Ambiente</label>
                <p className="text-slate-800 mt-1 font-medium">Desenvolvimento</p>
              </div>
              <div>
                <label className="font-medium text-slate-600">Total de Usuários</label>
                <p className="text-slate-800 mt-1 font-medium">{users.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* User-CAPS Associations - Real-time display */}
        <UserCapsAssociations />

        {/* Edit User Dialog */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Editar Usuário</DialogTitle>
              <DialogDescription>
                Atualize as informações do usuário selecionado.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-nome">Nome Completo</Label>
                <Input
                  id="edit-nome"
                  value={formData.nome}
                  onChange={(e) => {
                    console.log('✏️ [DEBUG] Name changed to:', e.target.value);
                    setFormData({...formData, nome: e.target.value});
                  }}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-email">Email</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-role">Função</Label>
                <Select value={formData.role} onValueChange={(value: 'coordenador' | 'gestor_caps') => setFormData({...formData, role: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="coordenador">Coordenador</SelectItem>
                    <SelectItem value="gestor_caps">Gestor CAPS</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {formData.role === 'gestor_caps' && (
                <div className="grid gap-2">
                  <Label htmlFor="edit-caps">CAPS de Referência</Label>
                  <Select value={formData.caps_id} onValueChange={(value) => {
                    console.log('📋 [DEBUG] CAPS selection changed:', value);
                    setFormData({...formData, caps_id: value});
                  }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o CAPS" />
                    </SelectTrigger>
                    <SelectContent>
                      {caps.map((cap) => (
                        <SelectItem key={cap.id} value={cap.id}>
                          {cap.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div className="grid gap-2">
                <Label htmlFor="edit-hospital">Hospital (Opcional)</Label>
                <Select value={formData.hospital_id} onValueChange={(value) => setFormData({...formData, hospital_id: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o hospital" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Nenhum</SelectItem>
                    {hospitals.map((hospital) => (
                      <SelectItem key={hospital.id} value={hospital.id}>
                        {hospital.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowEditDialog(false)}>
                Cancelar
              </Button>
              <Button type="button" onClick={handleUpdateUser} disabled={loading}>
                {loading ? 'Atualizando...' : 'Atualizar'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <AlertDialogTitle>Remover Usuário</AlertDialogTitle>
              <AlertDialogDescription className="space-y-2">
                <p>Como você deseja remover o usuário <strong>{selectedUser?.nome}</strong>?</p>
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm">
                  <p><strong>⏸️ Desativar:</strong> O usuário será desabilitado mas seus dados serão mantidos (pode ser reativado)</p>
                  <p><strong>🗑️ Remover Completamente:</strong> O usuário será removido permanentemente do sistema e da autenticação</p>
                </div>
              </AlertDialogDescription>
            </DialogHeader>
            <AlertDialogFooter className="flex-col sm:flex-row gap-2">
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <Button 
                variant="outline" 
                onClick={handleDeactivateUser} 
                disabled={loading}
                className="w-full sm:w-auto"
              >
                {loading ? 'Desativando...' : '⏸️ Desativar'}
              </Button>
              <AlertDialogAction 
                onClick={handleDeleteUser} 
                disabled={loading}
                className="bg-red-600 hover:bg-red-700 w-full sm:w-auto"
              >
                {loading ? 'Removendo...' : '🗑️ Remover Completamente'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

      </div>
    </div>
  );
}