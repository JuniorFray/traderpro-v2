import { Modal } from '../ui'

export const NotificationCenter = ({ 
  isOpen, 
  onClose, 
  notifications, 
  readStatus,
  onMarkAsRead 
}) => {
  const getStyleClasses = (style) => {
    const styles = {
      info: 'bg-blue-500/10 border-blue-500/30',
      success: 'bg-green-500/10 border-green-500/30',
      warning: 'bg-yellow-500/10 border-yellow-500/30',
      error: 'bg-red-500/10 border-red-500/30'
    }
    return styles[style] || styles.info
  }

  const getIcon = (category) => {
    const icons = {
      news: '🎉',
      warning: '⚠️',
      promo: '🎁',
      tips: '💡',
      system: '🔧'
    }
    return icons[category] || '🔔'
  }

  const formatDate = (date) => {
    if (!date) return ''
    const now = new Date()
    const diff = now - date
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (hours < 1) return 'Agora'
    if (hours < 24) return `${hours}h atrás`
    if (days < 7) return `${days}d atrás`
    return date.toLocaleDateString('pt-BR')
  }

  const handleAction = (notification) => {
    if (notification.actionButton?.url) {
      window.location.href = notification.actionButton.url
    }
    onMarkAsRead(notification.id)
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="🔔 Notificações" size="lg">
      <div className="space-y-3 max-h-[60vh] overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="text-center py-8 text-zinc-500">
            <div className="text-5xl mb-3">📭</div>
            <p>Nenhuma notificação</p>
          </div>
        ) : (
          notifications.map(notif => (
            <div
              key={notif.id}
              className={`rounded-lg border p-4 transition-all ${getStyleClasses(notif.style)} ${
                !readStatus[notif.id]?.read ? 'ring-2 ring-primary/50' : 'opacity-70'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="text-2xl">{getIcon(notif.category)}</div>
                
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-1">
                    <h4 className="font-bold text-white">
                      {notif.title}
                      {!readStatus[notif.id]?.read && (
                        <span className="ml-2 text-xs bg-primary text-black px-2 py-0.5 rounded-full">
                          Nova
                        </span>
                      )}
                    </h4>
                    <span className="text-xs text-zinc-500">
                      {formatDate(notif.createdAt)}
                    </span>
                  </div>
                  
                  <p className="text-sm text-zinc-300 mb-3">
                    {notif.message}
                  </p>

                  <div className="flex gap-2">
                    {notif.actionButton && (
                      <button
                        onClick={() => handleAction(notif)}
                        className="bg-primary hover:bg-primary/80 text-black px-3 py-1 rounded-lg text-sm font-medium transition-colors"
                      >
                        {notif.actionButton.text}
                      </button>
                    )}
                    
                    {!readStatus[notif.id]?.read && (
                      <button
                        onClick={() => onMarkAsRead(notif.id)}
                        className="bg-zinc-700 hover:bg-zinc-600 text-white px-3 py-1 rounded-lg text-sm transition-colors"
                      >
                        Marcar como lida
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </Modal>
  )
}
