import { useState, useEffect } from "react"
import { useTrades } from "../../hooks/useTrades"
import { Card } from "../../components/ui/Card"
import { TradeFilters } from "../../components/filters/TradeFilters"
import { ExportButtons } from "../../components/exports/ExportButtons"
import { getExchangeRate } from "../../services/currency/exchangeRates"
import { MARKET_NAMES } from "../../constants/markets"

export const Reports = () => {
  const { trades, loading } = useTrades()
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
        console.error('Erro ao buscar cotação:', error)
      } finally {
        setLoadingRate(false)
      }
    }
    
    fetchRate()
  }, [])

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
    if (filters.market !== "all" && trade.market !== filters.market) return false
    return true
  })

  // ✅ Calcular métricas separando USD e BRL
  const calculateMetrics = () => {
    let totalPnlUSD = 0, totalPnlBRL = 0
    let totalCommissionUSD = 0, totalCommissionBRL = 0
    let totalSwapUSD = 0, totalSwapBRL = 0
    let totalTaxUSD = 0, totalTaxBRL = 0
    let wins = 0, losses = 0
    let maxWinUSD = 0, maxWinBRL = 0
    let maxLossUSD = 0, maxLossBRL = 0
    let winsUSD = [], winsBRL = []
    let lossesUSD = [], lossesBRL = []

    filteredTrades.forEach(trade => {
      const isUSD = trade.currency === 'USD'
      const pnl = trade.pnl || 0
      const commission = trade.commission || 0
      const swap = trade.swap || 0
      const tax = trade.taxes?.amount || 0

      if (isUSD) {
        totalPnlUSD += pnl
        totalCommissionUSD += commission
        totalSwapUSD += swap
        totalTaxUSD += tax

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
        totalTaxBRL += tax

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
      totalTaxUSD,
      totalTaxBRL,
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
  }

  const metrics = calculateMetrics()

  // ✅ Converter valores
  const convertValue = (usdValue, brlValue) => {
    if (selectedCurrency === 'USD') {
      return usdValue + (brlValue / exchangeRate)
    } else {
      return (usdValue * exchangeRate) + brlValue
    }
  }

  const formatCurrency = (value) => {
    const symbol = selectedCurrency === 'USD' ? '$' : 'R$'
    const locale = selectedCurrency === 'USD' ? 'en-US' : 'pt-BR'
    return `${symbol} ${Math.abs(value).toLocaleString(locale, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`
  }

  const formatEquivalent = (usdValue, brlValue) => {
    if (selectedCurrency === 'USD') {
      const totalBRL = (usdValue * exchangeRate) + brlValue
      return `≈ R$ ${totalBRL.toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })}`
    } else {
      const totalUSD = usdValue + (brlValue / exchangeRate)
      return `≈ $ ${totalUSD.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })}`
    }
  }

  const formatPercentage = (value) => `${value.toFixed(1)}%`

  const totalPnl = convertValue(metrics.totalPnlUSD, metrics.totalPnlBRL)
  const totalCommission = convertValue(metrics.totalCommissionUSD, metrics.totalCommissionBRL)
  const totalSwap = convertValue(metrics.totalSwapUSD, metrics.totalSwapBRL)
  const totalTax = convertValue(metrics.totalTaxUSD, metrics.totalTaxBRL)
  const totalCosts = totalCommission + totalSwap
  const netProfit = totalPnl - totalCosts - totalTax
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
        totalTaxUSD: 0,
        totalTaxBRL: 0,
        totalCostsUSD: 0,
        totalCostsBRL: 0,
        wins: 0,
        losses: 0
      }
    }
    marketBreakdown[market].trades.push(trade)
    
    const isUSD = trade.currency === 'USD'
    if (isUSD) {
      marketBreakdown[market].totalPnLUSD += trade.pnl
      marketBreakdown[market].totalTaxUSD += (trade.taxes?.amount || 0)
      marketBreakdown[market].totalCostsUSD += (trade.commission || 0) + (trade.swap || 0)
    } else {
      marketBreakdown[market].totalPnLBRL += trade.pnl
      marketBreakdown[market].totalTaxBRL += (trade.taxes?.amount || 0)
      marketBreakdown[market].totalCostsBRL += (trade.commission || 0) + (trade.swap || 0)
    }

    if (trade.pnl > 0) marketBreakdown[market].wins++
    else if (trade.pnl < 0) marketBreakdown[market].losses++
  })

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">📊 Gerar Relatórios</h2>
          <p className="text-zinc-400">Exporte seus dados de trading em PDF, Excel ou CSV</p>
        </div>

        {/* ✅ Seletor de Moeda */}
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

      <TradeFilters onFilterChange={setFilters} />

      {/* Prévia das Métricas */}
      <Card>
        <h3 className="text-lg font-bold text-white mb-4">📈 Prévia do Relatório</h3>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-zinc-800 p-4 rounded-lg">
            <p className="text-xs text-zinc-500 mb-1">Total de Trades</p>
            <p className="text-2xl font-bold text-white">{filteredTrades.length}</p>
          </div>

          <div className="bg-zinc-800 p-4 rounded-lg">
            <p className="text-xs text-zinc-500 mb-1">Resultado Bruto</p>
            <p className={`text-2xl font-bold ${totalPnl >= 0 ? "text-emerald-400" : "text-red-400"}`}>
              {formatCurrency(totalPnl)}
            </p>
            <p className="text-xs text-zinc-400 mt-1">
              {formatEquivalent(metrics.totalPnlUSD, metrics.totalPnlBRL)}
            </p>
          </div>

          <div className="bg-blue-500/10 p-4 rounded-lg border border-blue-500/20">
            <p className="text-xs text-blue-400 mb-1">Resultado Líquido</p>
            <p className={`text-2xl font-bold ${netProfit >= 0 ? "text-blue-400" : "text-red-400"}`}>
              {formatCurrency(netProfit)}
            </p>
            <p className="text-xs text-zinc-400 mt-1">
              {formatEquivalent(
                metrics.totalPnlUSD - metrics.totalCommissionUSD - metrics.totalSwapUSD - metrics.totalTaxUSD,
                metrics.totalPnlBRL - metrics.totalCommissionBRL - metrics.totalSwapBRL - metrics.totalTaxBRL
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
            <p className="text-2xl font-bold text-red-400">{formatCurrency(totalCosts)}</p>
            <p className="text-xs text-zinc-400 mt-1">
              {formatEquivalent(
                metrics.totalCommissionUSD + metrics.totalSwapUSD,
                metrics.totalCommissionBRL + metrics.totalSwapBRL
              )}
            </p>
          </div>

          <div className="bg-zinc-800 p-4 rounded-lg">
            <p className="text-xs text-zinc-500 mb-1">Corretagem</p>
            <p className="text-xl font-bold text-zinc-300">{formatCurrency(totalCommission)}</p>
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
                {formatCurrency(totalPnl)}
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

        {/* Desempenho por Mercado */}
        {Object.keys(marketBreakdown).length > 0 && (
          <div className="mb-6">
            <h4 className="text-sm font-bold text-white mb-3">🌍 Desempenho por Mercado</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(marketBreakdown).map(([market, data]) => {
                const winRate = data.trades.length > 0 ? (data.wins / data.trades.length) * 100 : 0
                const pnl = convertValue(data.totalPnLUSD, data.totalPnLBRL)
                const tax = convertValue(data.totalTaxUSD, data.totalTaxBRL)
                const costs = convertValue(data.totalCostsUSD, data.totalCostsBRL)
                const netResult = pnl - costs - tax

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
                        <span className={pnl >= 0 ? 'text-emerald-400' : 'text-red-400'}>
                          {formatCurrency(pnl)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-400">Impostos:</span>
                        <span className="text-orange-400">{formatCurrency(tax)}</span>
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
