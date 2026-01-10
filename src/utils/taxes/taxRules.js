// src/utils/taxes/taxRules.js
// Sistema de Impostos TraderPro v3.0

export const TAX_RULES = {
  b3daytrade: {
    name: 'B3 Day Trade',
    rate: 0.20,
    type: 'monthly',
    exemptionLimit: 0,
    dueDay: 'last_business_day_next_month',
    darfCode: '6015',
    description: 'IR 20% sobre lucro líquido mensal de day trade'
  },
  
  b3swing: {
    name: 'B3 Swing Trade',
    rate: 0.15,
    type: 'monthly',
    exemptionLimit: 20000,
    dueDay: 'last_business_day_next_month',
    darfCode: '3317',
    description: 'IR 15% sobre lucro, isento se vendas < R$ 20k/mês'
  },
  
  forex: {
    name: 'Forex',
    rate: 0.15,
    type: 'quarterly',
    exemptionLimit: 0,
    dueDay: 'last_business_day_next_month_after_quarter',
    darfCode: '8523',
    description: 'IR 15% sobre ganho de capital trimestral'
  },
  
  b3options: {
    name: 'B3 Opções',
    rate: 0.15,
    type: 'monthly',
    exemptionLimit: 20000,
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
