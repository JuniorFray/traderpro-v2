import { useAuth } from "../features/auth/AuthContext"
import { Button } from "../components/ui/Button"
import { Card } from "../components/ui/Card"
import { Icons } from "../components/icons"

export const HomePage = () => {
  const { user, userData, signOut } = useAuth()

  const handleLogout = async () => {
    await signOut()
  }

  return (
    <div className="min-h-screen bg-bg p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-black text-white mb-2">
              Olá, <span className="text-win">{user?.email?.split("@")[0]}</span>! 👋
            </h1>
            <p className="text-zinc-500 text-sm">Bem-vindo ao TraderPro v2.0</p>
          </div>
          <Button variant="ghost" onClick={handleLogout}>
            <Icons.LogOut size={20} className="mr-2" />
            Sair
          </Button>
        </div>

        {/* Status */}
        <Card>
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Icons.Settings size={20} className="text-win" />
            Sistema Autenticado
          </h2>
          <div className="space-y-2">
            <p className="text-zinc-300 text-sm flex items-center gap-2">
              <span className="w-2 h-2 bg-win rounded-full animate-pulse"></span>
              ✅ Login funcionando
            </p>
            <p className="text-zinc-300 text-sm flex items-center gap-2">
              <span className="w-2 h-2 bg-win rounded-full animate-pulse"></span>
              ✅ Rotas protegidas
            </p>
            <p className="text-zinc-300 text-sm flex items-center gap-2">
              <span className="w-2 h-2 bg-win rounded-full animate-pulse"></span>
              ✅ Firebase Auth conectado
            </p>
          </div>

          <div className="mt-6 p-4 bg-white/5 rounded-xl">
            <p className="text-xs text-zinc-500 font-mono">User ID:</p>
            <p className="text-sm text-zinc-300 font-mono break-all">{user?.uid}</p>
          </div>
        </Card>

        {/* Próximos Passos */}
        <Card>
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Icons.Chart size={20} className="text-accent" />
            Próximos Passos
          </h2>
          <div className="space-y-3">
            <div className="p-3 bg-white/5 rounded-lg">
              <p className="text-zinc-300 text-sm font-bold">Passo 5: Sistema de Trades</p>
              <p className="text-zinc-500 text-xs mt-1">CRUD + formulários + calendário</p>
            </div>
            <div className="p-3 bg-white/5 rounded-lg opacity-50">
              <p className="text-zinc-300 text-sm font-bold">Passo 6: Dashboard</p>
              <p className="text-zinc-500 text-xs mt-1">Métricas + gráficos</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}

