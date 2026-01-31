import { useState, useEffect, useMemo } from "react"
import { useTrades } from "../../hooks/useTrades"
import { useAuth } from "../auth/AuthContext"
import { Card } from "../../components/ui/Card"
import { TradeFilters } from "../../components/filters/TradeFilters"
import { ExportButtons } from "../../components/exports/ExportButtons"
import { getExchangeRate } from "../../services/currency/exchangeRates"
import { calculatePeriodTax } from "../../utils/taxes/taxCalculator"
import { MARKET_NAMES } from "../../constants/markets"

export const Reports = () => {
  const { trades, loading } = useTrades()
  const { user } = useAuth()
  
  const [selectedCurrency, setSelectedCurrency] = useState('USD')
  const [exchangeRate, setExchangeRate] = useState(5.45)
  const [loadingRate, setLoadingRate] = useState(false)
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    symbol: "",
    strategy: "",
    result: "all",
    market: "all"
  })

  // Buscar cotação
  useEffect(() => {
    const fetchRate = async () => {
      try {
        setLoadingRate(true)
        const rate = await getExchangeRate('USD', 'BRL')
        setExchangeRate(rate)
      } catch (error) {
        console.error('Erro ao buscar cotação', error)
      } finally {
        setLoadingRate(false)
      }
    }

    fetchRate()
  }, [])

  // ✅ FILTRAR TRADES
  const filteredTrades = useMemo(() => {
    return trades.filter(trade => {
      if (filters.startDate && trade.date < filters.startDate) return false
      if (filters.endDate && trade.date > filters.endDate) return false
      if (filters.symbol && !(trade.asset || trade.symbol || "").toLowerCase().includes(filters.symbol.toLowerCase())) return false
      if (filters.strategy && !(trade.strategy || "").toLowerCase().includes(filters.strategy.toLowerCase())) return false
      if (filters.result === "win" && trade.pnl <= 0) return false
      if (filters.result === "loss" && trade.pnl >= 0) return false
      if (filters.market !== "all" && trade.market !== filters.market) return false
      return true
    })
  }, [trades, filters])

  // ✅ CALCULAR MÉTRICAS BÁSICAS
  const basicMetrics = useMemo(() => {
    if (filteredTrades.length === 0) return null

    let totalPnlUSD = 0, totalPnlBRL = 0
    let totalCommissionUSD = 0, totalCommissionBRL = 0
    let totalSwapUSD = 0, totalSwapBRL = 0
    let wins = 0, losses = 0
    let maxWinUSD = 0, maxWinBRL = 0
    let maxLossUSD = 0, maxLossBRL = 0
    let winsUSD = [], winsBRL = []
    let lossesUSD = [], lossesBRL = []

    filteredTrades.forEach(trade => {
      const isUSD = trade.currency === 'USD'
      const pnl = parseFloat(trade.pnl || 0)
      const commission = parseFloat(trade.commission || 0)
      const swap = parseFloat(trade.swap || 0)

      if (isUSD) {
        totalPnlUSD += pnl
        totalCommissionUSD += commission
        totalSwapUSD += swap

        if (pnl > 0) {
          wins++
          winsUSD.push(pnl)
          if (pnl > maxWinUSD) maxWinUSD = pnl
        } else if (pnl < 0) {
          losses++
          lossesUSD.push(pnl)
          if (pnl < maxLossUSD) maxLossUSD = pnl
        }
      } else {
        totalPnlBRL += pnl
        totalCommissionBRL += commission
        totalSwapBRL += swap

        if (pnl > 0) {
          wins++
          winsBRL.push(pnl)
          if (pnl > maxWinBRL) maxWinBRL = pnl
        } else if (pnl < 0) {
          losses++
          lossesBRL.push(pnl)
          if (pnl < maxLossBRL) maxLossBRL = pnl
        }
      }
    })

    const avgWinUSD = winsUSD.length > 0 ? winsUSD.reduce((a, b) => a + b, 0) / winsUSD.length : 0
    const avgWinBRL = winsBRL.length > 0 ? winsBRL.reduce((a, b) => a + b, 0) / winsBRL.length : 0
    const avgLossUSD = lossesUSD.length > 0 ? lossesUSD.reduce((a, b) => a + b, 0) / lossesUSD.length : 0
    const avgLossBRL = lossesBRL.length > 0 ? lossesBRL.reduce((a, b) => a + b, 0) / lossesBRL.length : 0

    const winRate = filteredTrades.length > 0 ? (wins / filteredTrades.length) * 100 : 0

    const totalGrossProfitUSD = winsUSD.reduce((a, b) => a + b, 0)
    const totalGrossProfitBRL = winsBRL.reduce((a, b) => a + b, 0)
    const totalGrossLossUSD = Math.abs(lossesUSD.reduce((a, b) => a + b, 0))
    const totalGrossLossBRL = Math.abs(lossesBRL.reduce((a, b) => a + b, 0))

    const totalGrossProfit = totalGrossProfitUSD + (totalGrossProfitBRL / exchangeRate)
    const totalGrossLoss = totalGrossLossUSD + (totalGrossLossBRL / exchangeRate)
    const profitFactor = totalGrossLoss > 0 ? totalGrossProfit / totalGrossLoss : 0

    return {
      totalPnlUSD,
      totalPnlBRL,
      totalCommissionUSD,
      totalCommissionBRL,
      totalSwapUSD,
      totalSwapBRL,
      wins,
      losses,
      winRate,
      maxWinUSD,
      maxWinBRL,
      maxLossUSD,
      maxLossBRL,
      avgWinUSD,
      avgWinBRL,
      avgLossUSD,
      avgLossBRL,
      profitFactor
    }
  }, [filteredTrades, exchangeRate])

  // ✅ CALCULAR IMPOSTOS
  const [taxMetrics, setTaxMetrics] = useState({ totalTaxUSD: 0, totalTaxBRL: 0 })
  const [calculatingTax, setCalculatingTax] = useState(false)

  useEffect(() => {
    if (!filteredTrades.length || !user?.uid) {
      setTaxMetrics({ totalTaxUSD: 0, totalTaxBRL: 0 })
      return
    }

    let cancelled = false

    const calculateTax = async () => {
      setCalculatingTax(true)

      try {
        const currentPeriod = new Date().toISOString().split('T')[0].slice(0, 7)
        let totalTaxUSD = 0, totalTaxBRL = 0

        const tradesByMarket = filteredTrades.reduce((acc, trade) => {
          const market = trade.market || 'forex'
          if (!acc[market]) acc[market] = []
          acc[market].push(trade)
          return acc
        }, {})

        for (const [market, marketTrades] of Object.entries(tradesByMarket)) {
          if (cancelled) return

          const taxInfo = await calculatePeriodTax(marketTrades, market, currentPeriod, user.uid)
          
          let pnlUSD = 0, pnlBRL = 0
          marketTrades.forEach(t => {
            const pnl = parseFloat(t.pnl || 0)
            if (t.currency === 'USD') pnlUSD += pnl
            else pnlBRL += pnl
          })

          const totalPnL = taxInfo.consolidatedPnL || 0
          if (totalPnL > 0 && taxInfo.taxAmount > 0) {
            const usdRatio = pnlUSD / totalPnL
            const brlRatio = pnlBRL / totalPnL

            totalTaxUSD += (taxInfo.taxAmount || 0) * usdRatio
            totalTaxBRL += (taxInfo.taxAmount || 0) * brlRatio
          }
        }

        if (!cancelled) {
          setTaxMetrics({ totalTaxUSD, totalTaxBRL })
        }
      } catch (error) {
        console.error('Erro ao calcular impostos:', error)
        if (!cancelled) {
          setTaxMetrics({ totalTaxUSD: 0, totalTaxBRL: 0 })
        }
      } finally {
        if (!cancelled) {
          setCalculatingTax(false)
        }
      }
    }

    calculateTax()

    return () => {
      cancelled = true
    }
  }, [filteredTrades, user?.uid])

  // ✅ MÉTRICAS COMPLETAS COM VALORES PADRÃO
  const metrics = useMemo(() => {
    if (!basicMetrics) {
      return {
        totalPnlUSD: 0,
        totalPnlBRL: 0,
        totalCommissionUSD: 0,
        totalCommissionBRL: 0,
        totalSwapUSD: 0,
        totalSwapBRL: 0,
        totalTaxUSD: 0,
        totalTaxBRL: 0,
        wins: 0,
        losses: 0,
        winRate: 0,
        maxWinUSD: 0,
        maxWinBRL: 0,
        maxLossUSD: 0,
        maxLossBRL: 0,
        avgWinUSD: 0,
        avgWinBRL: 0,
        avgLossUSD: 0,
        avgLossBRL: 0,
        profitFactor: 0
      }
    }
    return { ...basicMetrics, ...taxMetrics }
  }, [basicMetrics, taxMetrics])

  if (loading) {
    return <div className="text-center p-8 text-zinc-400">Carregando...</div>
  }

  // Funções de formatação
  const convertValue = (usdValue, brlValue) => {
    const usd = parseFloat(usdValue || 0)
    const brl = parseFloat(brlValue || 0)

    if (selectedCurrency === 'USD') {
      return usd + (brl / exchangeRate)
    } else {
      return (usd * exchangeRate) + brl
    }
  }

  const formatCurrency = (value) => {
    const numValue = parseFloat(value || 0)
    const symbol = selectedCurrency === 'USD' ? '$' : 'R$'
    const locale = selectedCurrency === 'USD' ? 'en-US' : 'pt-BR'
    return symbol + ' ' + Math.abs(numValue).toLocaleString(locale, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })
  }

  const formatEquivalent = (usdValue, brlValue) => {
    const usd = parseFloat(usdValue || 0)
    const brl = parseFloat(brlValue || 0)

    if (selectedCurrency === 'USD') {
      const totalBRL = (usd * exchangeRate) + brl
      return '≈ R$ ' + totalBRL.toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })
    } else {
      const totalUSD = usd + (brl / exchangeRate)
      return '≈ $ ' + totalUSD.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })
    }
  }

  const formatPercentage = (value) => {
    const numValue = parseFloat(value || 0)
    return numValue.toFixed(1) + '%'
  }

  const totalPnl = convertValue(metrics.totalPnlUSD, metrics.totalPnlBRL)
  const totalCommission = convertValue(metrics.totalCommissionUSD, metrics.totalCommissionBRL)
  const totalSwap = convertValue(metrics.totalSwapUSD, metrics.totalSwapBRL)
  const totalTax = convertValue(metrics.totalTaxUSD, metrics.totalTaxBRL)
  const totalCosts = totalCommission + totalSwap
  const netProfit = totalPnl + totalCosts - totalTax

  const maxWin = convertValue(metrics.maxWinUSD, metrics.maxWinBRL)
  const maxLoss = convertValue(metrics.maxLossUSD, metrics.maxLossBRL)

  // Breakdown por mercado
  const marketBreakdown = {}
  filteredTrades.forEach(trade => {
    const market = trade.market || 'forex'
    if (!marketBreakdown[market]) {
      marketBreakdown[market] = {
        trades: [],
        totalPnLUSD: 0,
        totalPnLBRL: 0,
        totalCostsUSD: 0,
        totalCostsBRL: 0,
        wins: 0,
        losses: 0
      }
    }

    marketBreakdown[market].trades.push(trade)

    const isUSD = trade.currency === 'USD'
    const pnl = parseFloat(trade.pnl || 0)
    const commission = parseFloat(trade.commission || 0)
    const swap = parseFloat(trade.swap || 0)

    if (isUSD) {
      marketBreakdown[market].totalPnLUSD += pnl
      marketBreakdown[market].totalCostsUSD += (commission + swap)
    } else {
      marketBreakdown[market].totalPnLBRL += pnl
      marketBreakdown[market].totalCostsBRL += (commission + swap)
    }

    if (pnl > 0) marketBreakdown[market].wins++
    else if (pnl < 0) marketBreakdown[market].losses++
  })

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">📊 Gerar Relatórios</h2>
          <p className="text-zinc-400">Exporte seus dados de trading em PDF, Excel ou CSV</p>
        </div>

        {/* Seletor de Moeda */}
        <div className="flex gap-1 bg-zinc-800 rounded-lg p-1 border border-zinc-700">
          <button
            onClick={() => setSelectedCurrency('BRL')}
            className={`px-3 py-1.5 rounded-lg transition-colors text-sm font-medium ${
              selectedCurrency === 'BRL'
                ? 'bg-emerald-500 text-white'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            R$
          </button>
          <button
            onClick={() => setSelectedCurrency('USD')}
            className={`px-3 py-1.5 rounded-lg transition-colors text-sm font-medium ${
              selectedCurrency === 'USD'
                ? 'bg-emerald-500 text-white'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            $
          </button>
        </div>
      </div>

      {/* Cotação */}
      {!loadingRate && (
        <Card className="bg-blue-900/20 border-blue-500/50">
          <div className="flex items-center gap-2 text-sm text-blue-300">
            <span>💱</span>
            <span>Cotação atual: 1 USD = R$ {exchangeRate.toFixed(4)}</span>
          </div>
        </Card>
      )}

      {/* Indicador de cálculo de impostos */}
      {calculatingTax && (
        <Card className="bg-yellow-900/20 border-yellow-500/50">
          <div className="flex items-center gap-2 text-sm text-yellow-300">
            <span>⏳</span>
            <span>Calculando impostos...</span>
          </div>
        </Card>
      )}

      <TradeFilters onFilterChange={setFilters} />

      {/* Prévia das Métricas */}
      <Card>
        <h3 className="text-lg font-bold text-white mb-4">📈 Prévia do Relatório</h3>

        {/* ✅ MENSAGEM QUANDO NÃO HÁ TRADES */}
        {filteredTrades.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📭</div>
            <p className="text-zinc-400 text-xl mb-2">Nenhum trade encontrado</p>
            <p className="text-zinc-500 text-sm">Ajuste os filtros acima para ver os resultados</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
              <div className="bg-zinc-800 p-4 rounded-lg">
                <p className="text-xs text-zinc-500 mb-1">Total de Trades</p>
                <p className="text-2xl font-bold text-white">{filteredTrades.length}</p>
              </div>

              <div className="bg-zinc-800 p-4 rounded-lg">
                <p className="text-xs text-zinc-500 mb-1">Resultado Bruto</p>
                <p className={`text-2xl font-bold ${totalPnl >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                  {totalPnl >= 0 ? '' : '-'}{formatCurrency(Math.abs(totalPnl))}
                </p>
                <p className="text-xs text-zinc-400 mt-1">
                  {formatEquivalent(metrics.totalPnlUSD, metrics.totalPnlBRL)}
                </p>
              </div>

              <div className="bg-blue-500/10 p-4 rounded-lg border border-blue-500/20">
                <p className="text-xs text-blue-400 mb-1">Resultado Líquido</p>
                <p className={`text-2xl font-bold ${netProfit >= 0 ? "text-blue-400" : "text-red-400"}`}>
                  {netProfit >= 0 ? '' : '-'}{formatCurrency(Math.abs(netProfit))}
                </p>
                <p className="text-xs text-zinc-400 mt-1">
                  {formatEquivalent(
                    metrics.totalPnlUSD + metrics.totalCommissionUSD + metrics.totalSwapUSD - metrics.totalTaxUSD,
                    metrics.totalPnlBRL + metrics.totalCommissionBRL + metrics.totalSwapBRL - metrics.totalTaxBRL
                  )}
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
                <p className="text-2xl font-bold text-emerald-400">{formatCurrency(maxWin)}</p>
                <p className="text-xs text-zinc-400 mt-1">
                  {formatEquivalent(metrics.maxWinUSD, metrics.maxWinBRL)}
                </p>
              </div>

              <div className="bg-zinc-800 p-4 rounded-lg">
                <p className="text-xs text-zinc-500 mb-1">Maior Perda</p>
                <p className="text-2xl font-bold text-red-400">{formatCurrency(Math.abs(maxLoss))}</p>
                <p className="text-xs text-zinc-400 mt-1">
                  {formatEquivalent(metrics.maxLossUSD, metrics.maxLossBRL)}
                </p>
              </div>

              <div className="bg-orange-500/10 p-4 rounded-lg border border-orange-500/20">
                <p className="text-xs text-orange-400 mb-1">Impostos</p>
                <p className="text-2xl font-bold text-orange-400">{formatCurrency(totalTax)}</p>
                <p className="text-xs text-zinc-400 mt-1">
                  {formatEquivalent(metrics.totalTaxUSD, metrics.totalTaxBRL)}
                </p>
              </div>

              <div className="bg-red-500/10 p-4 rounded-lg border border-red-500/20">
                <p className="text-xs text-red-400 mb-1">Custos Operacionais</p>
                <p className="text-2xl font-bold text-red-400">{formatCurrency(Math.abs(totalCosts))}</p>
                <p className="text-xs text-zinc-400 mt-1">
                  {formatEquivalent(
                    metrics.totalCommissionUSD + metrics.totalSwapUSD,
                    metrics.totalCommissionBRL + metrics.totalSwapBRL
                  )}
                </p>
              </div>

              <div className="bg-zinc-800 p-4 rounded-lg">
                <p className="text-xs text-zinc-500 mb-1">Corretagem</p>
                <p className="text-xl font-bold text-zinc-300">{formatCurrency(Math.abs(totalCommission))}</p>
                <p className="text-xs text-zinc-400 mt-1">
                  {formatEquivalent(metrics.totalCommissionUSD, metrics.totalCommissionBRL)}
                </p>
              </div>
            </div>

            {/* Breakdown Financeiro */}
            <div className="bg-zinc-800/50 rounded-lg p-4 mb-6">
              <h4 className="text-sm font-bold text-white mb-3">💰 Breakdown Financeiro</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-zinc-400">Resultado Bruto:</span>
                  <span className={totalPnl >= 0 ? 'text-emerald-400' : 'text-red-400'}>
                    {totalPnl >= 0 ? '' : '-'}{formatCurrency(Math.abs(totalPnl))}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">(-) Corretagem:</span>
                  <span className="text-red-400">{formatCurrency(Math.abs(totalCommission))}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">(-) Swap:</span>
                  <span className="text-red-400">{formatCurrency(Math.abs(totalSwap))}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">(-) Impostos:</span>
                  <span className="text-orange-400">{formatCurrency(totalTax)}</span>
                </div>
                <div className="flex justify-between border-t border-zinc-700 pt-2 mt-2">
                  <span className="text-white font-bold">(=) Resultado Líquido:</span>
                  <span className={`font-bold ${netProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {netProfit >= 0 ? '' : '-'}{formatCurrency(Math.abs(netProfit))}
                  </span>
                </div>
              </div>
            </div>

            {/* Desempenho por Mercado */}
            {Object.keys(marketBreakdown).length > 0 && (
              <div className="mb-6">
                <h4 className="text-sm font-bold text-white mb-3">🌍 Desempenho por Mercado</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(marketBreakdown).map(([market, data]) => {
                    const winRate = data.trades.length > 0 ? (data.wins / data.trades.length) * 100 : 0
                    const pnl = convertValue(data.totalPnLUSD, data.totalPnLBRL)

                    return (
                      <div key={market} className="bg-zinc-800/50 rounded-lg p-4">
                        <h5 className="text-white font-bold mb-2">{MARKET_NAMES[market] || market}</h5>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span className="text-zinc-400">Trades:</span>
                            <span className="text-white">{data.trades.length}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-zinc-400">Win Rate:</span>
                            <span className="text-white">{winRate.toFixed(1)}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-zinc-400">PnL Bruto:</span>
                            <span className={pnl >= 0 ? 'text-emerald-400' : 'text-red-400'}>
                              {pnl >= 0 ? '' : '-'}{formatCurrency(Math.abs(pnl))}
                            </span>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            <div className="text-xs text-zinc-500 mt-4">
              Período: {filteredTrades.length > 0 ? `${filteredTrades[0].date} até ${filteredTrades[filteredTrades.length - 1].date}` : 'N/A'}
              <br />
              Total de registros: {filteredTrades.length} trades
            </div>
          </>
        )}
      </Card>

      {/* Botões de Exportação - Só mostra se tiver trades */}
      {filteredTrades.length > 0 && (
        <ExportButtons 
          trades={filteredTrades}
          metrics={metrics}
          selectedCurrency={selectedCurrency}
          exchangeRate={exchangeRate}
        />
      )}
    </div>
  )
}
