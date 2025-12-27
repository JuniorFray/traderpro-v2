import { useState } from "react"
import { useTrades } from "../../hooks/useTrades"
import { Card } from "../../components/ui"
import { TradeFilters } from "../../components/filters/TradeFilters"
import { formatCurrency, formatPercent } from "../../utils/metrics"

export const Analytics = () => {
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

  // Análise por Ativo
  const bySymbol = filteredTrades.reduce((acc, trade) => {
    const symbol = trade.asset || trade.symbol || "N/A"
    if (!acc[symbol]) {
      acc[symbol] = { trades: [], pnl: 0, wins: 0, losses: 0 }
    }
    acc[symbol].trades.push(trade)
    acc[symbol].pnl += trade.pnl || 0
    if (trade.pnl > 0) acc[symbol].wins++
    else if (trade.pnl < 0) acc[symbol].losses++
    return acc
  }, {})

  // Análise por Estratégia
  const byStrategy = filteredTrades.reduce((acc, trade) => {
    const strategy = trade.strategy || "Sem Estratégia"
    if (!acc[strategy]) {
      acc[strategy] = { trades: [], pnl: 0, wins: 0, losses: 0 }
    }
    acc[strategy].trades.push(trade)
    acc[strategy].pnl += trade.pnl || 0
    if (trade.pnl > 0) acc[strategy].wins++
    else if (trade.pnl < 0) acc[strategy].losses++
    return acc
  }, {})

  // Análise por Dia da Semana
  const byWeekday = filteredTrades.reduce((acc, trade) => {
    const date = new Date(trade.date + "T12:00:00")
    const weekday = date.toLocaleDateString("pt-BR", { weekday: "long" })
    if (!acc[weekday]) {
      acc[weekday] = { trades: [], pnl: 0, wins: 0, losses: 0, order: date.getDay() }
    }
    acc[weekday].trades.push(trade)
    acc[weekday].pnl += trade.pnl || 0
    if (trade.pnl > 0) acc[weekday].wins++
    else if (trade.pnl < 0) acc[weekday].losses++
    return acc
  }, {})

  const renderTable = (data, title, sortByPnl = true) => {
    const items = Object.entries(data)
      .map(([key, value]) => ({
        name: key,
        ...value,
        winRate: value.wins + value.losses > 0
          ? (value.wins / (value.wins + value.losses)) * 100
          : 0
      }))
      .sort((a, b) => {
        if (sortByPnl) {
          return b.pnl - a.pnl
        } else {
          return a.order - b.order
        }
      })

    return (
      <Card>
        <h3 className="text-lg font-bold text-white mb-4">{title}</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="text-left py-2 text-zinc-400 font-medium">Nome</th>
                <th className="text-right py-2 text-zinc-400 font-medium">Trades</th>
                <th className="text-right py-2 text-zinc-400 font-medium">Vitórias</th>
                <th className="text-right py-2 text-zinc-400 font-medium">Derrotas</th>
                <th className="text-right py-2 text-zinc-400 font-medium">Win Rate</th>
                <th className="text-right py-2 text-zinc-400 font-medium">P&L Total</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.name} className="border-b border-zinc-900">
                  <td className="py-3 text-white font-medium">{item.name}</td>
                  <td className="py-3 text-right text-zinc-300">{item.trades.length}</td>
                  <td className="py-3 text-right text-win">{item.wins}</td>
                  <td className="py-3 text-right text-loss">{item.losses}</td>
                  <td className="py-3 text-right text-zinc-300">{formatPercent(item.winRate)}</td>
                  <td className={`py-3 text-right font-bold ${item.pnl >= 0 ? "text-win" : "text-loss"}`}>
                    {formatCurrency(item.pnl)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Análises Detalhadas</h2>
        <p className="text-zinc-400">Análise profunda por ativo, estratégia e padrões ({filteredTrades.length} trades)</p>
      </div>

      <TradeFilters onFilterChange={setFilters} />

      {filteredTrades.length === 0 ? (
        <Card>
          <div className="text-center py-8 text-zinc-500">
            Nenhum trade encontrado com os filtros aplicados
          </div>
        </Card>
      ) : (
        <>
          {renderTable(bySymbol, "📈 Desempenho por Ativo")}
          {renderTable(byStrategy, "🎯 Desempenho por Estratégia")}
          {renderTable(byWeekday, "📅 Desempenho por Dia da Semana", false)}
        </>
      )}
    </div>
  )
}
