import { useState, useEffect } from 'react'
import { Card } from '../../components/ui'
import { getCurrencySymbol } from '../../constants/markets'

export const OptionsDashboard = ({ trades }) => {
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
    totalPremiums: 0,
    callsCount: 0,
    putsCount: 0,
    totalSales: 0,
    isExempt: false
  })

  useEffect(() => {
    const optionsTrades = trades.filter(t => t.market === 'b3options')
    
    if (optionsTrades.length === 0) {
      return
    }

    const winning = optionsTrades.filter(t => t.pnl > 0)
    const losing = optionsTrades.filter(t => t.pnl < 0)
    const totalPnl = optionsTrades.reduce((sum, t) => sum + parseFloat(t.pnl || 0), 0)
    
    // Calcular total de vendas (prêmios) para verificar isenção
    const totalSales = optionsTrades.reduce((sum, t) => {
      const exitValue = (parseFloat(t.exitPrice || 0) * parseFloat(t.quantity || 1))
      return sum + exitValue
    }, 0)
    
    // Verificar se está isento (vendas < R$ 20.000)
    const isExempt = totalSales < 20000
    const taxRate = isExempt ? 0 : 0.15 // 15% se não isento
    const totalTax = totalPnl > 0 ? totalPnl * taxRate : 0

    // Contar calls e puts baseado no ativo
    const callsCount = optionsTrades.filter(t => 
      t.asset?.toUpperCase().includes('CALL') || t.asset?.match(/[A-Z]{4}\d{2}C/)
    ).length
    const putsCount = optionsTrades.filter(t => 
      t.asset?.toUpperCase().includes('PUT') || t.asset?.match(/[A-Z]{4}\d{2}P/)
    ).length

    const totalPremiums = optionsTrades.reduce((sum, t) => {
      return sum + (parseFloat(t.entryPrice || 0) * parseFloat(t.quantity || 1))
    }, 0)

    const pnls = optionsTrades.map(t => parseFloat(t.pnl || 0))
    const bestTrade = Math.max(...pnls)
    const worstTrade = Math.min(...pnls)

    setStats({
      totalTrades: optionsTrades.length,
      winningTrades: winning.length,
      losingTrades: losing.length,
      totalPnl,
      totalTax,
      avgPnl: totalPnl / optionsTrades.length,
      winRate: (winning.length / optionsTrades.length) * 100,
      bestTrade,
      worstTrade,
      totalPremiums,
      callsCount,
      putsCount,
      totalSales,
      isExempt
    })
  }, [trades])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <span className="text-4xl">🎯</span>
        <div>
          <h1 className="text-3xl font-bold text-white">B3 Opções</h1>
          <p className="text-zinc-400">Calls e Puts na Bolsa Brasileira</p>
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
            <p className="text-zinc-400 text-sm mb-1">Prêmio Médio</p>
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

      {/* Distribuição Calls x Puts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-blue-900/20 border-blue-500/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-400 text-sm mb-1">📞 Calls (Compra)</p>
              <p className="text-3xl font-bold text-white">{stats.callsCount}</p>
              <p className="text-zinc-400 text-xs mt-1">
                {stats.totalTrades > 0 ? ((stats.callsCount / stats.totalTrades) * 100).toFixed(1) : 0}% do total
              </p>
            </div>
            <div className="text-blue-400 text-5xl">📈</div>
          </div>
        </Card>

        <Card className="bg-orange-900/20 border-orange-500/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-400 text-sm mb-1">📉 Puts (Venda)</p>
              <p className="text-3xl font-bold text-white">{stats.putsCount}</p>
              <p className="text-zinc-400 text-xs mt-1">
                {stats.totalTrades > 0 ? ((stats.putsCount / stats.totalTrades) * 100).toFixed(1) : 0}% do total
              </p>
            </div>
            <div className="text-orange-400 text-5xl">📉</div>
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
              Total de prêmios no mês: <strong>R$ {stats.totalSales.toFixed(2)}</strong>
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
            <p className="text-zinc-400 text-sm mb-2">Resultado Bruto</p>
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
            <p className="text-zinc-400 text-sm mb-2">Resultado Líquido</p>
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
              <p className="text-zinc-400 text-sm mb-1">🏆 Melhor Operação</p>
              <p className="text-2xl font-bold text-emerald-400">
                R$ {stats.bestTrade.toFixed(2)}
              </p>
            </div>
            <div className="text-emerald-400 text-4xl">🎯</div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-zinc-400 text-sm mb-1">📉 Pior Operação</p>
              <p className="text-2xl font-bold text-red-400">
                R$ {stats.worstTrade.toFixed(2)}
              </p>
            </div>
            <div className="text-red-400 text-4xl">⚠️</div>
          </div>
        </Card>
      </div>

      {/* Total de Prêmios */}
      <Card className="bg-indigo-900/20 border-indigo-500/50">
        <div className="flex items-start gap-3">
          <span className="text-2xl">💰</span>
          <div>
            <p className="text-indigo-400 font-bold mb-1">Total em Prêmios Movimentados</p>
            <p className="text-3xl font-bold text-white">R$ {stats.totalPremiums.toFixed(2)}</p>
            <p className="text-zinc-400 text-xs mt-2">
              Soma de todos os prêmios pagos/recebidos nas operações com opções.
            </p>
          </div>
        </div>
      </Card>

      {/* Alerta Fiscal */}
      <Card className="bg-purple-900/20 border-purple-500/50">
        <div className="flex items-start gap-3">
          <span className="text-2xl">📋</span>
          <div>
            <p className="text-purple-400 font-bold mb-1">Informação Fiscal - Opções</p>
            <p className="text-zinc-300 text-sm">
              Operações com opções têm <strong>isenção de IR</strong> para vendas <strong>até R$ 20.000/mês</strong>.
              Acima desse valor, a alíquota é de <strong>15%</strong> sobre o lucro líquido.
            </p>
            <p className="text-zinc-400 text-xs mt-2">
              Pagamento via DARF 3317 até o último dia útil do mês seguinte. Exercício de opções tem regras específicas.
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}
