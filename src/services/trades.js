import { db } from "./firebase"
import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc,
  query,
  orderBy 
} from "firebase/firestore"

export const getTrades = async (userId) => {
  console.log("🔍 Buscando trades para userId:", userId)
  
  try {
    const tradesRef = collection(db, "artifacts", "trade-journal-public", "users", userId, "trades")
    const q = query(tradesRef, orderBy("date", "desc"))
    
    console.log("📊 Query criada, executando...")
    const snapshot = await getDocs(q)
    console.log("✅ Snapshot recebido, total:", snapshot.size)
    
    const trades = snapshot.docs.map(doc => {
      const data = doc.data()
      
      // Converter strings para números
      return {
        id: doc.id,
        ...data,
        pnl: parseFloat(data.pnl) || 0,
        commission: parseFloat(data.commission) || 0,
        swap: parseFloat(data.swap) || 0
      }
    })
    
    console.log("✅ Total de trades processados:", trades.length)
    console.log("📊 Exemplo de trade:", trades[0])
    return { success: true, trades }
  } catch (error) {
    console.error("❌ Erro ao buscar trades:", error)
    return { success: false, error: error.message, trades: [] }
  }
}

export const createTrade = async (tradeData, userId) => {
  try {
    const tradesRef = collection(db, "artifacts", "trade-journal-public", "users", userId, "trades")
    
    const trade = {
      ...tradeData,
      pnl: parseFloat(tradeData.pnl) || 0,
      commission: parseFloat(tradeData.commission) || 0,
      swap: parseFloat(tradeData.swap) || 0,
      createdAt: new Date(),
      updatedAt: new Date()
    }
    
    const docRef = await addDoc(tradesRef, trade)
    console.log("✅ Trade criado:", docRef.id)
    return { success: true, id: docRef.id }
  } catch (error) {
    console.error("❌ Erro ao criar trade:", error)
    return { success: false, error: error.message }
  }
}

export const updateTrade = async (tradeId, tradeData, userId) => {
  try {
    const tradeRef = doc(db, "artifacts", "trade-journal-public", "users", userId, "trades", tradeId)
    
    await updateDoc(tradeRef, {
      ...tradeData,
      pnl: parseFloat(tradeData.pnl) || 0,
      commission: parseFloat(tradeData.commission) || 0,
      swap: parseFloat(tradeData.swap) || 0,
      updatedAt: new Date()
    })
    
    console.log("✅ Trade atualizado:", tradeId)
    return { success: true }
  } catch (error) {
    console.error("❌ Erro ao atualizar trade:", error)
    return { success: false, error: error.message }
  }
}

export const deleteTrade = async (tradeId, userId) => {
  try {
    const tradeRef = doc(db, "artifacts", "trade-journal-public", "users", userId, "trades", tradeId)
    await deleteDoc(tradeRef)
    
    console.log("✅ Trade deletado:", tradeId)
    return { success: true }
  } catch (error) {
    console.error("❌ Erro ao deletar trade:", error)
    return { success: false, error: error.message }
  }
}
