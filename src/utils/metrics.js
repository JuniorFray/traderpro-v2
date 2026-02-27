// src/utils/metrics.js - VERSÃO COM CONVERSÃO DE MOEDA

import { MARKETS } from '../constants/markets'

// Função auxiliar para converter para BRL
const convertToBRL = (value, market) => {
  // Encontrar a moeda do mercado
  const marketConfig = MARKETS.find(m => m.value === market)
  
  if (!marketConfig || marketConfig.currency === 'BRL') {
    return value
  }
  
  // Para Forex (USD), usar taxa fixa por enquanto
  // TODO: Buscar taxa histórica do trade
  if (marketConfig.currency === 'USD') {
    const exchangeRate = 5.45 // Taxa padrão
    return value * exchangeRate
  }
  
  return value
}

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

  // Ordenar por data e converter TUDO para BRL
  const sortedTrades = [...filteredTrades]
    .map(trade => {
      const pnlOriginal = parseFloat(trade.pnl) || 0
      const pnlBRL = convertToBRL(pnlOriginal, trade.market)
      
      return {
        ...trade,
        pnl: pnlBRL, // CONVERTIDO para BRL
        fees: parseFloat(trade.fees) || 0,
        commission: parseFloat(trade.commission) || 0,
        swap: parseFloat(trade.swap) || 0
      }
    })
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  // Calcular métricas básicas
  const totalTrades = sortedTrades.length;
  const winningTrades = sortedTrades.filter(t => t.pnl > 0).length;
  const losingTrades = sortedTrades.filter(t => t.pnl < 0).length;
  const winRate = totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0;

  // Lucros e Perdas (JÁ EM BRL)
  const grossProfit = sortedTrades
    .filter(t => t.pnl > 0)
    .reduce((sum, t) => sum + t.pnl, 0);

  const grossLoss = Math.abs(
    sortedTrades
      .filter(t => t.pnl < 0)
      .reduce((sum, t) => sum + t.pnl, 0)
  );

  const netProfit = grossProfit - grossLoss;

  // Médias
  const avgWin = winningTrades > 0 ? grossProfit / winningTrades : 0;
  const avgLoss = losingTrades > 0 ? grossLoss / losingTrades : 0;

  // Máximos
  const maxWin = sortedTrades.length > 0
    ? Math.max(...sortedTrades.map(t => t.pnl))
    : 0;

  const maxLoss = sortedTrades.length > 0
    ? Math.abs(Math.min(...sortedTrades.map(t => t.pnl)))
    : 0;

  // Profit Factor
  const profitFactor = grossLoss > 0
    ? grossProfit / grossLoss
    : grossProfit > 0 ? Infinity : 0;

  // Expectativa
  const expectancy = totalTrades > 0
    ? (grossProfit - grossLoss) / totalTrades
    : 0;

  // Custos (converter para valores absolutos)
  const totalCommissions = Math.abs(
    sortedTrades.reduce((sum, t) => sum + (t.commission || t.fees || 0), 0)
  );

  const totalSwaps = sortedTrades.reduce((sum, t) =>
    sum + (t.swap || 0), 0
  );

  // Sequências
  const { maxConsecutiveWins, maxConsecutiveLosses } = calculateStreaks(sortedTrades);

  // Drawdown
  const { maxDrawdown, equityCurve } = calculateDrawdown(sortedTrades);

  // Sharpe Ratio
  const sharpeRatio = calculateSharpeRatio(sortedTrades);

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

// Funções auxiliares (manter as existentes)
const filterByPeriod = (trades, period) => {
  if (period === 'all') return trades;

  const now = new Date();
  const startDate = new Date();

  switch (period) {
    case 'today':
      startDate.setHours(0, 0, 0, 0);
      break;
    case 'week':
      startDate.setDate(now.getDate() - 7);
      break;
    case 'month':
      startDate.setMonth(now.getMonth() - 1);
      break;
    default:
      return trades;
  }

  return trades.filter(t => new Date(t.date) >= startDate);
};

const calculateStreaks = (trades) => {
  let currentWinStreak = 0;
  let currentLossStreak = 0;
  let maxConsecutiveWins = 0;
  let maxConsecutiveLosses = 0;

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
  const equityCurve = [];

  trades.forEach(trade => {
    equity += trade.pnl;
    equityCurve.push({ date: trade.date, equity });

    if (equity > peak) {
      peak = equity;
    }

    const drawdown = peak - equity;
    if (drawdown > maxDrawdown) {
      maxDrawdown = drawdown;
    }
  });

  return { maxDrawdown, equityCurve };
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

// ✅ NORMALIZAR MOEDAS CRIPTO PARA FIAT
const normalizeCurrency = (currency) => {
  if (!currency) return 'USD';
  
  const crypto2fiat = {
    'USDT': 'USD',  // Tether
    'USDC': 'USD',  // USD Coin
    'BUSD': 'USD',  // Binance USD
    'DAI': 'USD',   // Dai
    'TUSD': 'USD',  // TrueUSD
    'USDP': 'USD',  // Pax Dollar
    'GUSD': 'USD',  // Gemini Dollar
    'EURC': 'EUR',  // Euro Coin
    'EURT': 'EUR',  // Euro Tether
    'BRLT': 'BRL'   // BRL Tether
  };
  
  const upperCurrency = String(currency).toUpperCase().trim();
  return crypto2fiat[upperCurrency] || upperCurrency;
};

// ✅ FUNÇÃO CORRIGIDA - ACEITA CURRENCY E MARKET
export const formatCurrency = (value, currency, market) => {
  const numValue = typeof value === 'number' ? value : parseFloat(value) || 0;
  
  // Detectar moeda automaticamente se não fornecida
  let finalCurrency = currency;
  
  if (!currency && market) {
    // Se market for forex, assumir USD, senão BRL
    finalCurrency = market === 'forex' ? 'USD' : 'BRL';
  }
  
  // Fallback final para BRL se ainda não tiver
  if (!finalCurrency) {
    finalCurrency = 'BRL';
  }
  
  // ✅ NORMALIZAR MOEDAS CRIPTO (USDT → USD, etc)
  finalCurrency = normalizeCurrency(finalCurrency);
  
  // Definir locale baseado na moeda
  const locale = finalCurrency === 'USD' ? 'en-US' : 'pt-BR';
  
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: finalCurrency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(numValue);
};

export const formatPercentage = (value) => {
  return `${value.toFixed(2)}%`;
};