import { useState, useEffect } from "react"
import { useAuth } from "../features/auth/AuthContext"
import { getTrades } from "../services/trades"

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

  useEffect(() => {
    loadTrades()
  }, [user])

  return { trades, loading, error, reload: loadTrades }
}
