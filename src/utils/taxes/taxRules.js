// src/utils/taxes/taxRules.js
// Sistema de Impostos TraderPro v3.0
// Atualizado em 24/01/2026 - Lei 14.754/2023

export const TAX_RULES = {
  b3daytrade: {
    name: 'B3 Day Trade',
    rate: 0.20, // 20%
    type: 'monthly',
    exemptionLimit: 0, // Sem isenção
    dueDay: 'last_business_day_next_month',
    darfCode: '6015',
    description: 'IR 20% sobre lucro líquido mensal de day trade'
  },

  b3swing: {
    name: 'B3 Swing Trade',
    rate: 0.15, // 15%
    type: 'monthly',
    exemptionLimit: 20000, // R$ 20.000/mês em vendas
    dueDay: 'last_business_day_next_month',
    darfCode: '3317',
    description: 'IR 15% sobre lucro, isento se vendas < R$ 20k/mês'
  },

  forex: {
    name: 'Forex',
    rate: 0.15, // 15%
    type: 'annual', // ✅ CORRIGIDO: Anual desde 2024 (Lei 14.754/2023)
    exemptionLimit: 0,
    dueDay: 'april_30_next_year', // ✅ Vencimento: 30 de abril do ano seguinte
    darfCode: '0190', // ✅ Código para apuração anual
    description: 'IR 15% anual sobre ganho de capital (investimento exterior)'
  },

  b3options: {
    name: 'B3 Opções',
    rate: 0.15, // 15%
    type: 'monthly',
    exemptionLimit: 20000, // R$ 20.000/mês em vendas
    dueDay: 'last_business_day_next_month',
    darfCode: '3317',
    description: 'IR 15% sobre lucro, isento se vendas < R$ 20k/mês'
  }
};

export const MARKET_TYPES = {
  B3_DAYTRADE: 'b3daytrade',
  B3_SWING: 'b3swing',
  FOREX: 'forex',
  B3_OPTIONS: 'b3options'
};

export const CURRENCIES = {
  BRL: 'BRL',
  USD: 'USD',
  EUR: 'EUR',
  GBP: 'GBP'
};

export const DEFAULT_CURRENCY = CURRENCIES.BRL;
