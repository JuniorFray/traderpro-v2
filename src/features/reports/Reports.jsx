import { useState } from "react"
import { useTrades } from "../../hooks/useTrades"
import { Card } from "../../components/ui/Card"
import { Button } from "../../components/ui/Button"
import { TradeFilters } from "../../components/filters/TradeFilters"
import { ExportButtons } from "../../components/exports/ExportButtons"
import { calculateMetrics } from "../../utils/metrics"
import { formatCurrency, formatPercentage } from "../../utils/metrics"
import { MARKET_NAMES } from "../../constants/markets"

export const Reports = () => {
  const { trades, loading } = useTrades()
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    symbol: "",
    strategy: "",
    result: "all",
    market: "all" // NOVO: filtro por mercado
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
    if (filters.market !== "all" && trade.market !== filters.market) return false // NOVO
    return true
  })

  const metrics = calculateMetrics(filteredTrades)

  // NOVO: Calcular custos e impostos (com valores seguros)
  const totalCommission = filteredTrades.reduce((sum, t) => sum + (parseFloat(t.commission) || 0), 0)
  const totalSwap = filteredTrades.reduce((sum, t) => sum + (parseFloat(t.swap) || 0), 0)
  const totalTax = filteredTrades.reduce((sum, t) => sum + (parseFloat(t.taxes?.amount) || 0), 0)
  const totalCosts = totalCommission + totalSwap
  const netProfit = (parseFloat(metrics.netProfit) || 0) - totalCosts - totalTax

  // NOVO: Métricas por mercado
  const marketBreakdown = {}
  filteredTrades.forEach(trade => {
    const market = trade.market || 'forex'
    if (!marketBreakdown[market]) {
      marketBreakdown[market] = {
        trades: [],
        totalPnL: 0,
        totalTax: 0,
        totalCosts: 0,
        wins: 0,
        losses: 0
      }
    }
    marketBreakdown[market].trades.push(trade)
    marketBreakdown[market].totalPnL += trade.pnl
    marketBreakdown[market].totalTax += (trade.taxes?.amount || 0)
    marketBreakdown[market].totalCosts += (trade.commission || 0) + (trade.swap || 0)
    if (trade.pnl > 0) marketBreakdown[market].wins++
    else if (trade.pnl < 0) marketBreakdown[market].losses++
  })

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
            <p className="text-xs text-zinc-500 mb-1">Resultado Bruto</p>
            <p className={`text-2xl font-bold ${metrics.netProfit >= 0 ? "text-emerald-400" : "text-red-400"}`}>
              {formatCurrency(metrics.netProfit)}
            </p>
          </div>

          {/* NOVO: Resultado Líquido */}
          <div className="bg-blue-500/10 p-4 rounded-lg border border-blue-500/20">
            <p className="text-xs text-blue-400 mb-1">Resultado Líquido</p>
            <p className={`text-2xl font-bold ${netProfit >= 0 ? "text-blue-400" : "text-red-400"}`}>
              {formatCurrency(netProfit)}
            </p>
          </div>

          <div className="bg-zinc-800 p-4 rounded-lg">
            <p className="text-xs text-zinc-500 mb-1">Win Rate</p>
            <p className="text-2xl font-bold text-white">{formatPercentage(metrics.winRate)}</p>
          </div>

          <div className="bg-zinc-800 p-4 rounded-lg">
            <p className="text-xs text-zinc-500 mb-1">Profit Factor</p>
            <p className="text-2xl font-bold text-white">{metrics.profitFactor.toFixed(2)}</p>
          </div>

          <div className="bg-zinc-800 p-4 rounded-lg">
            <p className="text-xs text-zinc-500 mb-1">Vitórias</p>
            <p className="text-2xl font-bold text-emerald-400">{metrics.wins}</p>
          </div>

          <div className="bg-zinc-800 p-4 rounded-lg">
            <p className="text-xs text-zinc-500 mb-1">Derrotas</p>
            <p className="text-2xl font-bold text-red-400">{metrics.losses}</p>
          </div>

          <div className="bg-zinc-800 p-4 rounded-lg">
            <p className="text-xs text-zinc-500 mb-1">Maior Ganho</p>
            <p className="text-2xl font-bold text-emerald-400">{formatCurrency(metrics.maxWin)}</p>
          </div>

          <div className="bg-zinc-800 p-4 rounded-lg">
            <p className="text-xs text-zinc-500 mb-1">Maior Perda</p>
            <p className="text-2xl font-bold text-red-400">{formatCurrency(metrics.maxLoss)}</p>
          </div>

          {/* NOVO: Custos Operacionais */}
          <div className="bg-orange-500/10 p-4 rounded-lg border border-orange-500/20">
            <p className="text-xs text-orange-400 mb-1">Impostos</p>
            <p className="text-2xl font-bold text-orange-400">{formatCurrency(totalTax)}</p>
          </div>

          <div className="bg-red-500/10 p-4 rounded-lg border border-red-500/20">
            <p className="text-xs text-red-400 mb-1">Custos Operacionais</p>
            <p className="text-2xl font-bold text-red-400">{formatCurrency(totalCosts)}</p>
          </div>

          <div className="bg-zinc-800 p-4 rounded-lg">
            <p className="text-xs text-zinc-500 mb-1">Corretagem</p>
            <p className="text-xl font-bold text-zinc-300">{formatCurrency(totalCommission)}</p>
          </div>
        </div>

        {/* NOVO: Breakdown de Custos */}
        <div className="bg-zinc-800/50 rounded-lg p-4 mb-6">
          <h4 className="text-sm font-bold text-white mb-3">💰 Breakdown Financeiro</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-zinc-400">Resultado Bruto:</span>
              <span className={metrics.netProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}>
                {formatCurrency(metrics.netProfit)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">(-) Corretagem:</span>
              <span className="text-red-400">{formatCurrency(totalCommission)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">(-) Swap:</span>
              <span className="text-red-400">{formatCurrency(totalSwap)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">(-) Impostos:</span>
              <span className="text-orange-400">{formatCurrency(totalTax)}</span>
            </div>
            <div className="flex justify-between border-t border-zinc-700 pt-2 mt-2">
              <span className="text-white font-bold">(=) Resultado Líquido:</span>
              <span className={`font-bold ${netProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {formatCurrency(netProfit)}
              </span>
            </div>
          </div>
        </div>

        {/* NOVO: Desempenho por Mercado */}
        {Object.keys(marketBreakdown).length > 0 && (
          <div className="mb-6">
            <h4 className="text-sm font-bold text-white mb-3">🌍 Desempenho por Mercado</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(marketBreakdown).map(([market, data]) => {
                const winRate = data.trades.length > 0 ? (data.wins / data.trades.length) * 100 : 0
                const netResult = data.totalPnL - data.totalCosts - data.totalTax
                return (
                  <div key={market} className="bg-zinc-800/50 rounded-lg p-4">
                    <h5 className="font-bold text-white mb-2">
                      {MARKET_NAMES[market] || market}
                    </h5>
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span className="text-zinc-400">Trades:</span>
                        <span className="text-white">{data.trades.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-400">Win Rate:</span>
                        <span className="text-emerald-400">{winRate.toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-400">PnL Bruto:</span>
                        <span className={data.totalPnL >= 0 ? 'text-emerald-400' : 'text-red-400'}>
                          {formatCurrency(data.totalPnL)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-400">Impostos:</span>
                        <span className="text-orange-400">{formatCurrency(data.totalTax)}</span>
                      </div>
                      <div className="flex justify-between border-t border-zinc-700 pt-1 mt-1">
                        <span className="text-white font-medium">Líquido:</span>
                        <span className={`font-bold ${netResult >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                          {formatCurrency(netResult)}
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

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
            Relatório visual profissional com resumo executivo, métricas, breakdown de custos/impostos e tabela completa de trades.
            Ideal para apresentações e impressão.
          </p>
        </Card>

        <Card>
          <h4 className="text-md font-bold text-white mb-2">📊 Excel</h4>
          <p className="text-sm text-zinc-400">
            Planilha completa com abas: Resumo (métricas + impostos), Por Mercado e Trades (histórico detalhado).
            Perfeito para análises personalizadas.
          </p>
        </Card>

        <Card>
          <h4 className="text-md font-bold text-white mb-2">📋 CSV</h4>
          <p className="text-sm text-zinc-400">
            Arquivo simples e leve com histórico completo incluindo impostos e custos.
            Compatível com qualquer software de análise de dados.
          </p>
        </Card>
      </div>
    </div>
  )
}


