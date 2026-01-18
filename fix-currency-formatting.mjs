import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔧 Iniciando migração de formatCurrency...\n');

// 1. Atualizar formatCurrency em metrics.js
console.log('📝 Atualizando src/utils/metrics.js...');
const metricsPath = './src/utils/metrics.js';

try {
  let metricsContent = fs.readFileSync(metricsPath, 'utf8');

  // Encontrar e substituir a função antiga
  const oldPattern = /export const formatCurrency = \(value\) => \{[\s\S]*?return numValue\.toLocaleString\('pt-BR'[\s\S]*?\};/;
  
  const newFunction = `export const formatCurrency = (value, currency = 'BRL') => {
  const numValue = typeof value === 'number' ? value : parseFloat(value) || 0;
  const locale = currency === 'USD' ? 'en-US' : 'pt-BR';
  return numValue.toLocaleString(locale, {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};`;

  metricsContent = metricsContent.replace(oldPattern, newFunction);
  fs.writeFileSync(metricsPath, metricsContent);
  console.log('✅ metrics.js atualizado!\n');
} catch (error) {
  console.error('❌ Erro ao atualizar metrics.js:', error.message);
  process.exit(1);
}

// 2. Substituir em todos os arquivos do src
console.log('🔍 Procurando arquivos para atualizar...\n');

const patterns = [
  { regex: /formatCurrency\(trade\.pnl\)/g, replacement: 'formatCurrency(trade.pnl, trade.currency)' },
  { regex: /formatCurrency\(t\.pnl\)/g, replacement: 'formatCurrency(t.pnl, t.currency)' },
  { regex: /formatCurrency\(item\.pnl\)/g, replacement: 'formatCurrency(item.pnl, item.currency)' },
  { regex: /formatCurrency\(row\.pnl\)/g, replacement: 'formatCurrency(row.pnl, row.currency)' }
];

let totalFiles = 0;
let totalChanges = 0;

function processDir(dir) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      processDir(filePath);
    } else if (/\.(js|jsx)$/.test(file)) {
      let content = fs.readFileSync(filePath, 'utf8');
      let changed = false;
      let fileChanges = 0;
      
      patterns.forEach(({ regex, replacement }) => {
        const matches = content.match(regex);
        if (matches) {
          content = content.replace(regex, replacement);
          changed = true;
          fileChanges += matches.length;
        }
      });
      
      if (changed) {
        fs.writeFileSync(filePath, content);
        console.log(`✅ ${filePath.replace(process.cwd(), '.')} (${fileChanges} alterações)`);
        totalFiles++;
        totalChanges += fileChanges;
      }
    }
  });
}

processDir('./src');

console.log('\n' + '='.repeat(50));
console.log('🎉 Migração concluída com sucesso!');
console.log('📊 Arquivos alterados:', totalFiles);
console.log('🔄 Total de substituições:', totalChanges);
console.log('='.repeat(50));
console.log('\n💡 Próximos passos:');
console.log('   1. Execute: git diff');
console.log('   2. Execute: npm run dev');
console.log('   3. Teste um trade em USD no navegador');
