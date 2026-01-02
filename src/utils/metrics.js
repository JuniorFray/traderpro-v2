export const calculateMetrics = (trades) => {
  if (!trades || trades.length === 0) {
    return {
      totalTrades: 0,
      wins: 0,
      losses: 0,
      winRate: 0,
      totalProfit: 0,
      totalLoss: 0,
      netProfit: 0,
      averageWin: 0,
      averageLoss: 0,
      profitFactor: 0,
      bestTrade: 0,
      worstTrade: 0
    }
  }

  // Converter pnl para número (aceita string ou number)
  const validTrades = trades
    .map(t => ({
      ...t,
      pnl: parseFloat(t.pnl) || 0
    }))
    .filter(t => !isNaN(t.pnl))
  
  const wins = validTrades.filter(t => t.pnl > 0)
  const losses = validTrades.filter(t => t.pnl < 0)
  
  const totalProfit = wins.reduce((sum, t) => sum + t.pnl, 0)
  const totalLoss = Math.abs(losses.reduce((sum, t) => sum + t.pnl, 0))
  const netProfit = validTrades.reduce((sum, t) => sum + t.pnl, 0)

  return {
    totalTrades: trades.length,
    wins: wins.length,
    losses: losses.length,
    winRate: trades.length > 0 ? (wins.length / trades.length) * 100 : 0,
    totalProfit,
    totalLoss,
    netProfit,
    averageWin: wins.length > 0 ? totalProfit / wins.length : 0,
    averageLoss: losses.length > 0 ? totalLoss / losses.length : 0,
    profitFactor: totalLoss > 0 ? totalProfit / totalLoss : 0,
    bestTrade: validTrades.length > 0 ? Math.max(...validTrades.map(t => t.pnl)) : 0,
    worstTrade: validTrades.length > 0 ? Math.min(...validTrades.map(t => t.pnl)) : 0
  }
}

export const formatCurrency = (value) => {
  if (value === null || value === undefined || isNaN(value)) {
    return 'R$ 0,00'
  }
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value)
}

export const formatPercent = (value) => {
  if (value === null || value === undefined || isNaN(value)) {
    return '0.00%'
  }
  return `${value.toFixed(2)}%`
}

export const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  try {
    return new Date(dateString).toLocaleDateString('pt-BR')
  } catch {
    return 'N/A'
  }
}
