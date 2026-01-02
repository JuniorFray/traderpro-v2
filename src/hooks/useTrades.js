import { useState, useEffect } from 'react'
import { useAuth } from '../features/auth/AuthContext'
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs, 
  query, 
  orderBy,
  serverTimestamp,
  writeBatch
} from 'firebase/firestore'
import { db } from '../services/firebase'

export const useTrades = () => {
  const { user } = useAuth()
  const [trades, setTrades] = useState([])
  const [loading, setLoading] = useState(true)

  const loadTrades = async () => {
    if (!user) {
      setTrades([])
      setLoading(false)
      return
    }

    try {
      const tradesRef = collection(db, 'artifacts', 'trade-journal-public', 'users', user.uid, 'trades')
      const q = query(tradesRef, orderBy('date', 'desc'))
      const snapshot = await getDocs(q)
      
      const tradesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      
      setTrades(tradesData)
    } catch (error) {
      console.error('Erro ao carregar trades:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadTrades()
  }, [user])

  const createTrade = async (tradeData) => {
    if (!user) return

    try {
      const tradesRef = collection(db, 'artifacts', 'trade-journal-public', 'users', user.uid, 'trades')
      await addDoc(tradesRef, {
        ...tradeData,
        userId: user.uid,
        createdAt: serverTimestamp()
      })
      await loadTrades()
    } catch (error) {
      console.error('Erro ao criar trade:', error)
      throw error
    }
  }

  const updateTrade = async (tradeId, tradeData) => {
    if (!user) return

    try {
      const tradeRef = doc(db, 'artifacts', 'trade-journal-public', 'users', user.uid, 'trades', tradeId)
      await updateDoc(tradeRef, {
        ...tradeData,
        updatedAt: serverTimestamp()
      })
      await loadTrades()
    } catch (error) {
      console.error('Erro ao atualizar trade:', error)
      throw error
    }
  }

  const deleteTrade = async (tradeId) => {
    if (!user) return

    try {
      const tradeRef = doc(db, 'artifacts', 'trade-journal-public', 'users', user.uid, 'trades', tradeId)
      await deleteDoc(tradeRef)
      await loadTrades()
    } catch (error) {
      console.error('Erro ao deletar trade:', error)
      throw error
    }
  }

  const clearAllTrades = async () => {
    if (!user) return

    setLoading(true)
    try {
      const tradesRef = collection(db, 'artifacts', 'trade-journal-public', 'users', user.uid, 'trades')
      const snapshot = await getDocs(tradesRef)
      
      const batch = writeBatch(db)
      snapshot.docs.forEach((doc) => {
        batch.delete(doc.ref)
      })
      
      await batch.commit()
      await loadTrades()
    } catch (error) {
      console.error('Erro ao limpar trades:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const importTrades = async (tradesArray) => {
    if (!user) return

    setLoading(true)
    try {
      const batch = writeBatch(db)
      
      tradesArray.forEach(tradeData => {
        const docRef = doc(collection(db, 'artifacts', 'trade-journal-public', 'users', user.uid, 'trades'))
        batch.set(docRef, {
          ...tradeData,
          userId: user.uid,
          createdAt: serverTimestamp()
        })
      })
      
      await batch.commit()
      await loadTrades()
    } catch (error) {
      console.error('Erro ao importar trades:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  return {
    trades,
    loading,
    createTrade,
    updateTrade,
    deleteTrade,
    clearAllTrades,
    importTrades
  }
}

