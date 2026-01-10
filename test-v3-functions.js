// test-v3-functions.js
import { calculateTax, calculateTaxSummary } from './src/utils/taxes/taxCalculator.js';

console.log('=== TESTE FUNÇÕES V3.0 ===\n');

console.log('📊 TESTE 1: Day Trade B3');
const tradeDayTrade = {
  asset: 'WINFUT',
  date: '2026-01-10',
  pnl: 1000,
  market: 'b3daytrade',
  currency: 'BRL'
};
const taxDayTrade = calculateTax(tradeDayTrade);
console.log('Imposto:', taxDayTrade.amount, 'BRL (esperado: 200)\n');

console.log('📊 TESTE 2: Forex');
const tradeForex = {
  asset: 'EURUSD',
  date: '2026-01-10',
  pnl: 500,
  market: 'forex',
  currency: 'USD'
};
const taxForex = calculateTax(tradeForex);
console.log('Imposto:', taxForex.amount, 'USD (esperado: 75)\n');

console.log('📊 TESTE 3: Trade com prejuízo');
const tradeLoss = {
  asset: 'PETR4',
  date: '2026-01-10',
  pnl: -300,
  market: 'b3swing',
  currency: 'BRL'
};
const taxLoss = calculateTax(tradeLoss);
console.log('Imposto:', taxLoss.amount, 'BRL (esperado: 0 - isento)\n');

console.log('📊 TESTE 4: Resumo de impostos');
const trades = [
  { date: '2026-01-10', market: 'b3daytrade', pnl: 1000 },
  { date: '2026-01-10', market: 'b3daytrade', pnl: 500 },
  { date: '2026-01-10', market: 'b3daytrade', pnl: -200 },
  { date: '2026-01-10', market: 'forex', pnl: 800 },
  { date: '2026-01-10', market: 'forex', pnl: -100 }
];
const summary = calculateTaxSummary(trades);
console.log('B3 Day Trade - Total PnL:', summary.b3daytrade.totalPnl, '| Imposto:', summary.b3daytrade.totalTax);
console.log('Forex - Total PnL:', summary.forex.totalPnl, '| Imposto:', summary.forex.totalTax);
console.log('\n✅ TODOS OS TESTES CONCLUÍDOS!');
