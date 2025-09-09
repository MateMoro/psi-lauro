import { Bell } from "lucide-react";

export default function Notificacoes() {
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="space-y-6 lg:space-y-8">
        
        {/* Header Section */}
        <div className="mb-4 lg:mb-8">
          <div className="flex items-center gap-3 lg:gap-4 mb-3">
            <div className="p-2 lg:p-3 bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-700 rounded-xl lg:rounded-2xl shadow-xl shadow-blue-500/25">
              <Bell className="h-6 w-6 lg:h-8 lg:w-8 text-white drop-shadow-sm" />
            </div>
            <div>
              <h1 className="text-2xl lg:text-4xl font-black text-slate-800 tracking-tight">
                Central de Notificações
              </h1>
              <p className="text-sm lg:text-lg text-slate-600 font-medium">
                Alertas e notificações do sistema
              </p>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="bg-gradient-to-br from-slate-50 to-white shadow-lg backdrop-blur-sm ring-1 ring-slate-200/50 rounded-xl p-8">
          <div className="text-center py-12">
            <Bell className="mx-auto h-16 w-16 text-slate-400 mb-4" />
            <h3 className="text-lg font-semibold text-slate-700 mb-2">
              Central de Notificações em Desenvolvimento
            </h3>
            <p className="text-slate-500">
              Esta funcionalidade estará disponível em breve com sistema completo de alertas e notificações.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}