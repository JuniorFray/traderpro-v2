import { useState, useEffect } from 'react'
import { Icons } from '../icons'

export const NotificationPopup = ({ notification, onClose, onRead }) => {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Animação de entrada
    setTimeout(() => setIsVisible(true), 100)
  }, [])

  const handleClose = () => {
    setIsVisible(false)
    setTimeout(onClose, 300)
  }

  const handleAction = () => {
    if (notification.actionButton?.url) {
      window.location.href = notification.actionButton.url
    }
    onRead(notification.id)
    handleClose()
  }

  const getStyleClasses = () => {
    const styles = {
      info: 'bg-blue-500/20 border-blue-500/50 text-blue-200',
      success: 'bg-green-500/20 border-green-500/50 text-green-200',
      warning: 'bg-yellow-500/20 border-yellow-500/50 text-yellow-200',
      error: 'bg-red-500/20 border-red-500/50 text-red-200'
    }
    return styles[notification.style] || styles.info
  }

  const getIcon = () => {
    const icons = {
      news: '🎉',
      warning: '⚠️',
      promo: '🎁',
      tips: '💡',
      system: '🔧'
    }
    return icons[notification.category] || '🔔'
  }

  return (
    <div 
      className={`fixed top-20 right-4 z-50 w-96 max-w-[calc(100vw-2rem)] transition-all duration-300 ${
        isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      }`}
    >
      <div className={`rounded-xl border-2 backdrop-blur-lg p-4 shadow-2xl ${getStyleClasses()}`}>
        <div className="flex items-start gap-3">
          <div className="text-3xl">{getIcon()}</div>
          
          <div className="flex-1">
            <h3 className="font-bold text-white text-lg mb-1">
              {notification.title}
            </h3>
            <p className="text-sm opacity-90 mb-3">
              {notification.message}
            </p>
            
            {notification.actionButton && (
              <button
                onClick={handleAction}
                className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                {notification.actionButton.text}
              </button>
            )}
          </div>

          <button
            onClick={handleClose}
            className="text-white/60 hover:text-white transition-colors p-1"
          >
            <Icons.X size={20} />
          </button>
        </div>
      </div>
    </div>
  )
}
