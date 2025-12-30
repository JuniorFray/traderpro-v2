import { 
  collection, 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore'
import { db } from './firebase'

const NOTIFICATIONS_COLLECTION = 'notifications'
const USER_NOTIFICATIONS_COLLECTION = 'userNotifications'

// Criar nova notificação
export const createNotification = async (notificationData) => {
  try {
    const notificationRef = doc(collection(db, NOTIFICATIONS_COLLECTION))
    
    const notification = {
      ...notificationData,
      id: notificationRef.id,
      isActive: true,
      createdAt: serverTimestamp(),
      stats: {
        views: 0,
        clicks: 0
      }
    }

    // Se tiver scheduledFor, converter para Timestamp
    if (notificationData.scheduledFor) {
      notification.scheduledFor = Timestamp.fromDate(new Date(notificationData.scheduledFor))
    }

    await setDoc(notificationRef, notification)
    return notificationRef.id
  } catch (error) {
    console.error('Erro ao criar notificação:', error)
    throw error
  }
}

// Atualizar notificação
export const updateNotification = async (notificationId, updates) => {
  try {
    const notificationRef = doc(db, NOTIFICATIONS_COLLECTION, notificationId)
    
    const updateData = {
      ...updates,
      updatedAt: serverTimestamp()
    }

    // Se tiver scheduledFor, converter para Timestamp
    if (updates.scheduledFor) {
      updateData.scheduledFor = Timestamp.fromDate(new Date(updates.scheduledFor))
    }

    await updateDoc(notificationRef, updateData)
  } catch (error) {
    console.error('Erro ao atualizar notificação:', error)
    throw error
  }
}

// Deletar notificação
export const deleteNotification = async (notificationId) => {
  try {
    const notificationRef = doc(db, NOTIFICATIONS_COLLECTION, notificationId)
    await deleteDoc(notificationRef)
  } catch (error) {
    console.error('Erro ao deletar notificação:', error)
    throw error
  }
}

// Listar todas as notificações (Admin)
export const getAllNotifications = async () => {
  try {
    const notificationsRef = collection(db, NOTIFICATIONS_COLLECTION)
    const q = query(notificationsRef, orderBy('createdAt', 'desc'))
    const snapshot = await getDocs(q)
    
    return snapshot.docs.map(doc => {
      const data = doc.data()
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.() || new Date(),
        updatedAt: data.updatedAt?.toDate?.() || null,
        scheduledFor: data.scheduledFor?.toDate?.() || null
      }
    })
  } catch (error) {
    console.error('Erro ao listar notificações:', error)
    throw error
  }
}

// Buscar notificações para um usuário específico
export const getUserNotifications = async (userId, userIsPro) => {
  try {
    const notificationsRef = collection(db, NOTIFICATIONS_COLLECTION)
    const now = Timestamp.now()
    
    // Buscar notificações ativas
    const queries = [
      // Global
      query(
        notificationsRef,
        where('type', '==', 'global'),
        where('isActive', '==', true)
      ),
      // Individual
      query(
        notificationsRef,
        where('type', '==', 'individual'),
        where('targetUserId', '==', userId),
        where('isActive', '==', true)
      ),
      // PRO ou Free baseado no status do usuário
      query(
        notificationsRef,
        where('type', '==', userIsPro ? 'pro' : 'free'),
        where('isActive', '==', true)
      )
    ]

    const results = await Promise.all(queries.map(q => getDocs(q)))
    const allDocs = results.flatMap(snapshot => snapshot.docs)
    
    // Filtrar notificações agendadas
    const notifications = allDocs
      .map(doc => {
        const data = doc.data()
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate?.() || new Date(),
          scheduledFor: data.scheduledFor?.toDate?.() || null
        }
      })
      .filter(notif => {
        // Se não tem scheduledFor, mostrar
        if (!notif.scheduledFor) return true
        // Se tem, só mostrar se já passou do horário
        return notif.scheduledFor <= now.toDate()
      })
      .sort((a, b) => b.createdAt - a.createdAt)

    return notifications
  } catch (error) {
    console.error('Erro ao buscar notificações do usuário:', error)
    throw error
  }
}

// Marcar notificação como lida
export const markNotificationAsRead = async (userId, notificationId) => {
  try {
    const userNotifRef = doc(
      db, 
      USER_NOTIFICATIONS_COLLECTION, 
      userId, 
      'notifications', 
      notificationId
    )
    
    await setDoc(userNotifRef, {
      read: true,
      readAt: serverTimestamp()
    }, { merge: true })

    // Incrementar views na notificação principal
    const notificationRef = doc(db, NOTIFICATIONS_COLLECTION, notificationId)
    await updateDoc(notificationRef, {
      'stats.views': increment(1)
    })
  } catch (error) {
    console.error('Erro ao marcar como lida:', error)
    throw error
  }
}

// Registrar clique em ação
export const recordNotificationClick = async (notificationId) => {
  try {
    const notificationRef = doc(db, NOTIFICATIONS_COLLECTION, notificationId)
    await updateDoc(notificationRef, {
      'stats.clicks': increment(1)
    })
  } catch (error) {
    console.error('Erro ao registrar clique:', error)
    throw error
  }
}

// Buscar status de leitura de notificações
export const getUserNotificationStatus = async (userId) => {
  try {
    const userNotifsRef = collection(
      db, 
      USER_NOTIFICATIONS_COLLECTION, 
      userId, 
      'notifications'
    )
    const snapshot = await getDocs(userNotifsRef)
    
    const status = {}
    snapshot.docs.forEach(doc => {
      status[doc.id] = doc.data()
    })
    
    return status
  } catch (error) {
    console.error('Erro ao buscar status:', error)
    return {}
  }
}
