import { useState } from "react"
import { useTrades } from "../../hooks/useTrades"
import { Card } from "../../components/ui/Card"
import { Button } from "../../components/ui/Button"
import { TradeForm } from "./TradeForm"
import { TradeFilters } from "../../components/filters/TradeFilters"
import { formatCurrency } from "../../utils/metrics"
import { ImportMT5Modal } from "./ImportMT5Modal"
import { ClearAccountModal } from "./ClearAccountModal"

export const TradesPage = () => {
  const { trades, loading, createTrade, updateTrade, deleteTrade, clearAllTrades, importTrades } = useTrades()
  const [showForm, setShowForm] = useState(false)
  const [editingTrade, setEditingTrade] = useState(null)
  const [showImportModal, setShowImportModal] = useState(false)
  const [showClearModal, setShowClearModal] = useState(false)
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    symbol: "",
    strategy: "",
    result: "all"
  })

  // Aplicar filtros
  const filteredTrades = trades.filter(trade => {
    if (filters.startDate && trade.date < filters.startDate) return false
    if (filters.endDate && trade.date > filters.endDate) return false
    if (filters.symbol && !trade.asset.toLowerCase().includes(filters.symbol.toLowerCase())) return false
    if (filters.strategy && !trade.strategy?.toLowerCase().includes(filters.strategy.toLowerCase())) return false
    if (filters.result !== "all") {
      if (filters.result === "win" && trade.pnl <= 0) return false
      if (filters.result === "loss" && trade.pnl >= 0) return false
    }
    return true
  })

  // Calcular métricas dos trades filtrados
  const metrics = {
    total: filteredTrades.length,
    wins: filteredTrades.filter(t => t.pnl > 0).length,
    losses: filteredTrades.filter(t => t.pnl < 0).length,
    totalPnL: filteredTrades.reduce((sum, t) => sum + (parseFloat(t.pnl) || 0), 0)
  }

  const handleSubmit = async (tradeData) => {
    try {
      if (editingTrade) {
        await updateTrade(editingTrade.id, tradeData)
      } else {
        await createTrade(tradeData)
      }
      setShowForm(false)
      setEditingTrade(null)
    } catch (error) {
      console.error("Erro ao salvar trade:", error)
      alert("Erro ao salvar trade")
    }
  }

  const handleEdit = (trade) => {
    setEditingTrade(trade)
    setShowForm(true)
  }

  const handleDelete = async (tradeId) => {
    if (window.confirm("Deseja realmente excluir este trade?")) {
      try {
        await deleteTrade(tradeId)
      } catch (error) {
        console.error("Erro ao deletar trade:", error)
        alert("Erro ao deletar trade")
      }
    }
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditingTrade(null)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-white">Carregando trades...</div>
      </div>
    )
  }

  return (
    <div className="space-y-4 md:space-y-6 p-3 md:p-0">
      {/* Header Responsivo */}
      <div className="space-y-3">
        <h1 className="text-2xl md:text-3xl font-bold text-white">Trades</h1>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <Button 
            onClick={() => setShowForm(true)} 
            disabled={showForm}
            className="w-full sm:w-auto"
          >
            + Novo Trade
          </Button>
          <Button 
            variant="outline" 
            onClick={() => setShowImportModal(true)}
            className="w-full sm:w-auto"
          >
            📥 Importar MT5
          </Button>
          <Button 
            variant="outline" 
            onClick={() => setShowClearModal(true)}
            className="w-full sm:w-auto hover:bg-red-900/30 hover:border-red-500/50"
          >
            🗑️ Zerar Conta
          </Button>
        </div>
      </div>

      {/* Métricas Responsivas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <Card className="p-3 md:p-4">
          <div className="text-xs md:text-sm text-zinc-400 mb-1">Total</div>
          <div className="text-xl md:text-2xl font-bold text-white">{metrics.total}</div>
        </Card>
        <Card className="p-3 md:p-4">
          <div className="text-xs md:text-sm text-zinc-400 mb-1">Wins</div>
          <div className="text-xl md:text-2xl font-bold text-green-500">{metrics.wins}</div>
        </Card>
        <Card className="p-3 md:p-4">
          <div className="text-xs md:text-sm text-zinc-400 mb-1">Losses</div>
          <div className="text-xl md:text-2xl font-bold text-red-500">{metrics.losses}</div>
        </Card>
        <Card className="p-3 md:p-4 col-span-2 md:col-span-1">
          <div className="text-xs md:text-sm text-zinc-400 mb-1">P&L Total</div>
          <div className={`text-xl md:text-2xl font-bold ${metrics.totalPnL >= 0 ? "text-green-500" : "text-red-500"}`}>
            {formatCurrency(metrics.totalPnL)}
          </div>
        </Card>
      </div>

      {/* Filtros */}
      <TradeFilters onFilterChange={setFilters} />

      {/* Formulário */}
      {showForm && (
        <TradeForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          initialData={editingTrade}
        />
      )}

      {/* Lista de Trades Responsiva */}
      <Card className="p-3 md:p-4">
        <h2 className="text-lg md:text-xl font-bold text-white mb-3 md:mb-4">
          Histórico ({filteredTrades.length})
        </h2>

        {filteredTrades.length === 0 ? (
          <div className="text-center py-8 text-zinc-500">
            Nenhum trade encontrado
          </div>
        ) : (
          <div className="space-y-3">
            {filteredTrades.map(trade => (
              <div
                key={trade.id}
                className="p-3 md:p-4 bg-zinc-800 rounded-lg border border-zinc-700 hover:border-zinc-600 transition-colors"
              >
                {/* Layout Mobile: Tudo empilhado */}
                <div className="flex flex-col gap-3">
                  {/* Linha 1: Asset e Data */}
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                        <span className="text-white font-bold text-lg truncate">{trade.asset}</span>
                        <span className="text-xs md:text-sm text-zinc-400">{trade.date}</span>
                      </div>
                      {trade.strategy && (
                        <span className="inline-block mt-1 text-xs px-2 py-0.5 bg-zinc-700 rounded text-zinc-300">
                          {trade.strategy}
                        </span>
                      )}
                    </div>
                    
                    {/* P&L - Destaque no Mobile */}
                    <div className={`text-xl md:text-2xl font-bold whitespace-nowrap ml-2 ${trade.pnl >= 0 ? "text-green-500" : "text-red-500"}`}>
                      {formatCurrency(trade.pnl)}
                    </div>
                  </div>

                  {/* Linha 2: Notas (se existir) */}
                  {trade.notes && (
                    <p className="text-sm text-zinc-500 line-clamp-2">{trade.notes}</p>
                  )}

                  {/* Linha 3: Botões de Ação */}
                  <div className="flex gap-2 pt-2 border-t border-zinc-700">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(trade)}
                      className="flex-1 sm:flex-none"
                    >
                      ✏️ Editar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(trade.id)}
                      className="flex-1 sm:flex-none hover:bg-red-900/30 hover:border-red-500/50"
                    >
                      🗑️ Excluir
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Modais */}
      {showImportModal && (
        <ImportMT5Modal
          onClose={() => setShowImportModal(false)}
          onImport={importTrades}
        />
      )}

      {showClearModal && (
        <ClearAccountModal
          onClose={() => setShowClearModal(false)}
          onConfirm={clearAllTrades}
          tradesCount={trades.length}
        />
      )}
    </div>
  )
}
