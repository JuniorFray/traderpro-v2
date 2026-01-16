// src/constants/markets.js
// Constantes de Mercados e Moedas - TraderPro v3.0

export const MARKETS = [
  { value: 'b3daytrade', label: 'B3 Day Trade', icon: '📊', currency: 'BRL' },
  { value: 'b3swing', label: 'B3 Swing Trade', icon: '📈', currency: 'BRL' },
  { value: 'forex', label: 'Forex', icon: '💱', currency: 'USD' },
  { value: 'b3options', label: 'B3 Opções', icon: '📉', currency: 'BRL' }
];

export const CURRENCIES = [
  { value: 'BRL', label: 'Real (R$)', symbol: 'R$' },
  { value: 'USD', label: 'Dólar ($)', symbol: '$' },
  { value: 'EUR', label: 'Euro (€)', symbol: '€' },
  { value: 'GBP', label: 'Libra (£)', symbol: '£' }
];

// NOVO: Mapeamento de valores para nomes
export const MARKET_NAMES = {
  'b3daytrade': 'B3 Day Trade',
  'b3swing': 'B3 Swing Trade',
  'forex': 'Forex',
  'b3options': 'B3 Opções',
  'crypto': 'Cripto'
};

export const DEFAULT_MARKET = 'forex';
export const DEFAULT_CURRENCY = 'BRL';

export const getMarketLabel = (value) => {
  const market = MARKETS.find(m => m.value === value);
  return market ? market.label : value;
};

export const getCurrencySymbol = (value) => {
  const currency = CURRENCIES.find(c => c.value === value);
  return currency ? currency.symbol : value;
};
