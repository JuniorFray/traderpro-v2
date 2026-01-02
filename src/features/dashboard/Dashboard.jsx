import { useTrades } from "../../hooks/useTrades"
import { calculateMetrics } from "../../utils/metrics"
import { MetricsCard } from "../trades/MetricsCard"
import { Card } from "../../components/ui/Card"

export const Dashboard = () => {
  const { trades, loading } = useTrades()
  const metrics = calculateMetrics(trades)

  if (loading) {
    return (
      <div className="p-8 text-center">
        <p className="text-zinc-400">Carregação dashboard...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Dashboard</h2>
        <p className="text-zinc-400">Visï¿½o geral do seu desempenho</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricsCard 
          label="Lucro Lï¿½quido" 
          value={metrics.netProfit} 
          type="currency"
          trend={metrics.netProfit}
        />
        <MetricsCard 
          label="Win Rate" 
          value={metrics.winRate} 
          type="percent"
        />
        <MetricsCard 
          label="Total de Trades" 
          value={metrics.totalTrades} 
          type="number"
        />
        <MetricsCard 
          label="Profit Factor" 
          value={(metrics.profitFactor || 0).toFixed(2)} 
          type="number"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <div className="space-y-2">
            <p className="text-sm text-zinc-400">Trades Gaçãos</p>
            <p className="text-2xl font-bold text-win">{metrics.wins}</p>
            <p className="text-xs text-zinc-500">Média: {(metrics.averageWin || 0).toFixed(2)} R$</p>
          </div>
        </Card>

        <Card>
          <div className="space-y-2">
            <p className="text-sm text-zinc-400">Trades Perdidos</p>
            <p className="text-2xl font-bold text-loss">{metrics.losses}</p>
            <p className="text-xs text-zinc-500">Média: {(metrics.averageLoss || 0).toFixed(2)} R$</p>
          </div>
        </Card>

        <Card>
          <div className="space-y-2">
            <p className="text-sm text-zinc-400">Melhor/Pior Trade</p>
            <p className="text-xl font-bold text-win">+{(metrics.bestTrade || 0).toFixed(2)} R$</p>
            <p className="text-xl font-bold text-loss">{(metrics.worstTrade || 0).toFixed(2)} R$</p>
          </div>
        </Card>
      </div>
    </div>
  )
}
