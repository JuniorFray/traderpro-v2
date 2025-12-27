import { useState } from "react"
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom"
import { useAuth } from "../../features/auth/AuthContext"

const menuItems = [
  { path: "/", icon: "📊", label: "Dashboard" },
  { path: "/trades", icon: "💹", label: "Trades" },
  { path: "/calendar", icon: "📅", label: "Calendário" },
  { path: "/analytics", icon: "📈", label: "Análises" },
  { path: "/charts", icon: "📉", label: "Gráficos" },
  { path: "/settings", icon: "⚙️", label: "Configurações" }
]

export const MainLayout = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const handleLogout = async () => {
    if (window.confirm("Deseja sair?")) {
      await logout()
    }
  }

  const handleMenuClick = (path) => {
    navigate(path)
    setIsMobileMenuOpen(false)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header Mobile */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-zinc-900 border-b border-zinc-800 z-50">
        <div className="flex items-center justify-between p-4">
          <h1 className="text-xl font-bold text-white">💹 TraderPro</h1>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="text-white text-2xl p-2"
          >
            {isMobileMenuOpen ? "✕" : "☰"}
          </button>
        </div>
      </div>

      {/* Sidebar Desktop */}
      <div className="hidden lg:block fixed left-0 top-0 h-full w-64 bg-zinc-900 border-r border-zinc-800">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-white mb-8">💹 TraderPro</h1>
          
          <nav className="space-y-2">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  location.pathname === item.path
                    ? "bg-primary text-white"
                    : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                <span className="font-medium">{item.label}</span>
              </Link>
            ))}
          </nav>

          <div className="absolute bottom-6 left-6 right-6">
            <div className="p-4 bg-zinc-800 rounded-lg mb-4">
              <p className="text-sm text-zinc-400 mb-1">Usuário</p>
              <p className="text-sm text-white truncate">{user?.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="w-full px-4 py-3 bg-red-900/20 hover:bg-red-900/30 text-red-400 rounded-lg transition-colors"
            >
              🚪 Sair
            </button>
          </div>
        </div>
      </div>

      {/* Menu Mobile */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 bg-black/50 z-40" onClick={() => setIsMobileMenuOpen(false)}>
          <div 
            className="fixed left-0 top-16 bottom-0 w-64 bg-zinc-900 shadow-2xl overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <nav className="p-4 space-y-2">
              {menuItems.map((item) => (
                <button
                  key={item.path}
                  onClick={() => handleMenuClick(item.path)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-left ${
                    location.pathname === item.path
                      ? "bg-primary text-white"
                      : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
                  }`}
                >
                  <span className="text-xl">{item.icon}</span>
                  <span className="font-medium">{item.label}</span>
                </button>
              ))}
            </nav>

            <div className="p-4 mt-4">
              <div className="p-4 bg-zinc-800 rounded-lg mb-4">
                <p className="text-sm text-zinc-400 mb-1">Usuário</p>
                <p className="text-sm text-white truncate">{user?.email}</p>
              </div>
              <button
                onClick={handleLogout}
                className="w-full px-4 py-3 bg-red-900/20 hover:bg-red-900/30 text-red-400 rounded-lg transition-colors"
              >
                🚪 Sair
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Conteúdo */}
      <div className="lg:ml-64 pt-16 lg:pt-0">
        <div className="p-4 lg:p-8">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
