import { useState, useEffect } from 'react'

export const NotificationPopup = ({ notification, onClose, onMarkAsRead }) => {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    // Auto-fechar após 15 segundos
    const timer = setTimeout(() => {
      handleClose()
    }, 15000)

    return () => clearTimeout(timer)
  }, [])

  const handleClose = () => {
    setIsVisible(false)
    setTimeout(() => {
      onClose(notification.id)
    }, 300)
  }

  const handleMarkAsRead = () => {
    onMarkAsRead(notification.id)
    handleClose()
  }

  if (!isVisible) return null

  const typeStyles = {
    info: 'bg-blue-900/90 border-blue-500',
    success: 'bg-emerald-900/90 border-emerald-500',
    warning: 'bg-amber-900/90 border-amber-500',
    error: 'bg-red-900/90 border-red-500',
    promo: 'bg-purple-900/90 border-purple-500'
  }

  const typeIcons = {
    info: 'ℹ️',
    success: '✅',
    warning: '⚠️',
    error: '❌',
    promo: '🎉'
  }

  // ✅ CORRIGIDO: usar notification.style ao invés de notification.type
  const style = notification.style || 'info'

  return (
    <div
      className={`fixed bottom-6 right-6 max-w-md p-4 rounded-lg border-2 shadow-2xl z-50 transition-all ${
        isVisible ? 'animate-slide-in opacity-100' : 'opacity-0 translate-y-4'
      } ${typeStyles[style]}`}
    >
      <div className="flex items-start gap-3">
        <span className="text-3xl">{typeIcons[style]}</span>
        
        <div className="flex-1">
          <p className="text-white font-bold mb-1">{notification.title}</p>
          <p className="text-zinc-200 text-sm mb-3">{notification.message}</p>
          
          {/* ✅ Botão Marcar como Lida */}
          <button
            onClick={handleMarkAsRead}
            className="text-xs bg-white/20 hover:bg-white/30 text-white px-3 py-1.5 rounded transition font-medium"
          >
            ✓ Marcar como Lida
          </button>
        </div>

        {/* Botão X apenas fecha o popup */}
        <button
          onClick={handleClose}
          className="text-white/70 hover:text-white text-xl leading-none transition"
          title="Fechar (não marca como lida)"
        >
          ✕
        </button>
      </div>
    </div>
  )
}
