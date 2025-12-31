import { createContext, useContext, useState, useEffect } from 'react'
import { useAuth } from '../features/auth/AuthContext'
import { getUserNotifications } from '../services/notifications'
import { NotificationPopup } from '../components/notifications/NotificationPopup'

const NotificationContext = createContext()

export const useNotifications = () => {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider')
  }
  return context
}

export const NotificationProvider = ({ children }) => {
  const { user } = useAuth()
  
  console.log('🔔 NotificationProvider renderizado, user:', user)
  
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [currentPopup, setCurrentPopup] = useState(null)
  const [shownNotifications, setShownNotifications] = useState([])

  // Carregar notificações quando usuário logar
  useEffect(() => {
    console.log('🔔 useEffect executado, user?.uid:', user?.uid)
    
    if (!user?.uid) {
      console.log('❌ Sem user.uid, não carregará notificações')
      return
    }

    console.log('🔔 Carregando notificações para:', user.uid)
    loadNotifications()

    // Atualizar a cada 5 minutos
    const interval = setInterval(loadNotifications, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [user?.uid])

  const loadNotifications = async () => {
    try {
      console.log('🔔 loadNotifications chamado para:', user?.uid)
      
      const userIsPro = user?.isPro || false
      console.log('🔔 userIsPro:', userIsPro)
      
      const notifs = await getUserNotifications(user.uid, userIsPro)
      
      console.log('✅ Notificações carregadas:', notifs.length, notifs)
      setNotifications(notifs)
      
      // Mostrar primeira notificação não lida
      const unshown = notifs.find(n => !shownNotifications.includes(n.id))
      if (unshown) {
        console.log('📢 Mostrando popup:', unshown)
        setCurrentPopup(unshown)
        setShownNotifications(prev => [...prev, unshown.id])
      }
      
      setUnreadCount(notifs.length)
    } catch (error) {
      console.error('❌ Erro ao carregar notificações:', error)
    }
  }

  const markAsRead = (notificationId) => {
    console.log('✅ Marcando como lida:', notificationId)
    setNotifications(prev => prev.filter(n => n.id !== notificationId))
    setUnreadCount(prev => Math.max(0, prev - 1))
  }

  const closePopup = () => {
    setCurrentPopup(null)
  }

  return (
    <NotificationContext.Provider value={{ 
      notifications, 
      unreadCount,
      loadNotifications,
      markAsRead
    }}>
      {children}
      
      {currentPopup && (
        <NotificationPopup
          notification={currentPopup}
          onClose={closePopup}
          onRead={markAsRead}
        />
      )}
    </NotificationContext.Provider>
  )
}
