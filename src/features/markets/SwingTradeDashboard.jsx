import { useState, useEffect } from 'react'
import { Card } from '../../components/ui'
import { getCurrencySymbol } from '../../constants/markets'

export const SwingTradeDashboard = ({ trades }) => {
  const [stats, setStats] = useState({
    totalTrades: 0,
    winningTrades: 0,
    losingTrades: 0,
    totalPnl: 0,
    totalTax: 0,
    avgPnl: 0,
    winRate: 0,
    bestTrade: 0,
    worstTrade: 0,
    totalSales: 0,
    isExempt: false
  })

  useEffect(() => {
    const swingTrades = trades.filter(t => t.market === 'b3swing')
    
    if (swingTrades.length === 0) {
      return
    }

    const winning = swingTrades.filter(t => t.pnl > 0)
    const losing = swingTrades.filter(t => t.pnl < 0)
    const totalPnl = swingTrades.reduce((sum, t) => sum + parseFloat(t.pnl || 0), 0)
    
    // Calcular total de vendas para verificar isenção
    const totalSales = swingTrades.reduce((sum, t) => {
      const exitValue = (parseFloat(t.exitPrice || 0) * parseFloat(t.quantity || 1))
      return sum + exitValue
    }, 0)
    
    // Verificar se está isento (vendas < R$ 20.000)
    const isExempt = totalSales < 20000
    const taxRate = isExempt ? 0 : 0.15 // 15% se não isento
    const totalTax = totalPnl > 0 ? totalPnl * taxRate : 0

    const pnls = swingTrades.map(t => parseFloat(t.pnl || 0))
    const bestTrade = Math.max(...pnls)
    const worstTrade = Math.min(...pnls)

    setStats({
      totalTrades: swingTrades.length,
      winningTrades: winning.length,
      losingTrades: losing.length,
      totalPnl,
      totalTax,
      avgPnl: totalPnl / swingTrades.length,
      winRate: (winning.length / swingTrades.length) * 100,
      bestTrade,
      worstTrade,
      totalSales,
      isExempt
    })
  }, [trades])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <span className="text-4xl">📈</span>
        <div>
          <h1 className="text-3xl font-bold text-white">B3 Swing Trade</h1>
          <p className="text-zinc-400">Operações de médio prazo na B3</p>
        </div>
      </div>

      {/* Métricas Principais */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <div className="text-center">
            <p className="text-zinc-400 text-sm mb-1">Total Trades</p>
            <p className="text-2xl font-bold text-white">{stats.totalTrades}</p>
          </div>
        </Card>

        <Card>
          <div className="text-center">
            <p className="text-zinc-400 text-sm mb-1">Win Rate</p>
            <p className="text-2xl font-bold text-emerald-400">
              {stats.winRate.toFixed(1)}%
            </p>
          </div>
        </Card>

        <Card>
          <div className="text-center">
            <p className="text-zinc-400 text-sm mb-1">Lucro Médio</p>
            <p className={`text-2xl font-bold ${stats.avgPnl > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              R$ {stats.avgPnl.toFixed(2)}
            </p>
          </div>
        </Card>

        <Card>
          <div className="text-center">
            <p className="text-zinc-400 text-sm mb-1">Status Fiscal</p>
            <p className={`text-2xl font-bold ${stats.isExempt ? 'text-green-400' : 'text-amber-400'}`}>
              {stats.isExempt ? '✓ Isento' : '15%'}
            </p>
          </div>
        </Card>
      </div>

      {/* Análise de Isenção */}
      <Card className={stats.isExempt ? 'bg-green-900/20 border-green-500/50' : 'bg-amber-900/20 border-amber-500/50'}>
        <div className="flex items-start gap-3">
          <span className="text-2xl">{stats.isExempt ? '✅' : '⚠️'}</span>
          <div className="flex-1">
            <p className={`font-bold mb-1 ${stats.isExempt ? 'text-green-400' : 'text-amber-400'}`}>
              {stats.isExempt ? 'Isenção Fiscal Ativa' : 'Tributação Aplicável'}
            </p>
            <p className="text-zinc-300 text-sm">
              Total de vendas no mês: <strong>R$ {stats.totalSales.toFixed(2)}</strong>
            </p>
            <p className="text-zinc-400 text-xs mt-2">
              {stats.isExempt 
                ? `Você está isento de IR! Limite: R$ ${(20000 - stats.totalSales).toFixed(2)} restantes.`
                : 'Vendas acima de R$ 20.000/mês - Imposto de 15% sobre o lucro.'
              }
            </p>
          </div>
        </div>
      </Card>

      {/* Lucro x Imposto */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <div className="text-center">
            <p className="text-zinc-400 text-sm mb-2">Lucro Bruto</p>
            <p className={`text-3xl font-bold ${stats.totalPnl > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              R$ {stats.totalPnl.toFixed(2)}
            </p>
          </div>
        </Card>

        <Card>
          <div className="text-center">
            <p className="text-zinc-400 text-sm mb-2">Imposto (DARF 3317)</p>
            <p className="text-3xl font-bold text-red-400">
              {stats.isExempt ? 'R$ 0,00' : `- R$ ${stats.totalTax.toFixed(2)}`}
            </p>
          </div>
        </Card>

        <Card>
          <div className="text-center">
            <p className="text-zinc-400 text-sm mb-2">Lucro Líquido</p>
            <p className={`text-3xl font-bold ${(stats.totalPnl - stats.totalTax) > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              R$ {(stats.totalPnl - stats.totalTax).toFixed(2)}
            </p>
          </div>
        </Card>
      </div>

      {/* Melhor e Pior Trade */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-zinc-400 text-sm mb-1">🏆 Melhor Trade</p>
              <p className="text-2xl font-bold text-emerald-400">
                R$ {stats.bestTrade.toFixed(2)}
              </p>
            </div>
            <div className="text-emerald-400 text-4xl">📈</div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-zinc-400 text-sm mb-1">📉 Pior Trade</p>
              <p className="text-2xl font-bold text-red-400">
                R$ {stats.worstTrade.toFixed(2)}
              </p>
            </div>
            <div className="text-red-400 text-4xl">📉</div>
          </div>
        </Card>
      </div>

      {/* Alerta Fiscal */}
      <Card className="bg-purple-900/20 border-purple-500/50">
        <div className="flex items-start gap-3">
          <span className="text-2xl">📋</span>
          <div>
            <p className="text-purple-400 font-bold mb-1">Informação Fiscal - Swing Trade</p>
            <p className="text-zinc-300 text-sm">
              Swing Trade tem <strong>isenção de IR</strong> para vendas <strong>até R$ 20.000/mês</strong>.
              Acima desse valor, a alíquota é de <strong>15%</strong> sobre o lucro líquido.
            </p>
            <p className="text-zinc-400 text-xs mt-2">
              Pagamento via DARF 3317 até o último dia útil do mês seguinte.
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}
