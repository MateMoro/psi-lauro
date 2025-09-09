import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { User, Lock, Save, Edit } from 'lucide-react';
import { getRoleDisplayName } from '@/utils/permissions';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export default function Perfil() {
  const { user, profile, getUserRole } = useAuth();
  const userRole = getUserRole();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(false);
  const [showChangePasswordDialog, setShowChangePasswordDialog] = useState(false);
  const [showEditProfileDialog, setShowEditProfileDialog] = useState(false);
  const [showPasswordSuccessModal, setShowPasswordSuccessModal] = useState(false);

  // Password change form state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Profile edit form state
  const [profileForm, setProfileForm] = useState({
    nome: profile?.nome || ''
  });
  
  // Local state for displaying updated name
  const [localNome, setLocalNome] = useState(profile?.nome || '');

  // Sync local state with profile when it loads
  useEffect(() => {
    if (profile?.nome) {
      setLocalNome(profile.nome);
      setProfileForm({ nome: profile.nome });
    }
  }, [profile?.nome]);

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
        setLoading(false);
        return;
      }

      // If verification successful, update password
      const { error } = await supabase.auth.updateUser({
        password: passwordForm.newPassword
      });

      if (error) throw error;

      console.log('🔑 Password updated successfully, showing modal...');
      
      setShowChangePasswordDialog(false);
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
      // Show success modal with slight delay to ensure previous dialog is closed
      setTimeout(() => {
        console.log('🎉 Setting showPasswordSuccessModal to true');
        setShowPasswordSuccessModal(true);
      }, 300);
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

  // Update profile information
  const handleUpdateProfile = async () => {
    if (!profile) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({
          nome: profileForm.nome,
          updated_at: new Date().toISOString()
        })
        .eq('id', profile.id);

      if (error) throw error;

      setShowEditProfileDialog(false);
      
      // Update local state to reflect changes immediately
      setLocalNome(profileForm.nome);
      
      toast({
        title: "Perfil atualizado",
        description: "Suas informações foram atualizadas com sucesso.",
      });
    } catch (error: unknown) {
      console.error('Error updating profile:', error);
      toast({
        title: "Erro ao atualizar perfil",
        description: error instanceof Error ? error.message : "Não foi possível atualizar suas informações.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-emerald-50/20">
      <div className="space-y-8 p-6">
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-3">
            <div className="p-3 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 rounded-2xl shadow-xl shadow-blue-500/25">
              <User className="h-8 w-8 text-white drop-shadow-sm" />
            </div>
            <div>
              <h1 className="text-4xl font-black text-slate-800 tracking-tight">
                Meu Perfil
              </h1>
              <p className="text-lg text-slate-600 font-medium">
                Gerencie suas informações pessoais e configurações
              </p>
            </div>
          </div>
        </div>

        {/* Profile Information */}
        <Card className="border-0 bg-gradient-to-br from-white to-slate-50/50 shadow-xl backdrop-blur-sm ring-1 ring-slate-200/50 rounded-2xl">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-3 text-slate-800">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                  <User className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-black tracking-tight">👤 Informações Pessoais</span>
              </div>
              <Dialog open={showEditProfileDialog} onOpenChange={setShowEditProfileDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" onClick={() => setProfileForm({ nome: profile?.nome || '' })}>
                    <Edit className="h-4 w-4 mr-2" />
                    Editar
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Editar Perfil</DialogTitle>
                    <DialogDescription>
                      Atualize suas informações pessoais.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="profile-nome">Nome Completo</Label>
                      <Input
                        id="profile-nome"
                        value={profileForm.nome}
                        onChange={(e) => setProfileForm({...profileForm, nome: e.target.value})}
                        placeholder="Digite seu nome completo"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setShowEditProfileDialog(false)}>
                      Cancelar
                    </Button>
                    <Button type="button" onClick={handleUpdateProfile} disabled={loading}>
                      <Save className="h-4 w-4 mr-2" />
                      {loading ? 'Salvando...' : 'Salvar'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardTitle>
            <CardDescription>
              Suas informações pessoais e dados da conta
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-600">Nome</label>
                <p className="text-sm text-slate-800 mt-1 font-medium">
                  {localNome || 'Não informado'}
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
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card className="border-0 bg-gradient-to-br from-white to-slate-50/50 shadow-xl backdrop-blur-sm ring-1 ring-slate-200/50 rounded-2xl">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-slate-800">
              <div className="p-2 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl shadow-lg">
                <Lock className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-black tracking-tight">🔒 Segurança da Conta</span>
            </CardTitle>
            <CardDescription>
              Configure a segurança da sua conta
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg bg-slate-50/50">
              <div>
                <h4 className="text-sm font-medium text-slate-800">Senha da Conta</h4>
                <p className="text-xs text-slate-600 mt-1">Altere sua senha para manter sua conta segura</p>
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
          </CardContent>
        </Card>

        {/* Success Modal for Password Change */}
        <AlertDialog open={showPasswordSuccessModal} onOpenChange={setShowPasswordSuccessModal}>
          <AlertDialogContent className="sm:max-w-[425px]">
            {console.log('🔍 Modal render - showPasswordSuccessModal:', showPasswordSuccessModal)}
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <div className="p-2 bg-green-100 rounded-full">
                  <Lock className="h-5 w-5 text-green-600" />
                </div>
                Senha Alterada com Sucesso!
              </AlertDialogTitle>
              <AlertDialogDescription className="text-center py-4">
                <div className="space-y-2">
                  <p className="text-lg font-medium text-green-800">✅ Sua senha foi alterada com sucesso!</p>
                  <p className="text-sm text-slate-600">
                    Sua conta agora está protegida com a nova senha. 
                    Mantenha-a segura e não a compartilhe com ninguém.
                  </p>
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogAction 
                onClick={() => setShowPasswordSuccessModal(false)}
                className="bg-green-600 hover:bg-green-700 w-full"
              >
                Entendi
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

      </div>
    </div>
  );
}