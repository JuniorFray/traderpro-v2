import { useState, useEffect } from "react"
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom"
import { useAuth } from "../../features/auth/AuthContext"
import { NotificationCenter } from "../notifications/NotificationCenter"
import { NotificationPopup } from "../notifications/NotificationPopup"
import { getUserNotifications, markNotificationAsRead, getUserNotificationStatus } from "../../services/notifications"

const menuItems = [
  { path: "/", icon: "📊", label: "Dashboard" },
  { path: "/trades", icon: "💹", label: "Trades" },
  { path: "/calendar", icon: "📅", label: "Calendário" },
  { path: "/analytics", icon: "📈", label: "Análises" },
  { path: "/charts", icon: "📉", label: "Gráficos" },
  { path: "/reports", icon: "📄", label: "Relatórios" },
  { path: "/settings", icon: "⚙️", label: "Configurações" },
  { path: "/tools", icon: "🧮", label: "Ferramentas" }
]

export const MainLayout = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, isPro, signOut } = useAuth()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  
  // ✅ Estados para notificações
  const [showNotifications, setShowNotifications] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [readStatus, setReadStatus] = useState({})
  const [unreadCount, setUnreadCount] = useState(0)
  const [popupNotifications, setPopupNotifications] = useState([])
  const [shownPopupIds, setShownPopupIds] = useState(new Set())

  // ✅ Buscar notificações ao carregar
  useEffect(() => {
    if (user) {
      loadNotifications()
      // Recarregar notificações a cada 30 segundos
      const interval = setInterval(loadNotifications, 30000)
      return () => clearInterval(interval)
    }
  }, [user, isPro])

  const loadNotifications = async () => {
    try {
      const notifs = await getUserNotifications(user.uid, isPro)
      const status = await getUserNotificationStatus(user.uid)
      
      setNotifications(notifs)
      setReadStatus(status)
      
      // Contar não lidas
      const unread = notifs.filter(n => !status[n.id]?.read).length
      setUnreadCount(unread)

      // ✅ Mostrar popup apenas para notificações novas não lidas
      const newNotifications = notifs
        .filter(n => !status[n.id]?.read && !shownPopupIds.has(n.id))
        .slice(0, 1) // Mostra apenas 1 por vez

      if (newNotifications.length > 0) {
        setPopupNotifications(newNotifications)
        setShownPopupIds(prev => {
          const newSet = new Set(prev)
          newNotifications.forEach(n => newSet.add(n.id))
          return newSet
        })
      }
    } catch (error) {
      console.error('Erro ao carregar notificações:', error)
    }
  }

  const handleMarkAsRead = async (notificationId) => {
    try {
      await markNotificationAsRead(user.uid, notificationId)
      
      // Atualizar status localmente
      setReadStatus(prev => ({
        ...prev,
        [notificationId]: { read: true, readAt: new Date() }
      }))
      
      // Atualizar contador
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (error) {
      console.error('Erro ao marcar como lida:', error)
    }
  }

  const handleLogout = async () => {
    if (window.confirm("Deseja sair?")) {
      await signOut()
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
          
          <div className="flex items-center gap-3">
            {/* Botão de Notificações Mobile */}
            <button
              onClick={() => setShowNotifications(true)}
              className="relative text-white text-2xl p-2 hover:bg-zinc-800 rounded-lg transition-colors"
            >
              🔔
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-white text-2xl p-2"
            >
              {isMobileMenuOpen ? "✕" : "☰"}
            </button>
          </div>
        </div>
      </div>

      {/* Sidebar Desktop */}
      <div className="hidden lg:block fixed left-0 top-0 h-full w-64 bg-zinc-900 border-r border-zinc-800">
        <div className="p-6">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl font-bold text-white">💹 TraderPro</h1>
            
            {/* Botão de Notificações Desktop */}
            <button
              onClick={() => setShowNotifications(true)}
              className="relative text-white text-xl p-2 hover:bg-zinc-800 rounded-lg transition-colors"
            >
              🔔
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>
          </div>

          <nav className="space-y-1 overflow-y-auto max-h-[calc(100vh-300px)]">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
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
              {isPro && (
                <span className="inline-block mt-2 text-xs bg-yellow-500/20 text-yellow-300 px-2 py-0.5 rounded-full">
                  👑 PRO
                </span>
              )}
            </div>
            <button
              onClick={handleLogout}
              className="w-full px-4 py-2 bg-red-900/20 hover:bg-red-900/30 text-red-400 rounded-lg transition-colors"
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
                  className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-colors text-left ${
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
                {isPro && (
                  <span className="inline-block mt-2 text-xs bg-yellow-500/20 text-yellow-300 px-2 py-0.5 rounded-full">
                    👑 PRO
                  </span>
                )}
              </div>
              <button
                onClick={handleLogout}
                className="w-full px-4 py-2 bg-red-900/20 hover:bg-red-900/30 text-red-400 rounded-lg transition-colors"
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

      {/* ✅ Modal de Notificações */}
      <NotificationCenter
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
        notifications={notifications}
        readStatus={readStatus}
        onMarkAsRead={handleMarkAsRead}
      />

      {/* ✅ Popups de Notificações */}
      {popupNotifications.map((notif) => (
        <NotificationPopup
          key={notif.id}
          notification={notif}
          onClose={() => {
            setPopupNotifications(prev => prev.filter(n => n.id !== notif.id))
          }}
          onMarkAsRead={handleMarkAsRead}
        />
      ))}
    </div>
  )
}
