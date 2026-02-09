import { 
  collection, 
  addDoc, 
  updateDoc, 
  doc, 
  getDocs, 
  query, 
  where, 
  orderBy,
  arrayUnion,
  serverTimestamp
} from 'firebase/firestore'
import { db } from './firebase'

const TICKETS_COLLECTION = 'tickets'

// Criar novo ticket
export const createTicket = async (ticketData) => {
  try {
    const ticketRef = await addDoc(collection(db, TICKETS_COLLECTION), {
      ...ticketData,
      status: 'aberto',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      messages: ticketData.messages || [],
      unreadByUser: false,
      unreadByAdmin: true, // Admin precisa ler ticket novo
      lastMessageBy: 'user'
    })
    
    return ticketRef.id
  } catch (error) {
    console.error('Erro ao criar ticket:', error)
    throw error
  }
}

// Adicionar mensagem ao ticket
export const addTicketMessage = async (ticketId, message) => {
  try {
    const ticketRef = doc(db, TICKETS_COLLECTION, ticketId)
    
    await updateDoc(ticketRef, {
      messages: arrayUnion({
        ...message,
        createdAt: new Date()
      }),
      updatedAt: serverTimestamp(),
      // Se admin responde, marca como não lido para user
      // Se user responde, marca como não lido para admin
      unreadByUser: message.isAdmin ? true : false,
      unreadByAdmin: message.isAdmin ? false : true,
      lastMessageBy: message.isAdmin ? 'admin' : 'user'
    })
  } catch (error) {
    console.error('Erro ao adicionar mensagem:', error)
    throw error
  }
}

// Marcar ticket como lido (user ou admin)
export const markTicketAsRead = async (ticketId, isAdmin) => {
  try {
    const ticketRef = doc(db, TICKETS_COLLECTION, ticketId)
    
    await updateDoc(ticketRef, {
      [isAdmin ? 'unreadByAdmin' : 'unreadByUser']: false
    })
  } catch (error) {
    console.error('Erro ao marcar como lido:', error)
    throw error
  }
}

// Atualizar status do ticket
export const updateTicketStatus = async (ticketId, status) => {
  try {
    const ticketRef = doc(db, TICKETS_COLLECTION, ticketId)
    
    await updateDoc(ticketRef, {
      status,
      updatedAt: serverTimestamp()
    })
  } catch (error) {
    console.error('Erro ao atualizar status:', error)
    throw error
  }
}

// Buscar tickets do usuário
export const getUserTickets = async (userId) => {
  try {
    const q = query(
      collection(db, TICKETS_COLLECTION),
      where('userId', '==', userId),
      orderBy('updatedAt', 'desc')
    )
    
    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => {
      const data = doc.data()
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate(),
        // ✅ Fallback para tickets antigos sem esses campos
        unreadByUser: data.unreadByUser ?? false,
        unreadByAdmin: data.unreadByAdmin ?? false
      }
    })
  } catch (error) {
    console.error('Erro ao buscar tickets do usuário:', error)
    throw error
  }
}

// Buscar todos os tickets (admin)
export const getAllTickets = async () => {
  try {
    const q = query(
      collection(db, TICKETS_COLLECTION),
      orderBy('updatedAt', 'desc')
    )
    
    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => {
      const data = doc.data()
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate(),
        // ✅ Fallback para tickets antigos sem esses campos
        unreadByUser: data.unreadByUser ?? false,
        unreadByAdmin: data.unreadByAdmin ?? false
      }
    })
  } catch (error) {
    console.error('Erro ao buscar todos os tickets:', error)
    throw error
  }
}

// Contar tickets não lidos (admin)
export const getUnreadTicketsCount = async () => {
  try {
    const q = query(
      collection(db, TICKETS_COLLECTION),
      where('unreadByAdmin', '==', true)
    )
    
    const snapshot = await getDocs(q)
    return snapshot.size
  } catch (error) {
    console.error('Erro ao contar tickets não lidos:', error)
    return 0
  }
}

// Contar tickets não lidos do usuário
export const getUserUnreadTicketsCount = async (userId) => {
  try {
    const q = query(
      collection(db, TICKETS_COLLECTION),
      where('userId', '==', userId),
      where('unreadByUser', '==', true)
    )
    
    const snapshot = await getDocs(q)
    return snapshot.size
  } catch (error) {
    console.error('Erro ao contar tickets não lidos do usuário:', error)
    return 0
  }
}
