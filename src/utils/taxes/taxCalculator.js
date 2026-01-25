// src/utils/taxes/taxCalculator.js
// Calculadora de Impostos TraderPro v3.1
// Atualizado em 24/01/2026 - Sistema de compensação de prejuízos

import { TAX_RULES } from './taxRules.js';
import { getAccumulatedLoss, saveTaxHistory, recordCompensation } from '../../services/taxHistory.js';

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
 * ✅ NOVO: Calcula imposto consolidado de um período COM COMPENSAÇÃO DE PREJUÍZOS
 * Este é o cálculo CORRETO segundo a legislação
 */
export const calculatePeriodTax = async (trades, market, period, userId = null) => {
  const rule = TAX_RULES[market];

  if (!rule) {
    console.warn('Regra fiscal não encontrada para:', market);
    return null;
  }

  // 1. Filtrar trades do mercado específico
  const marketTrades = Array.isArray(trades) ? trades.filter(t => t.market === market) : [];

  if (marketTrades.length === 0) {
    return {
      market,
      marketName: rule.name,
      consolidatedPnL: 0,
      previousLoss: 0,
      compensatedAmount: 0,
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

  // 3. ✅ NOVO: Buscar prejuízo acumulado anterior (se userId fornecido)
  let previousLoss = 0;
  if (userId) {
    try {
      previousLoss = await getAccumulatedLoss(userId, market, period);
    } catch (error) {
      console.warn('Erro ao buscar prejuízo anterior:', error);
      previousLoss = 0;
    }
  }

  // 4. ✅ NOVO: Calcular base tributável com compensação
  const baseAfterCompensation = consolidatedPnL + previousLoss; // previousLoss é negativo
  const compensatedAmount = previousLoss < 0 && consolidatedPnL > 0 
    ? Math.min(Math.abs(previousLoss), consolidatedPnL) 
    : 0;

  // 5. ✅ NOVO: Calcular novo prejuízo acumulado
  const newAccumulatedLoss = baseAfterCompensation < 0 
    ? baseAfterCompensation 
    : 0;

  // 6. Se prejuízo (mesmo após compensação), não há imposto
  if (baseAfterCompensation <= 0) {
    // ✅ Salvar histórico de prejuízo
    if (userId) {
      await saveTaxHistory(userId, {
        market,
        period,
        periodType: rule.type,
        consolidatedPnL,
        previousLoss,
        accumulatedLoss: newAccumulatedLoss,
        taxableAmount: 0,
        taxAmount: 0,
        compensatedAmount: 0
      });
    }

    return {
      market,
      marketName: rule.name,
      consolidatedPnL,
      previousLoss,
      compensatedAmount: 0,
      taxableAmount: 0,
      taxAmount: 0,
      taxRate: rule.rate * 100,
      dueDate: null,
      darfCode: rule.darfCode,
      trades: marketTrades.length,
      isExempt: true,
      exemptReason: 'Prejuízo no período',
      newAccumulatedLoss
    };
  }

  // 7. Calcular imposto sobre lucro (após compensação)
  const taxAmount = baseAfterCompensation * rule.rate;

  // 8. Calcular data de vencimento
  const dueDate = calculateDueDate(rule.type, rule.dueDay, period);

  // 9. ✅ Salvar histórico fiscal
  if (userId) {
    await saveTaxHistory(userId, {
      market,
      period,
      periodType: rule.type,
      consolidatedPnL,
      previousLoss,
      accumulatedLoss: 0, // Zerado pois foi totalmente compensado
      taxableAmount: baseAfterCompensation,
      taxAmount: parseFloat(taxAmount.toFixed(2)),
      compensatedAmount
    });

    // ✅ Registrar compensação se houve
    if (compensatedAmount > 0 && previousLoss < 0) {
      const previousPeriod = getPreviousPeriod(period, rule.type);
      await recordCompensation(userId, {
        fromPeriod: previousPeriod,
        toPeriod: period,
        market,
        amount: compensatedAmount
      });
    }
  }

  return {
    market,
    marketName: rule.name,
    consolidatedPnL,
    previousLoss,
    compensatedAmount,
    taxableAmount: baseAfterCompensation,
    taxAmount: parseFloat(taxAmount.toFixed(2)),
    taxRate: rule.rate * 100,
    dueDate,
    darfCode: rule.darfCode,
    trades: marketTrades.length,
    isExempt: false,
    period,
    newAccumulatedLoss: 0 // Zerado se pagou imposto
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
 * ✅ NOVO: Obter período anterior para registrar compensação
 */
const getPreviousPeriod = (period, type) => {
  const date = new Date(period);

  if (type === 'monthly') {
    // Mês anterior
    const prevMonth = new Date(date.getFullYear(), date.getMonth() - 1, 1);
    return prevMonth.toISOString().split('T')[0].slice(0, 7); // "2026-01"
  }

  if (type === 'annual') {
    // Ano anterior
    return `${date.getFullYear() - 1}-01-01`;
  }

  return period;
};

/**
 * ✅ ATUALIZADO: Calcula resumo fiscal de todos os mercados em um período
 */
export const calculateTaxSummary = async (trades, period = new Date().toISOString().split('T')[0], userId = null) => {
  const markets = ['b3daytrade', 'b3swing', 'forex', 'b3options'];
  const summary = {};

  for (const market of markets) {
    const taxInfo = await calculatePeriodTax(trades, market, period, userId);
    if (taxInfo && taxInfo.trades > 0) {
      summary[market] = taxInfo;
    }
  }

  return summary;
};

/**
 * ✅ ATUALIZADO: Calcula total de impostos devidos no período
 */
export const calculateTotalTax = async (trades, period, userId = null) => {
  const summary = await calculateTaxSummary(trades, period, userId);
  
  return Object.values(summary).reduce((total, market) => 
    total + (market.taxAmount || 0), 0
  );
};
