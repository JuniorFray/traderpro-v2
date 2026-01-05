// src/utils/metrics.js - VERSÃO CORRIGIDA COMPLETA

export const calculateMetrics = (trades = [], period = 'all') => {
  if (!trades || trades.length === 0) {
    return {
      totalTrades: 0,
      winningTrades: 0,
      losingTrades: 0,
      winRate: 0,
      grossProfit: 0,
      grossLoss: 0,
      netProfit: 0,
      avgWin: 0,
      avgLoss: 0,
      maxWin: 0,
      maxLoss: 0,
      profitFactor: 0,
      expectancy: 0,
      totalCommissions: 0,
      totalSwaps: 0,
      consecutiveWins: 0,
      consecutiveLosses: 0,
      maxDrawdown: 0,
      sharpeRatio: 0,
      equityCurve: []
    };
  }

  // Filtrar trades por período
  const filteredTrades = filterByPeriod(trades, period);

  // Ordenar por data e converter pnl para número
  const sortedTrades = [...filteredTrades]
    .map(trade => ({
      ...trade,
      pnl: parseFloat(trade.pnl) || 0,
      fees: parseFloat(trade.fees) || 0,
      commission: parseFloat(trade.commission) || 0,
      swap: parseFloat(trade.swap) || 0
    }))
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  // Calcular métricas básicas
  const totalTrades = sortedTrades.length;
  const winningTrades = sortedTrades.filter(t => t.pnl > 0).length;
  const losingTrades = sortedTrades.filter(t => t.pnl < 0).length;
  const winRate = totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0;

  // Lucros e Perdas
  const grossProfit = sortedTrades
    .filter(t => t.pnl > 0)
    .reduce((sum, t) => sum + t.pnl, 0);

  const grossLoss = sortedTrades
    .filter(t => t.pnl < 0)
    .reduce((sum, t) => sum + t.pnl, 0);

  const netProfit = grossProfit + grossLoss;

  // Médias
  const avgWin = winningTrades > 0 ? grossProfit / winningTrades : 0;
  const avgLoss = losingTrades > 0 ? grossLoss / losingTrades : 0;

  // Máximos
  const maxWin = sortedTrades.length > 0 
    ? Math.max(...sortedTrades.map(t => t.pnl)) 
    : 0;

  const maxLoss = sortedTrades.length > 0 
    ? Math.min(...sortedTrades.map(t => t.pnl)) 
    : 0;

  // Profit Factor
  const profitFactor = grossLoss !== 0 
    ? Math.abs(grossProfit / grossLoss) 
    : grossProfit > 0 ? Infinity : 0;

  // Expectativa
  const expectancy = totalTrades > 0 
    ? netProfit / totalTrades 
    : 0;

  // Custos (usar fees OU commission+swap)
  const totalCommissions = sortedTrades.reduce((sum, t) => 
    sum + (t.commission || t.fees || 0), 0
  );

  const totalSwaps = sortedTrades.reduce((sum, t) => 
    sum + (t.swap || 0), 0
  );

  // Sequências
  const { maxConsecutiveWins, maxConsecutiveLosses } = calculateStreaks(sortedTrades);

  // Drawdown
  const { maxDrawdown } = calculateDrawdown(sortedTrades);

  // Sharpe Ratio (simplificado)
  const sharpeRatio = calculateSharpeRatio(sortedTrades);

  // Curva de Equity
  const equityCurve = calculateEquityCurve(sortedTrades);

  return {
    totalTrades,
    winningTrades,
    losingTrades,
    winRate,
    grossProfit,
    grossLoss,
    netProfit,
    avgWin,
    avgLoss,
    maxWin,
    maxLoss,
    profitFactor,
    expectancy,
    totalCommissions,
    totalSwaps,
    consecutiveWins: maxConsecutiveWins,
    consecutiveLosses: maxConsecutiveLosses,
    maxDrawdown,
    sharpeRatio,
    equityCurve
  };
};

// ===== FUNÇÃO CORRIGIDA - COMPARAÇÃO DE DATAS =====
const filterByPeriod = (trades, period) => {
  if (period === 'all') return trades;

  // Obter data de hoje no formato YYYY-MM-DD (timezone local)
  const now = new Date();
  const today = formatDateToYYYYMMDD(now);

  switch (period) {
    case 'today':
      // Comparar apenas a string da data (ignora timezone)
      return trades.filter(t => t.date === today);

    case 'week':
      const weekAgo = new Date();
      weekAgo.setDate(now.getDate() - 7);
      const weekAgoStr = formatDateToYYYYMMDD(weekAgo);
      return trades.filter(t => t.date >= weekAgoStr);

    case 'month':
      const monthAgo = new Date();
      monthAgo.setMonth(now.getMonth() - 1);
      const monthAgoStr = formatDateToYYYYMMDD(monthAgo);
      return trades.filter(t => t.date >= monthAgoStr);

    default:
      return trades;
  }
};

// Função auxiliar para formatar data como YYYY-MM-DD
const formatDateToYYYYMMDD = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const calculateStreaks = (trades) => {
  let maxConsecutiveWins = 0;
  let maxConsecutiveLosses = 0;
  let currentWinStreak = 0;
  let currentLossStreak = 0;

  trades.forEach(trade => {
    if (trade.pnl > 0) {
      currentWinStreak++;
      currentLossStreak = 0;
      maxConsecutiveWins = Math.max(maxConsecutiveWins, currentWinStreak);
    } else if (trade.pnl < 0) {
      currentLossStreak++;
      currentWinStreak = 0;
      maxConsecutiveLosses = Math.max(maxConsecutiveLosses, currentLossStreak);
    }
  });

  return { maxConsecutiveWins, maxConsecutiveLosses };
};

const calculateDrawdown = (trades) => {
  let peak = 0;
  let maxDrawdown = 0;
  let equity = 0;

  trades.forEach(trade => {
    equity += trade.pnl;
    if (equity > peak) {
      peak = equity;
    }
    const drawdown = peak - equity;
    if (drawdown > maxDrawdown) {
      maxDrawdown = drawdown;
    }
  });

  return { maxDrawdown };
};

const calculateSharpeRatio = (trades) => {
  if (trades.length < 2) return 0;

  const returns = trades.map(t => t.pnl);
  const avgReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;
  
  const variance = returns.reduce((sum, r) => 
    sum + Math.pow(r - avgReturn, 2), 0
  ) / returns.length;
  
  const stdDev = Math.sqrt(variance);
  
  return stdDev !== 0 ? (avgReturn / stdDev) * Math.sqrt(252) : 0;
};

const calculateEquityCurve = (trades) => {
  let equity = 0;
  return trades.map((trade, index) => {
    equity += trade.pnl;
    return {
      date: new Date(trade.date).toLocaleDateString('pt-BR', { 
        day: '2-digit', 
        month: '2-digit' 
      }),
      equity: parseFloat(equity.toFixed(2)),
      trade: index + 1
    };
  });
};

// Função auxiliar para formatar moeda
export const formatCurrency = (value) => {
  const numValue = typeof value === 'number' ? value : parseFloat(value) || 0;
  return numValue.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};

// Função auxiliar para formatar porcentagem
export const formatPercent = (value) => {
  if (typeof value !== 'number') {
    value = parseFloat(value) || 0;
  }
  return `${value.toFixed(1)}%`;
};

// Função auxiliar para formatar data
export const formatDate = (dateString) => {
  if (!dateString) return 'Data inválida';
  try {
    const date = new Date(dateString + 'T12:00:00');
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  } catch {
    return dateString;
  }
};
