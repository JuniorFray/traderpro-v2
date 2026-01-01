import { useState, useEffect } from "react"
import { useAuth } from "../features/auth/AuthContext"
import tradesService, { deleteAllTrades } from "../services/trades"

export const useTrades = () => {
  const { user } = useAuth()
  const [trades, setTrades] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      loadTrades()
    } else {
      setTrades([])
      setLoading(false)
    }
  }, [user])

  const loadTrades = async () => {
    if (!user) return

    setLoading(true)
    const result = await tradesService.getTrades(user.uid)

    if (result.success) {
      setTrades(result.trades)
    }

    setLoading(false)
  }

  const createTrade = async (tradeData) => {
    if (!user) return

    const result = await tradesService.createTrade(user.uid, tradeData)

    if (result.success) {
      await loadTrades()
    }

    return result
  }

  const updateTrade = async (tradeId, tradeData) => {
    if (!user) return

    const result = await tradesService.updateTrade(user.uid, tradeId, tradeData)

    if (result.success) {
      await loadTrades()
    }

    return result
  }

  const deleteTrade = async (tradeId) => {
    if (!user) return

    const result = await tradesService.deleteTrade(user.uid, tradeId)

    if (result.success) {
      await loadTrades()
    }

    return result
  }

  const clearAllTrades = async () => {
    if (!user) return

    setLoading(true)
    const result = await deleteAllTrades(user.uid)

    if (result.success) {
      setTrades([])
      return result.count
    }

    setLoading(false)
    return 0
  }

  return {
    trades,
    loading,
    createTrade,
    updateTrade,
    deleteTrade,
    clearAllTrades
  }
}

export default useTrades
