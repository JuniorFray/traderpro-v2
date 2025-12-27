import { useState, useEffect } from "react"
import { useAuth } from "../features/auth/AuthContext"
import { getTrades, createTrade as createTradeService, updateTrade as updateTradeService, deleteTrade as deleteTradeService } from "../services/trades"

export const useTrades = () => {
  const { user } = useAuth()
  const [trades, setTrades] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const loadTrades = async () => {
    if (!user) return

    setLoading(true)
    setError(null)

    const result = await getTrades(user.uid)

    if (result.success) {
      setTrades(result.trades)
    } else {
      setError(result.error)
    }

    setLoading(false)
  }

  const createTrade = async (tradeData) => {
    if (!user) return { success: false, error: "Usuário não autenticado" }

    const result = await createTradeService(tradeData, user.uid)
    
    if (result.success) {
      await loadTrades()
    }
    
    return result
  }

  const updateTrade = async (tradeId, tradeData) => {
    if (!user) return { success: false, error: "Usuário não autenticado" }

    const result = await updateTradeService(tradeId, tradeData, user.uid)
    
    if (result.success) {
      await loadTrades()
    }
    
    return result
  }

  const deleteTrade = async (tradeId) => {
    if (!user) return { success: false, error: "Usuário não autenticado" }

    const result = await deleteTradeService(tradeId, user.uid)
    
    if (result.success) {
      await loadTrades()
    }
    
    return result
  }

  useEffect(() => {
    loadTrades()
  }, [user])

  return { 
    trades, 
    loading, 
    error, 
    reload: loadTrades,
    createTrade,
    updateTrade,
    deleteTrade
  }
}
