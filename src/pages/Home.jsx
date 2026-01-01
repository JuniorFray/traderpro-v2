import { useAuth } from '../features/auth/AuthContext'
import { TradesList } from '../features/trades/TradesList'
import { Button } from '../components/ui/Button'

export const Home = () => {
  const { user, signOut } = useAuth()

  const handleLogout = async () => {
    await signOut()
  }

  return (
    <div className="min-h-screen bg-bg p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black text-white mb-2">
              TraderPro v2.0
            </h1>
            <p className="text-zinc-400">Olá, {user?.email}! ??</p>
          </div>
          
          <Button variant="outline" onClick={handleLogout}>
            Sair
          </Button>
        </div>

        <TradesList />
      </div>
    </div>
  )
}
