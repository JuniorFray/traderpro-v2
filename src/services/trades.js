import { db } from "./firebase"
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  query,
  where,
  orderBy,
  writeBatch,
  serverTimestamp
} from "firebase/firestore"

/**
 * Obtém o caminho correto da coleção de trades
 */
const getTradesPath = (userId) => {
  return `artifacts/trade-journal-public/users/${userId}/trades`
}

/**
 * Cria um novo trade
 */
export const createTrade = async (userId, tradeData) => {
  try {
    const tradesRef = collection(db, getTradesPath(userId))
    const docRef = await addDoc(tradesRef, {
      ...tradeData,
      userId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    })

    return {
      success: true,
      id: docRef.id
    }
  } catch (error) {
    console.error("Erro ao criar trade:", error)
    return {
      success: false,
      error: error.message
    }
  }
}

/**
 * Busca todos os trades de um usuário
 */
export const getTrades = async (userId) => {
  try {
    const tradesRef = collection(db, getTradesPath(userId))
    const q = query(tradesRef, orderBy("date", "desc"))
    const snapshot = await getDocs(q)

    const trades = snapshot.docs.map((doc) => {
      const data = doc.data()
      
      // Converter strings para números
      return {
        id: doc.id,
        ...data,
        pnl: parseFloat(data.pnl) || 0,
        fees: parseFloat(data.fees) || 0,
        commission: parseFloat(data.commission) || 0,
        swap: parseFloat(data.swap) || 0
      }
    })

    return {
      success: true,
      trades
    }
  } catch (error) {
    console.error("Erro ao buscar trades:", error)
    return {
      success: false,
      error: error.message,
      trades: []
    }
  }
}

/**
 * Atualiza um trade existente
 */
export const updateTrade = async (userId, tradeId, tradeData) => {
  try {
    const tradeRef = doc(db, getTradesPath(userId), tradeId)
    await updateDoc(tradeRef, {
      ...tradeData,
      updatedAt: serverTimestamp()
    })

    return {
      success: true
    }
  } catch (error) {
    console.error("Erro ao atualizar trade:", error)
    return {
      success: false,
      error: error.message
    }
  }
}

/**
 * Deleta um trade
 */
export const deleteTrade = async (userId, tradeId) => {
  try {
    const tradeRef = doc(db, getTradesPath(userId), tradeId)
    await deleteDoc(tradeRef)

    return {
      success: true
    }
  } catch (error) {
    console.error("Erro ao deletar trade:", error)
    return {
      success: false,
      error: error.message
    }
  }
}

/**
 * Deleta todos os trades de um usuário
 */
export const deleteAllTrades = async (userId) => {
  try {
    const tradesRef = collection(db, getTradesPath(userId))
    const snapshot = await getDocs(tradesRef)

    // Deletar em lote
    const batch = writeBatch(db)
    snapshot.docs.forEach((doc) => {
      batch.delete(doc.ref)
    })

    await batch.commit()

    return {
      success: true,
      count: snapshot.docs.length
    }
  } catch (error) {
    console.error("Erro ao deletar todos os trades:", error)
    return {
      success: false,
      error: error.message
    }
  }
}

export const createTradesInBatch = async (userId, tradesData, onProgress) => {
  try {
    const batchSize = 50 // Firestore permite max 500 operações por batch
    const totalTrades = tradesData.length
    let importedCount = 0

    for (let i = 0; i < totalTrades; i += batchSize) {
      const batch = writeBatch(db)
      const currentBatch = tradesData.slice(i, i + batchSize)
      
      currentBatch.forEach((tradeData) => {
        const tradesRef = collection(db, getTradesPath(userId))
        const newDocRef = doc(tradesRef)
        batch.set(newDocRef, {
          ...tradeData,
          userId,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        })
      })

      await batch.commit()
      
      importedCount += currentBatch.length
      
      // Chamar callback de progresso
      if (onProgress) {
        const progress = Math.round((importedCount / totalTrades) * 100)
        onProgress(progress, importedCount, totalTrades)
      }
    }

    return {
      success: true,
      count: importedCount
    }
  } catch (error) {
    console.error("Erro ao importar trades em lote:", error)
    return {
      success: false,
      error: error.message
    }
  }
}

export default {
  createTrade,
  getTrades,
  updateTrade,
  deleteTrade,
  deleteAllTrades,
createTradesInBatch,
}
/**
 * Cria múltiplos trades em lote com callback de progresso
 */

