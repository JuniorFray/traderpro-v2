import { useAuth } from "../../features/auth/AuthContext"
import { Card } from "../../components/ui/Card"
import { Button } from "../../components/ui/Button"
import { useState } from "react"

export const Settings = () => {
  const { user, signOut } = useAuth()
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const handleLogout = async () => {
    if (window.confirm("Tem certeza que deseja sair?")) {
      await signOut()
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Configurações</h2>
        <p className="text-zinc-400">Gerencie sua conta e preferências</p>
      </div>

      {/* Informações da Conta */}
      <Card>
        <h3 className="text-lg font-bold text-white mb-4">?? Informações da Conta</h3>
        <div className="space-y-3">
          <div>
            <label className="text-sm text-zinc-400">Email</label>
            <div className="text-white font-medium">{user?.email || "Não disponível"}</div>
          </div>
          <div>
            <label className="text-sm text-zinc-400">ID do Usuário</label>
            <div className="text-white font-mono text-sm">{user?.uid || "Não disponível"}</div>
          </div>
        </div>
      </Card>

      {/* Ações da Conta */}
      <Card>
        <h3 className="text-lg font-bold text-white mb-4">?? Segurança</h3>
        <div className="space-y-4">
          <Button
            onClick={handleLogout}
            className="w-full bg-yellow-600 hover:bg-yellow-700"
          >
            ?? Sair da Conta
          </Button>

          <div className="border-t border-zinc-800 pt-4">
            <p className="text-zinc-400 text-sm mb-3">
              ?? Zona de perigo: Esta ação não pode ser desfeita
            </p>
            {!showDeleteConfirm ? (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="w-full px-4 py-2 bg-red-900/30 hover:bg-red-900/50 text-red-400 border border-red-800 rounded-lg transition-colors"
              >
                ??? Excluir Conta Permanentemente
              </button>
            ) : (
              <div className="space-y-2">
                <p className="text-red-400 text-sm font-semibold">
                  Tem certeza? Todos os seus dados serão perdidos!
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="flex-1 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => alert("Funcionalidade em desenvolvimento")}
                    className="flex-1 px-4 py-2 bg-loss hover:bg-red-700 text-white rounded-lg font-bold"
                  >
                    Confirmar Exclusão
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Informações do Sistema */}
      <Card>
        <h3 className="text-lg font-bold text-white mb-4">?? Sobre o Sistema</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-zinc-400">Versão</span>
            <span className="text-white font-mono">2.0.0</span>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-400">Desenvolvido por</span>
            <span className="text-white">TraderPro Team</span>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-400">Banco de Dados</span>
            <span className="text-white">Firebase Firestore</span>
          </div>
        </div>
      </Card>
    </div>
  )
}
