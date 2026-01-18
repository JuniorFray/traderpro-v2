import { useState, useEffect } from 'react'
import { useAuth } from '../auth/AuthContext'
import { Card } from '../../components/ui'
import { MARKETS, getCurrencySymbol } from '../../constants/markets'
import { calculateTaxSummary } from '../../utils/taxes/taxCalculator'
import { getExchangeRate } from '../../services/currency/exchangeRates'

export const ConsolidatedDashboard = ({ trades }) => {
  const { isPro } = useAuth()
  const [selectedCurrency, setSelectedCurrency] = useState('BRL')
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

  useEffect(() => {
    if (trades.length > 0) {
      const taxSummary = calculateTaxSummary(trades)
      setSummary(taxSummary)
    }
  }, [trades])

  // TODOS os valores no summary JÁ ESTÃO em BRL
  const convertValue = (valueBRL) => {
    if (selectedCurrency === 'BRL') {
      return valueBRL
    }
    
    // Converter BRL -> USD
    return valueBRL / exchangeRate
  }

  const formatValue = (value) => {
    if (selectedCurrency === 'BRL') {
      return value.toLocaleString('pt-BR', { 
        minimumFractionDigits: 2, 
        maximumFractionDigits: 2 
      })
    } else {
      return value.toLocaleString('en-US', { 
        minimumFractionDigits: 2, 
        maximumFractionDigits: 2 
      })
    }
  }

  // Mostrar valor equivalente na outra moeda
  const formatEquivalent = (valueBRL) => {
    if (selectedCurrency === 'USD') {
      // Mostrando em USD, então mostrar equivalente em BRL
      return `≈ R$ ${valueBRL.toLocaleString('pt-BR', { 
        minimumFractionDigits: 2, 
        maximumFractionDigits: 2 
      })}`
    } else {
      // Mostrando em BRL, então mostrar equivalente em USD
      const usdValue = valueBRL / exchangeRate
      return `≈ $ ${usdValue.toLocaleString('en-US', { 
        minimumFractionDigits: 2, 
        maximumFractionDigits: 2 
      })}`
    }
  }

  const getTotalPnl = () => {
    return Object.values(summary).reduce((total, market) => total + market.totalPnl, 0)
  }

  const getTotalTax = () => {
    return Object.values(summary).reduce((total, market) => total + market.totalTax, 0)
  }

  const getNetProfit = () => {
    return getTotalPnl() - getTotalTax()
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
            {selectedCurrency === 'USD' && (
              <span className="text-zinc-400 ml-2">(valores convertidos automaticamente)</span>
            )}
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <div className="text-center">
            <p className="text-zinc-400 text-sm mb-2">Lucro Bruto</p>
            <p className="text-3xl font-bold text-white">
              {getCurrencySymbol(selectedCurrency)} {formatValue(convertValue(getTotalPnl()))}
            </p>
            <p className="text-xs text-zinc-500 mt-1">
              {formatEquivalent(getTotalPnl())}
            </p>
            <p className="text-xs text-zinc-500 mt-1">{trades.length} trades</p>
          </div>
        </Card>

        <Card>
          <div className="text-center">
            <p className="text-zinc-400 text-sm mb-2">Impostos</p>
            <p className="text-3xl font-bold text-red-400">
              {getCurrencySymbol(selectedCurrency)} {formatValue(convertValue(getTotalTax()))}
            </p>
            <p className="text-xs text-zinc-500 mt-1">
              {formatEquivalent(getTotalTax())}
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
              {getCurrencySymbol(selectedCurrency)} {formatValue(convertValue(getNetProfit()))}
            </p>
            <p className="text-xs text-zinc-500 mt-1">
              {formatEquivalent(getNetProfit())}
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
                    <p className={`text-lg font-bold ${data.totalPnl > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {getCurrencySymbol(selectedCurrency)} {formatValue(convertValue(data.totalPnl))}
                    </p>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      {formatEquivalent(data.totalPnl)}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-zinc-500">Imposto</p>
                    <p className="text-lg font-bold text-red-400">
                      {getCurrencySymbol(selectedCurrency)} {formatValue(convertValue(data.totalTax))}
                    </p>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      {formatEquivalent(data.totalTax)}
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
