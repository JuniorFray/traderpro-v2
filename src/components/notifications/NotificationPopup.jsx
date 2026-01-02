import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

export const NotificationPopup = ({ notification, onClose, onMarkAsRead }) => {
  const navigate = useNavigate()
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    // Auto-fechar após 8 segundos
    const timer = setTimeout(() => {
      handleClose()
    }, 8000)

    return () => clearTimeout(timer)
  }, [])

  const handleClose = () => {
    setIsVisible(false)
    setTimeout(() => {
      onClose()
    }, 300)
  }

  const handleAction = () => {
    if (notification.actionButton?.url) {
      navigate(notification.actionButton.url)
    }
    onMarkAsRead(notification.id)
    handleClose()
  }

  const getStyleClasses = (style) => {
    const styles = {
      info: 'bg-blue-500/20 border-blue-500',
      success: 'bg-green-500/20 border-green-500',
      warning: 'bg-yellow-500/20 border-yellow-500',
      error: 'bg-red-500/20 border-red-500'
    }
    return styles[style] || styles.info
  }

  const getIcon = (category) => {
    const icons = {
      news: '🎉',
      warning: '⚠️',
      promotion: '🎁',
      tip: '💡',
      system: '🔧'
    }
    return icons[category] || '🔔'
  }

  return (
    <div
      className={`fixed top-20 right-4 w-80 max-w-[calc(100vw-2rem)] z-[9999] transition-all duration-300 ${
        isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      }`}
    >
      <div
        className={`backdrop-blur-xl rounded-xl border-2 shadow-2xl p-4 ${getStyleClasses(
          notification.style
        )}`}
      >
        {/* Header com ícone e botão fechar */}
        <div className="flex items-start gap-3 mb-3">
          <div className="text-3xl">{getIcon(notification.category)}</div>
          
          <div className="flex-1">
            <h4 className="font-bold text-white text-lg mb-1">
              {notification.title}
            </h4>
            <p className="text-sm text-zinc-200 leading-relaxed">
              {notification.message}
            </p>
          </div>

          <button
            onClick={handleClose}
            className="text-zinc-400 hover:text-white transition-colors text-xl"
          >
            ✕
          </button>
        </div>

        {/* Botão de ação */}
        {notification.actionButton?.text && (
          <button
            onClick={handleAction}
            className="w-full mt-3 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            {notification.actionButton.text} →
          </button>
        )}

        {/* Barra de progresso */}
        <div className="mt-3 h-1 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-white/50 animate-shrink"
            style={{
              animation: 'shrink 8s linear forwards'
            }}
          />
        </div>
      </div>

      <style>{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  )
}

