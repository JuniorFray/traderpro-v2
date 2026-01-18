const fs = require('fs');

// Atualizar metrics.js com fallback
const metricsPath = './src/utils/metrics.js';
let content = fs.readFileSync(metricsPath, 'utf8');

const newFunction = `export const formatCurrency = (value, currency = 'BRL', market) => {
  const numValue = typeof value === 'number' ? value : parseFloat(value) || 0;
  
  // Fallback: detectar moeda pelo mercado se currency não fornecido
  let finalCurrency = currency;
  if (!currency && market) {
    finalCurrency = market === 'forex' ? 'USD' : 'BRL';
  }
  
  const locale = finalCurrency === 'USD' ? 'en-US' : 'pt-BR';
  return numValue.toLocaleString(locale, {
    style: 'currency',
    currency: finalCurrency || 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};`;

// Substituir
const pattern = /export const formatCurrency = \(value, currency = 'BRL'\) => \{[\s\S]*?\};/;
content = content.replace(pattern, newFunction);
fs.writeFileSync(metricsPath, content);

console.log('✅ Fallback adicionado em metrics.js');

// Atualizar as chamadas para passar o market também
const files = [
  './src/features/trades/TradesPage.jsx',
  './src/features/analytics/Analytics.jsx',
  './src/features/calendar/Calendar.jsx'
];

files.forEach(file => {
  let fileContent = fs.readFileSync(file, 'utf8');
  
  // formatCurrency(trade.pnl, trade.currency) -> formatCurrency(trade.pnl, trade.currency, trade.market)
  fileContent = fileContent.replace(
    /formatCurrency\((trade|t|item|row)\.pnl,\s*\1\.currency\)/g,
    'formatCurrency($1.pnl, $1.currency, $1.market)'
  );
  
  fs.writeFileSync(file, fileContent);
  console.log('✅', file);
});

console.log('\n🎉 Fallback implementado! Agora vai detectar USD automaticamente para forex.');
