import { useState, useEffect } from "react"
import { useAuth } from "../auth/AuthContext"
import { getTrades } from "../../services/trades"
import { Card } from "../../components/ui/Card"
import { formatCurrency, formatDate } from "../../utils/metrics"

export const TradesList = () => {
  const { user } = useAuth()
  const [trades, setTrades] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadTrades()
  }, [user])

  const loadTrades = async () => {
    if (!user) return
    
    setLoading(true)
    const result = await getTrades(user.uid)
    
    if (result.success) {
      setTrades(result.trades)
    }
    
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="p-8 text-center">
        <p className="text-zinc-400">Carregando trades...</p>
      </div>
    )
  }

  if (trades.length === 0) {
    return (
      <div className="p-8 text-center">
        <p className="text-zinc-400">Nenhum trade encontrado</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-white">Meus Trades</h2>
      
      {trades.map(trade => (
        <Card key={trade.id}>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-white">{trade.asset || 'N/A'}</h3>
              <p className="text-sm text-zinc-400">{formatDate(trade.date)}</p>
              {trade.notes && (
                <p className="text-xs text-zinc-500 mt-1">{trade.notes}</p>
              )}
            </div>
            
            <div className="text-right">
              <p className={`text-lg font-bold ${trade.pnl >= 0 ? 'text-win' : 'text-loss'}`}>
                {formatCurrency(trade.pnl || 0)}
              </p>
              <p className="text-xs text-zinc-500">
                Comiss�o: {formatCurrency(trade.commission || 0)}
              </p>
              <p className="text-xs text-zinc-500">
                Swap: {formatCurrency(trade.swap || 0)}
              </p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}
