import { db } from './firebase'
import { 
  collection, 
  addDoc, 
  getDocs, 
  getDoc,
  doc, 
  updateDoc, 
  query, 
  where, 
  orderBy,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore'

// ==================== USUÁRIO ====================

/**
 * Criar novo ticket
 */
export const createTicket = async (ticketData) => {
  try {
    const ticketsRef = collection(db, 'tickets')
    
    const ticket = {
      userId: ticketData.userId,
      userEmail: ticketData.userEmail,
      userName: ticketData.userName || ticketData.userEmail.split('@')[0],
      subject: ticketData.subject,
      category: ticketData.category || 'outro',
      priority: ticketData.priority || 'media',
      status: 'aberto',
      description: ticketData.description,
      adminResponse: null,
      isPro: ticketData.isPro || false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      respondedAt: null,
      respondedBy: null
    }
    
    const docRef = await addDoc(ticketsRef, ticket)
    
    return {
      id: docRef.id,
      ...ticket,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  } catch (error) {
    console.error('Erro ao criar ticket:', error)
    throw error
  }
}

/**
 * Buscar tickets do usuário
 */
export const getUserTickets = async (userId) => {
  try {
    const ticketsRef = collection(db, 'tickets')
    const q = query(
      ticketsRef, 
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    )
    
    const snapshot = await getDocs(q)
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
      respondedAt: doc.data().respondedAt?.toDate()
    }))
  } catch (error) {
    console.error('Erro ao buscar tickets do usuário:', error)
    throw error
  }
}

/**
 * Buscar ticket específico
 */
export const getTicketById = async (ticketId) => {
  try {
    const ticketRef = doc(db, 'tickets', ticketId)
    const ticketSnap = await getDoc(ticketRef)
    
    if (!ticketSnap.exists()) {
      throw new Error('Ticket não encontrado')
    }
    
    return {
      id: ticketSnap.id,
      ...ticketSnap.data(),
      createdAt: ticketSnap.data().createdAt?.toDate(),
      updatedAt: ticketSnap.data().updatedAt?.toDate(),
      respondedAt: ticketSnap.data().respondedAt?.toDate()
    }
  } catch (error) {
    console.error('Erro ao buscar ticket:', error)
    throw error
  }
}

/**
 * Fechar ticket (usuário)
 */
export const closeTicket = async (ticketId) => {
  try {
    const ticketRef = doc(db, 'tickets', ticketId)
    
    await updateDoc(ticketRef, {
      status: 'fechado',
      updatedAt: serverTimestamp()
    })
    
    return true
  } catch (error) {
    console.error('Erro ao fechar ticket:', error)
    throw error
  }
}

// ==================== ADMIN ====================

/**
 * Buscar todos os tickets (admin)
 */
export const getAllTickets = async (filters = {}) => {
  try {
    const ticketsRef = collection(db, 'tickets')
    let q = query(ticketsRef, orderBy('createdAt', 'desc'))
    
    // Aplicar filtros opcionais
    if (filters.status) {
      q = query(ticketsRef, where('status', '==', filters.status), orderBy('createdAt', 'desc'))
    }
    
    if (filters.priority) {
      q = query(ticketsRef, where('priority', '==', filters.priority), orderBy('createdAt', 'desc'))
    }
    
    const snapshot = await getDocs(q)
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
      respondedAt: doc.data().respondedAt?.toDate()
    }))
  } catch (error) {
    console.error('Erro ao buscar tickets (admin):', error)
    throw error
  }
}

/**
 * Responder ticket (admin)
 */
export const respondTicket = async (ticketId, response, adminEmail) => {
  try {
    const ticketRef = doc(db, 'tickets', ticketId)
    
    await updateDoc(ticketRef, {
      adminResponse: response,
      status: 'resolvido',
      respondedAt: serverTimestamp(),
      respondedBy: adminEmail,
      updatedAt: serverTimestamp()
    })
    
    return true
  } catch (error) {
    console.error('Erro ao responder ticket:', error)
    throw error
  }
}

/**
 * Atualizar status do ticket (admin)
 */
export const updateTicketStatus = async (ticketId, newStatus) => {
  try {
    const ticketRef = doc(db, 'tickets', ticketId)
    
    await updateDoc(ticketRef, {
      status: newStatus,
      updatedAt: serverTimestamp()
    })
    
    return true
  } catch (error) {
    console.error('Erro ao atualizar status:', error)
    throw error
  }
}

/**
 * Buscar estatísticas de tickets (admin dashboard)
 */
export const getTicketStats = async () => {
  try {
    const ticketsRef = collection(db, 'tickets')
    const snapshot = await getDocs(ticketsRef)
    
    const tickets = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate()
    }))
    
    const stats = {
      total: tickets.length,
      abertos: tickets.filter(t => t.status === 'aberto').length,
      resolvidos: tickets.filter(t => t.status === 'resolvido').length,
      fechados: tickets.filter(t => t.status === 'fechado').length,
      aguardandoResposta: tickets.filter(t => t.status === 'aberto' && !t.adminResponse).length,
      prioridade: {
        alta: tickets.filter(t => t.priority === 'alta' && t.status === 'aberto').length,
        media: tickets.filter(t => t.priority === 'media' && t.status === 'aberto').length,
        baixa: tickets.filter(t => t.priority === 'baixa' && t.status === 'aberto').length
      }
    }
    
    return stats
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error)
    throw error
  }
}
