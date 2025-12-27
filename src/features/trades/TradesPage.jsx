import { useState } from "react"
import { useAuth } from "../auth/AuthContext"
import { useTrades } from "../../hooks/useTrades"
import { createTrade, updateTrade, deleteTrade } from "../../services/trades"
import { TradeForm } from "../../components/trades/TradeForm"
import { Card, Button } from "../../components/ui"
import { formatCurrency, formatDate } from "../../utils/metrics"

export const TradesPage = () => {
  const { user } = useAuth()
  const { trades, loading, reload } = useTrades()
  const [showForm, setShowForm] = useState(false)
  const [editingTrade, setEditingTrade] = useState(null)

  const handleCreate = async (tradeData) => {
    const result = await createTrade(tradeData, user.uid)
    if (result.success) {
      setShowForm(false)
      reload()
    } else {
      alert("Erro ao criar trade: " + result.error)
    }
  }

  const handleUpdate = async (tradeData) => {
    const result = await updateTrade(editingTrade.id, tradeData, user.uid)
    if (result.success) {
      setEditingTrade(null)
      reload()
    } else {
      alert("Erro ao atualizar trade: " + result.error)
    }
  }

  const handleDelete = async (tradeId) => {
    if (!confirm("Tem certeza que deseja deletar este trade?")) return
    
    const result = await deleteTrade(tradeId, user.uid)
    if (result.success) {
      reload()
    } else {
      alert("Erro ao deletar trade: " + result.error)
    }
  }

  const handleEdit = (trade) => {
    setEditingTrade(trade)
    setShowForm(false)
  }

  if (loading) {
    return (
      <div className="p-8 text-center">
        <p className="text-zinc-400">Carregando trades...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Meus Trades</h2>
          <p className="text-zinc-400">Gerencie seu histórico de operações</p>
        </div>
        
        <Button 
          variant="success" 
          onClick={() => {
            setShowForm(!showForm)
            setEditingTrade(null)
          }}
        >
          {showForm ? "Cancelar" : "+ Novo Trade"}
        </Button>
      </div>

      {showForm && (
        <TradeForm 
          onSubmit={handleCreate}
          onCancel={() => setShowForm(false)}
        />
      )}

      {editingTrade && (
        <TradeForm 
          initialData={editingTrade}
          onSubmit={handleUpdate}
          onCancel={() => setEditingTrade(null)}
        />
      )}

      {trades.length === 0 ? (
        <div className="text-center p-12">
          <p className="text-zinc-400 mb-4">Nenhum trade encontrado</p>
          <Button variant="success" onClick={() => setShowForm(true)}>
            Criar Primeiro Trade
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {trades.map(trade => (
            <Card key={trade.id}>
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-bold text-white">
                      {trade.asset || "N/A"}
                    </h3>
                    <span className="text-xs px-2 py-1 bg-zinc-800 text-zinc-400 rounded">
                      {trade.strategy || "Sem estratégia"}
                    </span>
                  </div>
                  <p className="text-sm text-zinc-400 mt-1">
                    {formatDate(trade.date)}
                  </p>
                  {trade.notes && (
                    <p className="text-xs text-zinc-500 mt-2">{trade.notes}</p>
                  )}
                </div>
                
                <div className="text-right mr-4">
                  <p className={`text-xl font-bold ${trade.pnl >= 0 ? "text-win" : "text-loss"}`}>
                    {trade.pnl >= 0 ? "+" : ""}{formatCurrency(trade.pnl)}
                  </p>
                  <div className="text-xs text-zinc-500 space-y-0.5 mt-1">
                    <p>Comissão: {formatCurrency(trade.commission)}</p>
                    <p>Swap: {formatCurrency(trade.swap)}</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(trade)}
                    className="px-3 py-2 text-sm bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition-colors"
                  >
                    ✏️ Editar
                  </button>
                  <button
                    onClick={() => handleDelete(trade.id)}
                    className="px-3 py-2 text-sm bg-red-900/20 hover:bg-red-900/30 text-red-400 rounded-lg transition-colors"
                  >
                    🗑️ Deletar
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
