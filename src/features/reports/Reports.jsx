import { useState } from "react"
import { useTrades } from "../../hooks/useTrades"
import { Card, Button } from "../../components/ui"
import { TradeFilters } from "../../components/filters/TradeFilters"
import { ExportButtons } from "../../components/exports/ExportButtons"
import { calculateMetrics } from "../../utils/metrics"
import { formatCurrency, formatPercent } from "../../utils/metrics"

export const Reports = () => {
  const { trades, loading } = useTrades()
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    symbol: "",
    strategy: "",
    result: "all"
  })

  if (loading) {
    return <div className="text-center p-8 text-zinc-400">Carregando...</div>
  }

  // Aplicar filtros
  const filteredTrades = trades.filter((trade) => {
    if (filters.startDate && trade.date < filters.startDate) return false
    if (filters.endDate && trade.date > filters.endDate) return false
    if (filters.symbol && !(trade.asset || trade.symbol || "").toLowerCase().includes(filters.symbol.toLowerCase())) return false
    if (filters.strategy && !(trade.strategy || "").toLowerCase().includes(filters.strategy.toLowerCase())) return false
    if (filters.result === "win" && trade.pnl <= 0) return false
    if (filters.result === "loss" && trade.pnl >= 0) return false
    return true
  })

  const metrics = calculateMetrics(filteredTrades)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">📊 Gerar Relatórios</h2>
        <p className="text-zinc-400">Exporte seus dados de trading em PDF, Excel ou CSV</p>
      </div>

      <TradeFilters onFilterChange={setFilters} />

      {/* Prévia das Métricas */}
      <Card>
        <h3 className="text-lg font-bold text-white mb-4">📈 Prévia do Relatório</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-zinc-800 p-4 rounded-lg">
            <p className="text-xs text-zinc-500 mb-1">Total de Trades</p>
            <p className="text-2xl font-bold text-white">{metrics.totalTrades}</p>
          </div>

          <div className="bg-zinc-800 p-4 rounded-lg">
            <p className="text-xs text-zinc-500 mb-1">Resultado Total</p>
            <p className={`text-2xl font-bold ${metrics.totalPnL >= 0 ? "text-win" : "text-loss"}`}>
              {formatCurrency(metrics.totalPnL)}
            </p>
          </div>

          <div className="bg-zinc-800 p-4 rounded-lg">
            <p className="text-xs text-zinc-500 mb-1">Win Rate</p>
            <p className="text-2xl font-bold text-white">{formatPercent(metrics.winRate)}</p>
          </div>

          <div className="bg-zinc-800 p-4 rounded-lg">
            <p className="text-xs text-zinc-500 mb-1">Profit Factor</p>
            <p className="text-2xl font-bold text-white">{metrics.profitFactor.toFixed(2)}</p>
          </div>

          <div className="bg-zinc-800 p-4 rounded-lg">
            <p className="text-xs text-zinc-500 mb-1">Vitórias</p>
            <p className="text-2xl font-bold text-win">{metrics.wins}</p>
          </div>

          <div className="bg-zinc-800 p-4 rounded-lg">
            <p className="text-xs text-zinc-500 mb-1">Derrotas</p>
            <p className="text-2xl font-bold text-loss">{metrics.losses}</p>
          </div>

          <div className="bg-zinc-800 p-4 rounded-lg">
            <p className="text-xs text-zinc-500 mb-1">Maior Ganho</p>
            <p className="text-2xl font-bold text-win">{formatCurrency(metrics.bestTrade)}</p>
          </div>

          <div className="bg-zinc-800 p-4 rounded-lg">
            <p className="text-xs text-zinc-500 mb-1">Maior Perda</p>
            <p className="text-2xl font-bold text-loss">{formatCurrency(metrics.worstTrade)}</p>
          </div>
        </div>

        {/* Período */}
        {filteredTrades.length > 0 && (
          <div className="bg-zinc-900 p-4 rounded-lg mb-6">
            <p className="text-sm text-zinc-400">
              <span className="font-bold text-white">Período:</span>{" "}
              {filteredTrades[filteredTrades.length - 1]?.date} até {filteredTrades[0]?.date}
            </p>
            <p className="text-sm text-zinc-400 mt-1">
              <span className="font-bold text-white">Total de registros:</span> {filteredTrades.length} trades
            </p>
          </div>
        )}

        {/* Botões de Exportação */}
        <div className="border-t border-zinc-800 pt-6">
          <h4 className="text-md font-bold text-white mb-4">💾 Escolha o formato de exportação:</h4>
          
          {filteredTrades.length === 0 ? (
            <div className="text-center py-8 text-zinc-500">
              Nenhum trade encontrado com os filtros aplicados
            </div>
          ) : (
            <ExportButtons trades={trades} filteredTrades={filteredTrades} />
          )}
        </div>
      </Card>

      {/* Informações sobre os formatos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <h4 className="text-md font-bold text-white mb-2">📄 PDF</h4>
          <p className="text-sm text-zinc-400">
            Relatório visual profissional com resumo executivo, métricas e tabela completa de trades. 
            Ideal para apresentações e impressão.
          </p>
        </Card>

        <Card>
          <h4 className="text-md font-bold text-white mb-2">📊 Excel</h4>
          <p className="text-sm text-zinc-400">
            Planilha completa com duas abas: Resumo (métricas) e Trades (histórico detalhado). 
            Perfeito para análises personalizadas.
          </p>
        </Card>

        <Card>
          <h4 className="text-md font-bold text-white mb-2">📋 CSV</h4>
          <p className="text-sm text-zinc-400">
            Arquivo simples e leve com histórico de trades. 
            Compatível com qualquer software de análise de dados.
          </p>
        </Card>
      </div>
    </div>
  )
}
