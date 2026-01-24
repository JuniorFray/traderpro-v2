// src/utils/taxes/taxCalculator.js
// Calculadora de Impostos TraderPro v3.0
// Atualizado em 24/01/2026 - Cálculo consolidado por período

import { TAX_RULES } from './taxRules.js';

/**
 * Calcula imposto de um trade individual (DEPRECATED - Manter só por compatibilidade)
 * AVISO: Use calculatePeriodTax() para cálculo correto
 */
export const calculateTax = (trade) => {
  const { market, pnl, currency } = trade;
  const rule = TAX_RULES[market];

  if (!rule) {
    console.warn('Regra fiscal não encontrada para:', market);
    return null;
  }

  // Retorna estrutura básica sem calcular valor
  return {
    rate: rule.rate,
    amount: 0, // ✅ Não calcula mais aqui
    category: market,
    dueDate: null,
    isPaid: false,
    exempt: true,
    exemptReason: 'Cálculo deve ser feito por período consolidado',
    currency: currency || 'BRL'
  };
};

/**
 * ✅ NOVO: Calcula imposto consolidado de um período (mês ou ano)
 * Este é o cálculo CORRETO segundo a legislação
 */
export const calculatePeriodTax = (trades, market, period) => {
  const rule = TAX_RULES[market];

  if (!rule) {
    console.warn('Regra fiscal não encontrada para:', market);
    return null;
  }

  // 1. Filtrar trades do mercado específico
  const marketTrades = trades.filter(t => t.market === market);

  if (marketTrades.length === 0) {
    return {
      market,
      marketName: rule.name,
      consolidatedPnL: 0,
      taxableAmount: 0,
      taxAmount: 0,
      taxRate: rule.rate * 100,
      trades: 0,
      isExempt: true,
      exemptReason: 'Sem operações no período'
    };
  }

  // 2. Somar PnL consolidado (positivos + negativos)
  const consolidatedPnL = marketTrades.reduce((sum, t) => 
    sum + parseFloat(t.pnl || 0), 0
  );

  // 3. Se prejuízo, não há imposto
  if (consolidatedPnL <= 0) {
    return {
      market,
      marketName: rule.name,
      consolidatedPnL,
      taxableAmount: 0,
      taxAmount: 0,
      taxRate: rule.rate * 100,
      trades: marketTrades.length,
      isExempt: true,
      exemptReason: 'Prejuízo no período'
    };
  }

  // 4. Calcular imposto sobre lucro consolidado
  const taxAmount = consolidatedPnL * rule.rate;

  // 5. Calcular data de vencimento
  const dueDate = calculateDueDate(rule.type, rule.dueDay, period);

  return {
    market,
    marketName: rule.name,
    consolidatedPnL,
    taxableAmount: consolidatedPnL,
    taxAmount: parseFloat(taxAmount.toFixed(2)),
    taxRate: rule.rate * 100,
    dueDate,
    darfCode: rule.darfCode,
    trades: marketTrades.length,
    isExempt: false,
    period
  };
};

/**
 * Calcula data de vencimento do imposto
 */
const calculateDueDate = (type, dueDay, period) => {
  const date = new Date(period);

  if (type === 'monthly') {
    // Último dia útil do mês seguinte
    const nextMonth = new Date(date.getFullYear(), date.getMonth() + 2, 0);
    return nextMonth.toISOString().split('T')[0];
  }

  if (type === 'annual') {
    // 30 de abril do ano seguinte
    const year = date.getFullYear();
    return `${year + 1}-04-30`;
  }

  return null;
};

/**
 * ✅ NOVO: Calcula resumo fiscal de todos os mercados em um período
 */
export const calculateTaxSummary = (trades, period = new Date().toISOString().split('T')[0]) => {
  const markets = ['b3daytrade', 'b3swing', 'forex', 'b3options'];
  const summary = {};

  markets.forEach(market => {
    const taxInfo = calculatePeriodTax(trades, market, period);
    if (taxInfo && taxInfo.trades > 0) {
      summary[market] = taxInfo;
    }
  });

  return summary;
};

/**
 * ✅ NOVO: Calcula total de impostos devidos no período
 */
export const calculateTotalTax = (trades, period) => {
  const summary = calculateTaxSummary(trades, period);
  
  return Object.values(summary).reduce((total, market) => 
    total + (market.taxAmount || 0), 0
  );
};
