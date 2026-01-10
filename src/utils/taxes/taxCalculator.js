// src/utils/taxes/taxCalculator.js
// Calculadora de Impostos TraderPro v3.0

import { TAX_RULES } from './taxRules.js';

export const calculateTax = (trade) => {
  const { market, pnl, currency } = trade;
  
  const rule = TAX_RULES[market];
  
  if (!rule) {
    console.warn('Regra fiscal não encontrada para:', market);
    return null;
  }
  
  if (pnl <= 0) {
    return {
      rate: rule.rate,
      amount: 0,
      category: market,
      dueDate: null,
      isPaid: false,
      exempt: true,
      exemptReason: 'Sem lucro no período'
    };
  }
  
  const taxAmount = pnl * rule.rate;
  
  return {
    rate: rule.rate,
    amount: parseFloat(taxAmount.toFixed(2)),
    category: market,
    dueDate: calculateDueDate(rule.type, trade.date),
    isPaid: false,
    exempt: false,
    currency: currency || 'BRL'
  };
};

const calculateDueDate = (type, tradeDate) => {
  const date = new Date(tradeDate);
  
  if (type === 'monthly') {
    const nextMonth = new Date(date.getFullYear(), date.getMonth() + 2, 0);
    return nextMonth.toISOString().split('T')[0];
  }
  
  if (type === 'quarterly') {
    const quarter = Math.floor(date.getMonth() / 3);
    const endOfQuarter = new Date(date.getFullYear(), (quarter + 1) * 3, 0);
    const nextMonth = new Date(endOfQuarter.getFullYear(), endOfQuarter.getMonth() + 2, 0);
    return nextMonth.toISOString().split('T')[0];
  }
  
  return null;
};

export const calculateTaxSummary = (trades) => {
  const summary = {};
  
  trades.forEach(trade => {
    const market = trade.market || 'forex';
    
    if (!summary[market]) {
      summary[market] = {
        totalPnl: 0,
        totalTax: 0,
        trades: 0,
        winningTrades: 0,
        losingTrades: 0
      };
    }
    
    summary[market].totalPnl += parseFloat(trade.pnl || 0);
    summary[market].trades += 1;
    
    if (trade.pnl > 0) {
      summary[market].winningTrades += 1;
      const tax = calculateTax(trade);
      if (tax && !tax.exempt) {
        summary[market].totalTax += tax.amount;
      }
    } else {
      summary[market].losingTrades += 1;
    }
  });
  
  return summary;
};
