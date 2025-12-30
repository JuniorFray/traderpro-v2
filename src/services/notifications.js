import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs, 
  getDoc,
  query, 
  where, 
  orderBy,
  onSnapshot,
  setDoc,
  serverTimestamp 
} from 'firebase/firestore'
import { db } from './firebase'

const NOTIFICATIONS_PATH = 'artifacts/trade-journal-public/notifications'

// ==================== ADMIN ====================

// Criar notificação
export const createNotification = async (notificationData) => {
  try {
    const notificationsRef = collection(db, NOTIFICATIONS_PATH)
    const docRef = await addDoc(notificationsRef, {
      ...notificationData,
      createdAt: serverTimestamp(),
      createdBy: 'admin',
      isActive: true,
      viewCount: 0
    })
    return { success: true, id: docRef.id }
  } catch (error) {
    console.error('Erro ao criar notificação:', error)
    return { success: false, error: error.message }
  }
}

// Atualizar notificação
export const updateNotification = async (notificationId, data) => {
  try {
    const notificationRef = doc(db, NOTIFICATIONS_PATH, notificationId)
    await updateDoc(notificationRef, {
      ...data,
      updatedAt: serverTimestamp()
    })
    return { success: true }
  } catch (error) {
    console.error('Erro ao atualizar notificação:', error)
    return { success: false, error: error.message }
  }
}

// Deletar notificação
export const deleteNotification = async (notificationId) => {
  try {
    const notificationRef = doc(db, NOTIFICATIONS_PATH, notificationId)
    await deleteDoc(notificationRef)
    return { success: true }
  } catch (error) {
    console.error('Erro ao deletar notificação:', error)
    return { success: false, error: error.message }
  }
}

// Listar todas as notificações (Admin)
export const getAllNotifications = async () => {
  try {
    const notificationsRef = collection(db, NOTIFICATIONS_PATH)
    const q = query(notificationsRef, orderBy('createdAt', 'desc'))
    const snapshot = await getDocs(q)
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      scheduledFor: doc.data().scheduledFor?.toDate()
    }))
  } catch (error) {
    console.error('Erro ao listar notificações:', error)
    return []
  }
}

// ==================== USUÁRIO ====================

// Buscar notificações do usuário
export const getUserNotifications = async (userId, isPro) => {
  try {
    const notificationsRef = collection(db, NOTIFICATIONS_PATH)
    const snapshot = await getDocs(notificationsRef)
    
    const now = new Date()
    
    return snapshot.docs
      .map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        scheduledFor: doc.data().scheduledFor?.toDate()
      }))
      .filter(notif => {
        // Verificar se está ativa
        if (!notif.isActive) return false
        
        // Verificar agendamento
        if (notif.scheduledFor && notif.scheduledFor > now) return false
        
        // Verificar tipo
        if (notif.type === 'individual' && notif.targetUserId !== userId) return false
        if (notif.type === 'pro' && !isPro) return false
        if (notif.type === 'free' && isPro) return false
        
        return true
      })
      .sort((a, b) => b.createdAt - a.createdAt)
  } catch (error) {
    console.error('Erro ao buscar notificações:', error)
    return []
  }
}

// Listener em tempo real
export const subscribeToNotifications = (userId, isPro, callback) => {
  const notificationsRef = collection(db, NOTIFICATIONS_PATH)
  
  return onSnapshot(notificationsRef, (snapshot) => {
    const now = new Date()
    
    const notifications = snapshot.docs
      .map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        scheduledFor: doc.data().scheduledFor?.toDate()
      }))
      .filter(notif => {
        if (!notif.isActive) return false
        if (notif.scheduledFor && notif.scheduledFor > now) return false
        if (notif.type === 'individual' && notif.targetUserId !== userId) return false
        if (notif.type === 'pro' && !isPro) return false
        if (notif.type === 'free' && isPro) return false
        return true
      })
      .sort((a, b) => b.createdAt - a.createdAt)
    
    callback(notifications)
  })
}

// Marcar como lida
export const markAsRead = async (userId, notificationId) => {
  try {
    const statusRef = doc(
      db, 
      `artifacts/trade-journal-public/users/${userId}/notificationStatus`, 
      notificationId
    )
    
    await setDoc(statusRef, {
      read: true,
      readAt: serverTimestamp()
    })
    
    return { success: true }
  } catch (error) {
    console.error('Erro ao marcar como lida:', error)
    return { success: false, error: error.message }
  }
}

// Verificar se notificação foi lida
export const getNotificationStatus = async (userId, notificationId) => {
  try {
    const statusRef = doc(
      db, 
      `artifacts/trade-journal-public/users/${userId}/notificationStatus`, 
      notificationId
    )
    
    const statusDoc = await getDoc(statusRef)
    return statusDoc.exists() ? statusDoc.data() : { read: false }
  } catch (error) {
    console.error('Erro ao verificar status:', error)
    return { read: false }
  }
}

// Buscar status de múltiplas notificações
export const getMultipleNotificationStatus = async (userId, notificationIds) => {
  try {
    const statusPromises = notificationIds.map(id => getNotificationStatus(userId, id))
    const statuses = await Promise.all(statusPromises)
    
    return notificationIds.reduce((acc, id, index) => {
      acc[id] = statuses[index]
      return acc
    }, {})
  } catch (error) {
    console.error('Erro ao buscar múltiplos status:', error)
    return {}
  }
}

// Incrementar contador de visualizações
export const incrementViewCount = async (notificationId) => {
  try {
    const notificationRef = doc(db, NOTIFICATIONS_PATH, notificationId)
    const notificationDoc = await getDoc(notificationRef)
    
    if (notificationDoc.exists()) {
      const currentCount = notificationDoc.data().viewCount || 0
      await updateDoc(notificationRef, {
        viewCount: currentCount + 1
      })
    }
    
    return { success: true }
  } catch (error) {
    console.error('Erro ao incrementar views:', error)
    return { success: false, error: error.message }
  }
}
