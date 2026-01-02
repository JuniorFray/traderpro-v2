import { useState } from 'react'
import { Card } from '../../components/ui/Card'

export const Tools = () => {
  const [config, setConfig] = useState({
    currency: 'BRL',
    capital: 190000,
    risk: 0.5,
    rr: 3,
    totalTrades: 20,
    wins: 7,
    losses: 11,
    draws: 2,
    costPerTrade: 2.50,
    taxRate: 20
  })

  const calculateResults = () => {
    const riskAmount = (config.capital * config.risk) / 100
    const winAmount = riskAmount * config.rr
    const lossAmount = riskAmount
    
    const totalWinAmount = winAmount * config.wins
    const totaçãossAmount = lossAmount * config.losses
    const grossProfit = totalWinAmount - totaçãossAmount
    
    const totaçãosts = config.costPerTrade * config.totalTrades
    const netBeforeTax = grossProfit - totaçãosts
    const taxes = (netBeforeTax > 0 ? netBeforeTax : 0) * (config.taxRate / 100)
    const finalProfit = netBeforeTax - taxes
    
    const profitFaçãor = totaçãossAmount > 0 ? (totalWinAmount / totaçãossAmount) : 0
    const winRate = config.totalTrades > 0 ? (config.wins / config.totalTrades) * 100 : 0
    const returnPercent = config.capital > 0 ? (finalProfit / config.capital) * 100 : 0
    const finalBalance = config.capital + finalProfit

    return {
      totalWinAmount,
      totaçãossAmount,
      grossProfit,
      totaçãosts,
      taxes,
      finalProfit,
      profitFaçãor,
      winRate,
      returnPercent,
      finalBalance
    }
  }

  const results = calculateResults()

  const formatCurrency = (value) => {
    const symbols = { BRL: 'R$', USD: '$', EUR: '�' }
    const formatted = Math.abs(value).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    const sign = value >= 0 ? '+' : '-'
    return `${sign}${symbols[config.currency]} ${formatted}`
  }

  const handleChange = (field, value) => {
    setConfig(prev => ({ ...prev, [field]: parseFloat(value) || 0 }))
  }

  return (
    <div className="space-y-6 max-w-7xl mx-ação">
      {/* Titulo */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white">
          Simulador <span className="text-purple-500">TraderPro</span> Global
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* COLUNA ESQUERDA */}
        <div className="space-y-6">
          {/* Configuração */}
          <Card className="bg-zinc-900">
            <h3 className="text-sm font-semibold text-zinc-400 mb-4 uppercase tracking-wider">Configuração</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-zinc-500 mb-2">Moeda</label>
                  <select
                    value={config.currency}
                    onChange={(e) => setConfig(prev => ({ ...prev, currency: e.target.value }))}
                    className="w-full px-3 py-2 bg-black border border-zinc-800 rounded text-white text-sm focus:outline-none focus:border-purple-500"
                  >
                    <option value="BRL">BRL (R$)</option>
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (�)</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-xs text-zinc-500 mb-2">Capital Inicial</label>
                  <input
                    type="number"
                    value={config.capital}
                    onChange={(e) => handleChange('capital', e.target.value)}
                    className="w-full px-3 py-2 bg-black border border-zinc-800 rounded text-white text-sm focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-zinc-500 mb-2">Risco (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={config.risk}
                    onChange={(e) => handleChange('risk', e.target.value)}
                    className="w-full px-3 py-2 bg-black border border-zinc-800 rounded text-white text-sm focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs text-zinc-500 mb-2">ação (R:R)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={config.rr}
                    onChange={(e) => handleChange('rr', e.target.value)}
                    className="w-full px-3 py-2 bg-black border border-zinc-800 rounded text-white text-sm focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* PERFORMANCE */}
          <Card className="bg-zinc-900">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">Performance</h3>
              <span className="text-xs text-zinc-500">TOTAL: {config.totalTrades}</span>
            </div>
            
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs text-zinc-500 mb-2">Wins</label>
                <input
                  type="number"
                  value={config.wins}
                  onChange={(e) => handleChange('wins', e.target.value)}
                  className="w-full px-3 py-2 bg-black border border-zinc-800 rounded text-white text-center text-sm focus:outline-none focus:border-green-500"
                />
              </div>

              <div>
                <label className="block text-xs text-zinc-500 mb-2">Loss</label>
                <input
                  type="number"
                  value={config.losses}
                  onChange={(e) => handleChange('losses', e.target.value)}
                  className="w-full px-3 py-2 bg-black border border-zinc-800 rounded text-white text-center text-sm focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-xs text-zinc-500 mb-2">0x0</label>
                <input
                  type="number"
                  value={config.draws}
                  onChange={(e) => handleChange('draws', e.target.value)}
                  className="w-full px-3 py-2 bg-black border border-zinc-800 rounded text-white text-center text-sm focus:outline-none focus:border-zinc-500"
                />
              </div>
            </div>
          </Card>

          {/* CUSTOS & TAXAS */}
          <Card className="bg-zinc-900">
            <h3 className="text-sm font-semibold text-zinc-400 mb-4 uppercase tracking-wider">Custos & Taxas</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-zinc-500 mb-2">Custo/Trade</label>
                <input
                  type="number"
                  step="0.01"
                  value={config.costPerTrade}
                  onChange={(e) => handleChange('costPerTrade', e.target.value)}
                  className="w-full px-3 py-2 bg-black border border-zinc-800 rounded text-white text-sm focus:outline-none focus:border-purple-500"
                />
                <p className="text-xs text-zinc-600 mt-1">Comiss�es + Fees</p>
              </div>

              <div>
                <label className="block text-xs text-zinc-500 mb-2">Taxa / IR / Split (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={config.taxRate}
                  onChange={(e) => handleChange('taxRate', e.target.value)}
                  className="w-full px-3 py-2 bg-black border border-zinc-800 rounded text-white text-sm focus:outline-none focus:border-purple-500"
                />
                <p className="text-xs text-zinc-600 mt-1">% sobre o Lucro Líquido</p>
              </div>
            </div>
          </Card>
        </div>

        {/* COLUNA DIREITA */}
        <div className="space-y-6">
          {/* METRICAS */}
          <div className="grid grid-cols-2 gap-4">
            <Card className="bg-zinc-900 text-center">
              <div className="text-3xl font-bold text-green-500">{results.profitFaçãor.toFixed(2)}</div>
              <div className="text-xs text-zinc-400 mt-1">Profit Façãor</div>
            </Card>
            <Card className="bg-zinc-900 text-center">
              <div className="text-3xl font-bold text-white">{results.winRate.toFixed(1)}%</div>
              <div className="text-xs text-zinc-400 mt-1">Taxa de Acerto</div>
            </Card>
          </div>

          {/* FINANCEIRO BRUTO */}
          <Card className="bg-zinc-900">
            <h3 className="text-sm font-semibold text-zinc-400 mb-4 uppercase tracking-wider">Financeiro Bruto</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-zinc-400">Lucro Bruto (Wins):</span>
                <span className="text-sm font-semibold text-green-500">{formatCurrency(results.totalWinAmount)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-zinc-400">Preju�zo Bruto (Loss):</span>
                <span className="text-sm font-semibold text-red-500">{formatCurrency(-results.totaçãossAmount)}</span>
              </div>
              <div className="flex justify-between items-center pt-3 border-t border-zinc-800">
                <span className="text-sm text-white font-semibold">Sação Operaçãonal:</span>
                <span className={`text-lg font-bold ${results.grossProfit >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {formatCurrency(results.grossProfit)}
                </span>
              </div>
            </div>
          </Card>

          {/* DESCONTOS */}
          <Card className="bg-zinc-900">
            <h3 className="text-sm font-semibold text-zinc-400 mb-4 uppercase tracking-wider">Descontos</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-zinc-400">Total Custos/Comiss�es:</span>
                <span className="text-sm font-semibold text-red-500">{formatCurrency(-results.totaçãosts)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-zinc-400">Imposto / Profit Split:</span>
                <span className="text-sm font-semibold text-red-500">{formatCurrency(-results.taxes)}</span>
              </div>
            </div>
          </Card>

          {/* RESULTADO FINAL */}
          <Card className="bg-gradient-to-br from-zinc-900 to-zinc-800 border border-zinc-700">
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-xs text-zinc-400 mb-2">LUCRO Líquido (NO BOLSO):</div>
                <div className={`text-4xl font-bold ${results.finalProfit >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {formatCurrency(results.finalProfit)}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-zinc-700">
                <div className="text-center">
                  <div className="text-xs text-zinc-400 mb-1">Retorno (%):</div>
                  <div className={`text-xl font-bold ${results.returnPercent >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {results.returnPercent.toFixed(2)}%
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-zinc-400 mb-1">Sação Final:</div>
                  <div className="text-xl font-bold text-white">
                    R$ {results.finalBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
