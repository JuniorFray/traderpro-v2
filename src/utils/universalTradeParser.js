import * as XLSX from 'xlsx';

const FIELD_ALIASES = {
  asset: ['ativo', 'asset', 'simbolo', 'symbol', 'ticket', 'instrument'],
  date: ['data', 'date', 'time', 'datetime', 'abertura', 'horario'],
  market: ['mercado', 'market', 'type', 'categoria'],
  currency: ['moeda', 'currency'],
  quantity: ['quantidade', 'quantity', 'volume', 'lotes', 'lots', 'size'],
  entryPrice: ['preco_entrada', 'entry_price', 'entrada', 'entry', 'open_price', 'preco'],
  exitPrice: ['preco_saida', 'exit_price', 'saida', 'exit', 'close_price'],
  entryTime: ['hora_entrada', 'entry_time'],
  exitTime: ['hora_saida', 'exit_time'],
  pnl: ['resultado', 'pnl', 'profit', 'lucro', 'gain'],
  commission: ['corretagem', 'commission', 'taxas', 'fees', 'custos', 'comissao'],
  swap: ['swap', 'rollover', 'overnight'],
  strategy: ['estrategia', 'strategy', 'setup'],
  notes: ['observacoes', 'notes', 'comentarios', 'comments']
};

function detectMarket(asset) {
  if (!asset) return 'forex';
  
  // Limpar sufixos
  const clean = asset.toUpperCase()
    .replace(/\.H$/i, '')
    .replace(/\.h$/i, '')
    .trim();
  
  console.log('🔍 [Cloud Function] Detectando mercado para:', clean);
  
  // ✅ PRIORIDADE 1: CRYPTO = FOREX (ANTES DE TUDO!)
  if (clean.match(/^BTC|^ETH|^LTC|^XRP|^DOGE|^ADA|^SOL|^DOT|^MATIC|^AVAX|^LINK/)) {
    console.log('✅ CRYPTO detectado:', clean, '→ FOREX');
    return 'forex';
  }
  
  // ✅ PRIORIDADE 2: B3 Futuros (WIN, WDO, etc)
  if (clean.match(/^WIN|^WDO|^IND|^DOL/) || clean.includes('FUT')) {
    console.log('✅ FUTURO B3 detectado:', clean, '→ B3DAYTRADE');
    return 'b3daytrade';
  }
  
  // ✅ PRIORIDADE 3: B3 Ações (4 letras + número)
  if (clean.match(/^[A-Z]{4}\d/)) {
    console.log('✅ AÇÃO B3 detectada:', clean, '→ B3SWING');
    return 'b3swing';
  }
  
  // ✅ PRIORIDADE 4: Metais preciosos
  if (clean.match(/^XAU|^XAG|^GOLD|^SILVER/)) {
    console.log('✅ METAL detectado:', clean, '→ FOREX');
    return 'forex';
  }
  
  // ✅ PRIORIDADE 5: Pares forex clássicos (EURUSD, GBPJPY, etc)
  if (clean.match(/^(EUR|USD|GBP|JPY|AUD|CAD|CHF|NZD)[A-Z]{3}$/)) {
    console.log('✅ PAR FOREX detectado:', clean, '→ FOREX');
    return 'forex';
  }
  
  // ✅ PRIORIDADE 6: Forex genérico (6-8 letras)
  if (clean.match(/^[A-Z]{6,8}$/)) {
    console.log('✅ FOREX GENÉRICO detectado:', clean, '→ FOREX');
    return 'forex';
  }
  
  console.log('⚠️ Nenhum match, retornando FOREX padrão');
  return 'forex'; // Padrão
}

function detectCurrency(market) {
  const map = { 
    b3daytrade: 'BRL', 
    b3swing: 'BRL', 
    b3options: 'BRL', 
    forex: 'USD'
  };
  return map[market] || 'USD';
}

function calculateTax(market, pnl) {
  const rates = { 
    b3daytrade: 0.20, 
    b3swing: 0.15, 
    b3options: 0.15, 
    forex: 0.15
  };
  const rate = rates[market] || 0.15;
  const currency = detectCurrency(market);
  if (pnl <= 0) return { rate, amount: 0, category: market, dueDate: null, isPaid: false, exempt: false, currency };
  return { rate, amount: parseFloat((pnl * rate).toFixed(2)), category: market, dueDate: null, isPaid: false, exempt: false, currency };
}

function parseNumber(value) {
  if (value === null || value === undefined || value === '') return null;
  if (typeof value === 'number') return value;
  const cleaned = String(value).trim().replace(/\s+/g, '').replace(/R\$/g, '');
  const hasComma = cleaned.includes(',');
  const hasDot = cleaned.includes('.');
  let normalized = cleaned;
  if (hasDot && hasComma) {
    normalized = cleaned.lastIndexOf('.') > cleaned.lastIndexOf(',') ? cleaned.replace(/,/g, '') : cleaned.replace(/\./g, '').replace(',', '.');
  } else if (hasComma) {
    normalized = cleaned.replace(',', '.');
  }
  const num = parseFloat(normalized);
  return isNaN(num) ? null : num;
}

function parseDate(value) {
  if (!value) return null;
  if (value instanceof Date) return value.toISOString().split('T')[0];
  const str = String(value).trim();
  
  // Formato MT5: "2025.04.21 02:45:07"
  if (str.match(/^\d{4}\.\d{2}\.\d{2}/)) {
    const parts = str.split(' ')[0].split('.');
    return `${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`;
  }
  
  // ISO: "2025-04-21"
  if (str.match(/^\d{4}-\d{2}-\d{2}/)) return str.split('T')[0];
  
  // BR: "21/04/2025"
  if (str.match(/^\d{2}\/\d{2}\/\d{4}/)) {
    const parts = str.split('/');
    return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
  }
  
  return null;
}

export function parseUniversalTrade(row, headers) {
  if (!row || !headers) return null;
  
  const normalized = headers.map(h => 
    String(h).toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, '_')
  );
  
  const getValue = (field, columnIndex) => {
    // Se columnIndex for fornecido, use diretamente
    if (columnIndex !== undefined && row[columnIndex]) {
      return row[columnIndex];
    }
    
    const aliases = FIELD_ALIASES[field] || [];
    for (const alias of aliases) {
      const cleanAlias = alias.toLowerCase().replace(/\s+/g, '_');
      const index = normalized.findIndex(h => h.includes(cleanAlias));
      if (index !== -1 && row[index]) return row[index];
    }
    return null;
  };
  
  // MT5 tem 2 colunas "Horário": entrada (índice 0) e saída (índice 8)
  const entryDateCol = normalized[0] && normalized[0].includes('horario') ? 0 : undefined;
  const exitDateCol = normalized[8] && normalized[8].includes('horario') ? 8 : undefined;
  
  const asset = getValue('asset');
  const entryDate = entryDateCol !== undefined ? parseDate(row[entryDateCol]) : parseDate(getValue('date'));
  const pnl = parseNumber(getValue('pnl'));
  
  if (!asset || !entryDate || pnl === null) return null;
  
  // ✅ FORÇA O MARKET ENVIADO PELO EA (se vier)
  let market = getValue('market') ? getValue('market').toLowerCase() : null;
  
  // ✅ CONVERTE "crypto" → "forex"
  if (market === 'crypto') {
    market = 'forex';
  }
  
  // Se não vier market, detecta pelo asset
  if (!market) {
    market = detectMarket(asset);
  }
  
  const currency = getValue('currency') ? getValue('currency').toUpperCase() : detectCurrency(market);
  
  return {
    asset,
    date: entryDate,
    market,
    currency,
    quantity: parseNumber(getValue('quantity')) || 1,
    entryPrice: parseNumber(getValue('entryPrice')) || 0,
    exitPrice: parseNumber(getValue('exitPrice')) || 0,
    entryTime: entryDateCol !== undefined ? String(row[entryDateCol]).split(' ')[1] || '' : getValue('entryTime') || '',
    exitTime: exitDateCol !== undefined ? String(row[exitDateCol]).split(' ')[1] || '' : getValue('exitTime') || '',
    pnl,
    commission: parseNumber(getValue('commission')) || 0,
    swap: parseNumber(getValue('swap')) || 0,
    strategy: getValue('strategy') || '',
    notes: getValue('notes') || '',
    taxes: calculateTax(market, pnl)
  };
}

async function readFileData(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1, defval: '' });
        resolve(jsonData);
      } catch (error) {
        reject(new Error('Erro ao ler arquivo'));
      }
    };
    reader.onerror = () => reject(new Error('Erro ao ler arquivo'));
    reader.readAsArrayBuffer(file);
  });
}

export async function parseTradesFile(fileOrData, existingTrades = []) {
  let data = fileOrData instanceof File ? await readFileData(fileOrData) : fileOrData;
  const trades = [];
  const errors = [];
  const duplicates = [];
  
  if (!data || data.length < 2) throw new Error('Arquivo vazio');
  
  // Procurar linha com "Posições"
  let startIndex = 0;
  for (let i = 0; i < Math.min(data.length, 20); i++) {
    const cell = String(data[i][0] || '').toLowerCase();
    if (cell.includes('posicoes') || cell.includes('posições') || cell.includes('position')) {
      startIndex = i + 1; // Headers na próxima linha
      break;
    }
  }
  
  if (startIndex >= data.length - 1) {
    throw new Error('Formato de arquivo não reconhecido');
  }
  
  const headers = data[startIndex];
  
  // Debug
  console.log('🔍 Headers encontrados:', headers);
  console.log('🔍 Primeira linha de dados:', data[startIndex + 1]);
  
  for (let i = startIndex + 1; i < data.length; i++) {
    const row = data[i];
    if (!row || row.every(c => !c)) continue;
    
    // Parar em "Ordens" ou "Ofertas"
    const cell = String(row[0] || '').toLowerCase();
    if (cell.includes('ordens') || cell.includes('orders') || cell.includes('ofertas')) break;
    
    try {
      const trade = parseUniversalTrade(row, headers);
      if (trade) {
        const isDup = existingTrades.some(e => 
          e.asset === trade.asset && 
          e.date === trade.date && 
          Math.abs(e.pnl - trade.pnl) < 0.01
        );
        if (isDup) {
          duplicates.push(trade);
        } else {
          trades.push(trade);
        }
      }
    } catch (error) {
      errors.push({ line: i + 1, error: error.message });
    }
  }
  
  console.log(`✅ ${trades.length} trades válidos | ⚠️ ${duplicates.length} duplicados | ❌ ${errors.length} erros`);
  
  return { trades, errors, duplicates, total: data.length - startIndex - 1 };
}

export function validateTrades(trades, existingTrades = []) {
  const valid = [];
  const invalid = [];
  const duplicates = [];
  const errors = [];
  
  trades.forEach((trade, index) => {
    const errs = [];
    if (!trade.asset) errs.push({ field: 'asset', message: 'Ativo obrigatório' });
    if (!trade.date) errs.push({ field: 'date', message: 'Data obrigatória' });
    if (trade.pnl === null) errs.push({ field: 'pnl', message: 'PnL obrigatório' });
    
    const isDup = existingTrades.some(e => 
      e.asset === trade.asset && 
      e.date === trade.date && 
      Math.abs(e.pnl - trade.pnl) < 0.01
    );
    
    if (errs.length > 0) {
      errors.push({ line: index + 1, errors: errs });
      invalid.push(trade);
    } else if (isDup) {
      duplicates.push(trade);
    } else {
      valid.push(trade);
    }
  });
  
  return {
    valid,
    invalid,
    duplicates,
    errors,
    validCount: valid.length,
    invalidCount: invalid.length,
    duplicateCount: duplicates.length,
    total: trades.length
  };
}
