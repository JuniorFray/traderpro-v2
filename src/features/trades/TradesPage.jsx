import { useState } from "react"
import { useTrades } from "../../hooks/useTrades"
import { Card, Button } from "../../components/ui"
import { TradeForm } from "./TradeForm"
import { TradeFilters } from "../../components/filters/TradeFilters"
import { formatCurrency } from "../../utils/metrics"

export const TradesPage = () => {
  const { trades, loading, createTrade, updateTrade, deleteTrade } = useTrades()
  const [showForm, setShowForm] = useState(false)
  const [editingTrade, setEditingTrade] = useState(null)
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    symbol: "",
    strategy: "",
    result: "all"
  })

  // Aplicar filtros
  const filteredTrades = trades.filter((trade) => {
    // Filtro de data início
    if (filters.startDate && trade.date < filters.startDate) return false
    
    // Filtro de data fim
    if (filters.endDate && trade.date > filters.endDate) return false
    
    // Filtro de ativo
    if (filters.symbol && !(trade.asset || trade.symbol || "").toLowerCase().includes(filters.symbol.toLowerCase())) {
      return false
    }
    
    // Filtro de estratégia
    if (filters.strategy && !(trade.strategy || "").toLowerCase().includes(filters.strategy.toLowerCase())) {
      return false
    }
    
    // Filtro de resultado
    if (filters.result === "win" && trade.pnl <= 0) return false
    if (filters.result === "loss" && trade.pnl >= 0) return false
    
    return true
  })

  const handleCreateTrade = async (tradeData) => {
    await createTrade(tradeData)
    setShowForm(false)
  }

  const handleUpdateTrade = async (tradeData) => {
    await updateTrade(editingTrade.id, tradeData)
    setEditingTrade(null)
  }

  const handleEdit = (trade) => {
    setEditingTrade(trade)
  }

  const handleDelete = async (id) => {
    if (window.confirm("Tem certeza que deseja excluir este trade?")) {
      await deleteTrade(id)
    }
  }

  if (loading) {
    return <div className="text-center p-8 text-zinc-400">Carregando...</div>
  }

  return (
    <div className="space-y-4 lg:space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl lg:text-2xl font-bold text-white">Trades</h2>
          <p className="text-sm lg:text-base text-zinc-400">
            {filteredTrades.length} de {trades.length} trades
          </p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancelar" : "➕ Novo Trade"}
        </Button>
      </div>

      {/* Filtros */}
      <TradeFilters onFilterChange={setFilters} />

      {/* Formulário */}
      {showForm && (
        <Card>
          <h3 className="text-lg font-bold text-white mb-4">Criar Novo Trade</h3>
          <TradeForm onSubmit={handleCreateTrade} submitLabel="Criar Trade" />
        </Card>
      )}

      {/* Lista de Trades */}
      <Card>
        <h3 className="text-lg font-bold text-white mb-4">Lista de Trades</h3>
        
        {filteredTrades.length === 0 ? (
          <div className="text-center py-8 text-zinc-500">
            Nenhum trade encontrado com os filtros aplicados
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-800">
                  <th className="text-left py-3 px-4 text-zinc-400 font-medium text-sm">Data</th>
                  <th className="text-left py-3 px-4 text-zinc-400 font-medium text-sm">Ativo</th>
                  <th className="text-left py-3 px-4 text-zinc-400 font-medium text-sm">Estratégia</th>
                  <th className="text-right py-3 px-4 text-zinc-400 font-medium text-sm">P&L</th>
                  <th className="text-right py-3 px-4 text-zinc-400 font-medium text-sm">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredTrades.map((trade) => (
                  <tr key={trade.id} className="border-b border-zinc-900 hover:bg-zinc-800/50">
                    <td className="py-3 px-4 text-white text-sm">
                      {new Date(trade.date).toLocaleDateString("pt-BR")}
                    </td>
                    <td className="py-3 px-4 text-white text-sm font-medium">
                      {trade.asset || trade.symbol || "N/A"}
                    </td>
                    <td className="py-3 px-4 text-zinc-400 text-sm">
                      {trade.strategy || "-"}
                    </td>
                    <td className={`py-3 px-4 text-right font-bold text-sm ${
                      trade.pnl >= 0 ? "text-win" : "text-loss"
                    }`}>
                      {formatCurrency(trade.pnl)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => handleEdit(trade)}
                          className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleDelete(trade.id)}
                          className="px-3 py-1 bg-loss hover:bg-red-700 text-white rounded text-sm"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Modal de Edição */}
      {editingTrade && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setEditingTrade(null)}>
          <div className="bg-zinc-900 rounded-xl p-4 lg:p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4 lg:mb-6">
              <h3 className="text-lg lg:text-xl font-bold text-white">Editar Trade</h3>
              <button
                onClick={() => setEditingTrade(null)}
                className="text-zinc-400 hover:text-white text-2xl"
              >
                ×
              </button>
            </div>
            <TradeForm
              key={editingTrade.id}
              onSubmit={handleUpdateTrade}
              initialData={editingTrade}
              submitLabel="Atualizar Trade"
            />
          </div>
        </div>
      )}
    </div>
  )
}
