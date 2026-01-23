import { useState, useEffect } from 'react'
import { useAuth } from '../auth/AuthContext'
import { Card } from '../../components/ui'
import { MARKETS, getCurrencySymbol } from '../../constants/markets'
import { getExchangeRate } from '../../services/currency/exchangeRates'

export const ConsolidatedDashboard = ({ trades }) => {
  const { isPro } = useAuth()
  const [selectedCurrency, setSelectedCurrency] = useState('USD')
  const [summary, setSummary] = useState({})
  const [exchangeRate, setExchangeRate] = useState(5.45)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchRate = async () => {
      try {
        setLoading(true)
        const rate = await getExchangeRate('USD', 'BRL')
        setExchangeRate(rate)
      } catch (error) {
        console.error('Erro ao buscar cotação:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchRate()
  }, [])

  // ✅ CALCULAR RESUMO CONSIDERANDO A MOEDA DE CADA TRADE
  useEffect(() => {
    if (trades.length > 0) {
      const marketSummary = {}

      trades.forEach(trade => {
        const market = trade.market || 'forex'

        if (!marketSummary[market]) {
          marketSummary[market] = {
            trades: 0,
            winningTrades: 0,
            totalPnlUSD: 0,
            totalPnlBRL: 0,
            totalTaxUSD: 0,
            totalTaxBRL: 0
          }
        }

        const pnl = parseFloat(trade.pnl) || 0
        const taxAmount = parseFloat(trade.taxes?.amount) || 0

        marketSummary[market].trades++
        if (pnl > 0) marketSummary[market].winningTrades++

        // ✅ Separar por moeda original
        if (trade.currency === 'USD') {
          marketSummary[market].totalPnlUSD += pnl
          marketSummary[market].totalTaxUSD += taxAmount
        } else {
          marketSummary[market].totalPnlBRL += pnl
          marketSummary[market].totalTaxBRL += taxAmount
        }
      })

      setSummary(marketSummary)
    }
  }, [trades, exchangeRate])

  // ✅ CONVERTER valores considerando moeda original
  const convertValue = (usdValue, brlValue) => {
    const usd = parseFloat(usdValue) || 0
    const brl = parseFloat(brlValue) || 0
    
    if (selectedCurrency === 'USD') {
      return usd + (brl / exchangeRate)
    } else {
      return (usd * exchangeRate) + brl
    }
  }

  const formatValue = (value) => {
    const num = parseFloat(value) || 0
    return num.toLocaleString(selectedCurrency === 'BRL' ? 'pt-BR' : 'en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })
  }

  // ✅ Mostrar equivalente correto
  const formatEquivalent = (usdValue, brlValue) => {
    const usd = parseFloat(usdValue) || 0
    const brl = parseFloat(brlValue) || 0
    
    if (selectedCurrency === 'USD') {
      const totalBRL = (usd * exchangeRate) + brl
      return `≈ R$ ${totalBRL.toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })}`
    } else {
      const totalUSD = usd + (brl / exchangeRate)
      return `≈ $ ${totalUSD.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })}`
    }
  }

  const getTotalPnl = () => {
    let totalUSD = 0
    let totalBRL = 0
    Object.values(summary).forEach(market => {
      totalUSD += parseFloat(market.totalPnlUSD) || 0
      totalBRL += parseFloat(market.totalPnlBRL) || 0
    })
    return convertValue(totalUSD, totalBRL)
  }

  const getTotalPnlRaw = () => {
    let totalUSD = 0
    let totalBRL = 0
    Object.values(summary).forEach(market => {
      totalUSD += parseFloat(market.totalPnlUSD) || 0
      totalBRL += parseFloat(market.totalPnlBRL) || 0
    })
    return { usd: totalUSD, brl: totalBRL }
  }

  const getTotalTax = () => {
    let totalUSD = 0
    let totalBRL = 0
    Object.values(summary).forEach(market => {
      totalUSD += parseFloat(market.totalTaxUSD) || 0
      totalBRL += parseFloat(market.totalTaxBRL) || 0
    })
    return convertValue(totalUSD, totalBRL)
  }

  const getTotalTaxRaw = () => {
    let totalUSD = 0
    let totalBRL = 0
    Object.values(summary).forEach(market => {
      totalUSD += parseFloat(market.totalTaxUSD) || 0
      totalBRL += parseFloat(market.totalTaxBRL) || 0
    })
    return { usd: totalUSD, brl: totalBRL }
  }

  const getNetProfit = () => {
    const pnl = getTotalPnl()
    const tax = getTotalTax()
    return pnl - tax
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white">Dashboard Consolidado</h1>

        <div className="flex gap-2 bg-zinc-800 rounded-lg p-1">
          <button
            onClick={() => setSelectedCurrency('BRL')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              selectedCurrency === 'BRL'
                ? 'bg-emerald-500 text-white'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            R$ BRL
          </button>
          <button
            onClick={() => setSelectedCurrency('USD')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              selectedCurrency === 'USD'
                ? 'bg-emerald-500 text-white'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            $ USD
          </button>
        </div>
      </div>

      {!loading && (
        <Card className="bg-blue-900/20 border-blue-500/50">
          <div className="flex items-center gap-2 text-sm text-blue-300">
            <span>💱</span>
            <span>Cotação atual: 1 USD = R$ {exchangeRate.toFixed(4)}</span>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <div className="text-center">
            <p className="text-zinc-400 text-sm mb-2">Lucro Bruto</p>
            <p className="text-3xl font-bold text-white">
              {getCurrencySymbol(selectedCurrency)} {formatValue(getTotalPnl())}
            </p>
            <p className="text-xs text-zinc-500 mt-1">
              {formatEquivalent(getTotalPnlRaw().usd, getTotalPnlRaw().brl)}
            </p>
            <p className="text-xs text-zinc-500 mt-1">{trades.length} trades</p>
          </div>
        </Card>

        <Card>
          <div className="text-center">
            <p className="text-zinc-400 text-sm mb-2">Impostos</p>
            <p className="text-3xl font-bold text-red-400">
              {getCurrencySymbol(selectedCurrency)} {formatValue(getTotalTax())}
            </p>
            <p className="text-xs text-zinc-500 mt-1">
              {formatEquivalent(getTotalTaxRaw().usd, getTotalTaxRaw().brl)}
            </p>
            <p className="text-xs text-zinc-500 mt-1">
              {getTotalPnl() > 0 ? ((getTotalTax() / getTotalPnl()) * 100).toFixed(1) : '0.0'}% do lucro
            </p>
          </div>
        </Card>

        <Card>
          <div className="text-center">
            <p className="text-zinc-400 text-sm mb-2">Lucro Líquido</p>
            <p className={`text-3xl font-bold ${getNetProfit() > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {getCurrencySymbol(selectedCurrency)} {formatValue(getNetProfit())}
            </p>
            <p className="text-xs text-zinc-500 mt-1">
              {formatEquivalent(
                getTotalPnlRaw().usd - getTotalTaxRaw().usd,
                getTotalPnlRaw().brl - getTotalTaxRaw().brl
              )}
            </p>
            <p className="text-xs text-zinc-500 mt-1">Após impostos</p>
          </div>
        </Card>
      </div>

      <Card>
        <h2 className="text-xl font-bold text-white mb-4">📊 Performance por Mercado</h2>

        <div className="space-y-3">
          {MARKETS.map(market => {
            const data = summary[market.value]
            if (!data || data.trades === 0) return null

            const winRate = ((data.winningTrades / data.trades) * 100).toFixed(1)
            const pnl = convertValue(data.totalPnlUSD, data.totalPnlBRL)
            const tax = convertValue(data.totalTaxUSD, data.totalTaxBRL)

            return (
              <div key={market.value} className="bg-zinc-800 rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{market.icon}</span>
                    <span className="text-white font-medium">{market.label}</span>
                  </div>
                  <span className="text-zinc-400 text-sm">{data.trades} trades</span>
                </div>

                <div className="grid grid-cols-3 gap-4 mt-3">
                  <div>
                    <p className="text-xs text-zinc-500">Lucro</p>
                    <p className={`text-lg font-bold ${pnl > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {getCurrencySymbol(selectedCurrency)} {formatValue(pnl)}
                    </p>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      {formatEquivalent(data.totalPnlUSD, data.totalPnlBRL)}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-zinc-500">Imposto</p>
                    <p className="text-lg font-bold text-red-400">
                      {getCurrencySymbol(selectedCurrency)} {formatValue(tax)}
                    </p>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      {formatEquivalent(data.totalTaxUSD, data.totalTaxBRL)}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-zinc-500">Win Rate</p>
                    <p className="text-lg font-bold text-white">{winRate}%</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </Card>
    </div>
  )
}
