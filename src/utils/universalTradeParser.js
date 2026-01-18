// src/utils/universalTradeParser.js - ARQUIVO COMPLETO CORRIGIDO
import * as XLSX from 'xlsx';

const FIELD_ALIASES = {
  asset: ['ativo', 'asset', 'símbolo', 'symbol', 'ticket', 'instrument'],
  date: ['data', 'date', 'time', 'datetime', 'abertura'],
  market: ['mercado', 'market', 'type', 'categoria'],
  currency: ['moeda', 'currency'],
  quantity: ['quantidade', 'quantity', 'volume', 'lotes', 'lots', 'size'],
  entryPrice: ['preço_entrada', 'entry_price', 'entrada', 'entry', 'preço_abertura', 'open_price'],
  exitPrice: ['preço_saída', 'exit_price', 'saída', 'exit', 'preço_fechamento', 'close_price'],
  entryTime: ['hora_entrada', 'entry_time', 'horário_entrada'],
  exitTime: ['hora_saída', 'exit_time', 'horário_saída'],
  pnl: ['resultado', 'pnl', 'profit', 'lucro', 'p&l', 'gain'],
  commission: ['corretagem', 'commission', 'taxas', 'fees', 'custos'],
  swap: ['swap', 'rollover', 'overnight'],
  strategy: ['estratégia', 'strategy', 'setup'],
  notes: ['observações', 'notes', 'comentários', 'comments', 'anotações']
};

function detectMarket(asset) {
  if (!asset) return 'b3daytrade';
  const assetUpper = asset.toUpperCase();
  if (assetUpper.includes('FUT') || assetUpper.match(/^(WIN|WDO|IND|DOL)/)) return 'b3daytrade';
  if (assetUpper.match(/^[A-Z]{6}$/)) return 'forex';
  if (assetUpper.match(/^[A-Z]{4}[0-9]/)) return 'b3swing';
  return 'b3daytrade';
}

function detectCurrency(market) {
  const currencyMap = {
    'b3daytrade': 'BRL',
    'b3swing': 'BRL',
    'b3options': 'BRL',
    'forex': 'USD'
  };
  return currencyMap[market] || 'BRL';
}

function calculateTax(market, pnl) {
  const taxRates = {
    'b3daytrade': 0.20,
    'b3swing': 0.15,
    'b3options': 0.15,
    'forex': 0.15,
    'crypto': 0.15
  };
  const rate = taxRates[market] || 0.15;
  const currency = detectCurrency(market);
  
  if (pnl <= 0) {
    return { rate, amount: 0, category: market, dueDate: null, isPaid: false, exempt: false, currency };
  }
  
  return {
    rate,
    amount: parseFloat((pnl * rate).toFixed(2)),
    category: market,
    dueDate: null,
    isPaid: false,
    exempt: false,
    currency
  };
}

function parseNumber(value) {
  if (value === null || value === undefined || value === '') return null;
  const str = String(value).trim();
  if (typeof value === 'number') return value;
  
  const hasComma = str.includes(',');
  const hasDot = str.includes('.');
  const lastComma = str.lastIndexOf(',');
  const lastDot = str.lastIndexOf('.');
  
  let cleaned = str;
  
  if (hasDot && (!hasComma || lastDot > lastComma)) {
    cleaned = str.replace(/,/g, '');
  } else if (hasComma && (!hasDot || lastComma > lastDot)) {
    cleaned = str.replace(/\./g, '').replace(',', '.');
  } else if (hasComma && !hasDot) {
    cleaned = str.replace(',', '.');
  } else if (hasDot && !hasComma) {
    const afterDot = str.split('.')[1];
    if (afterDot && afterDot.length <= 2) {
      cleaned = str;
    } else {
      cleaned = str.replace(/\./g, '');
    }
  }
  
  cleaned = cleaned.replace(/[R$€£¥\s]/g, '').trim();
  const num = parseFloat(cleaned);
  return isNaN(num) ? null : num;
}

function parseDate(value) {
  if (!value) return null;
  if (value instanceof Date) return value.toISOString().split('T')[0];
  
  const str = String(value).trim();
  if (str.match(/^\d{4}-\d{2}-\d{2}/)) return str.split('T')[0];
  
  if (str.match(/^\d{2}\/\d{2}\/\d{4}/)) {
    const [day, month, year] = str.split('/');
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }
  
  if (str.match(/^\d{1,2}\/\d{1,2}\/\d{4}/)) {
    const parts = str.split('/');
    if (parts[0] > 12) {
      return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
    }
    return `${parts[2]}-${parts[0].padStart(2, '0')}-${parts[1].padStart(2, '0')}`;
  }
  
  const num = parseFloat(value);
  if (!isNaN(num) && num > 40000) {
    const date = new Date((num - 25569) * 86400 * 1000);
    return date.toISOString().split('T')[0];
  }
  
  const parsed = new Date(value);
  if (!isNaN(parsed.getTime())) return parsed.toISOString().split('T')[0];
  return null;
}

export function parseUniversalTrade(row, headers) {
  if (!row || !headers) return null;
  
  const normalizedHeaders = headers.map(h => 
    h.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '_')
  );
  
  const getValue = (field) => {
    const aliases = FIELD_ALIASES[field] || [];
    for (const alias of aliases) {
      const index = normalizedHeaders.findIndex(h => 
        h.includes(alias.toLowerCase().replace(/\s+/g, '_'))
      );
      if (index !== -1 && row[index]) return row[index];
    }
    return null;
  };
  
  const asset = getValue('asset') || '';
  const date = parseDate(getValue('date'));
  const pnl = parseNumber(getValue('pnl'));
  
  if (!asset || !date || pnl === null) return null;
  
  // ✅ CORREÇÃO: Priorizar coluna do Excel
  const marketFromFile = getValue('market');
  const currencyFromFile = getValue('currency');
  
  let market;
  let currency;
  
  if (marketFromFile) {
    market = marketFromFile.toLowerCase();
  } else {
    market = detectMarket(asset);
  }
  
  if (currencyFromFile) {
    currency = currencyFromFile.toUpperCase();
  } else {
    currency = detectCurrency(market);
  }
  
  return {
    asset,
    date,
    market,
    currency,
    quantity: parseNumber(getValue('quantity')) || 1,
    entryPrice: parseNumber(getValue('entryPrice')) || 0,
    exitPrice: parseNumber(getValue('exitPrice')) || 0,
    entryTime: getValue('entryTime') || '',
    exitTime: getValue('exitTime') || '',
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
        const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });
        resolve(jsonData);
      } catch (error) {
        reject(new Error('Erro ao ler arquivo: ' + error.message));
      }
    };
    reader.onerror = () => reject(new Error('Erro ao ler arquivo'));
    reader.readAsArrayBuffer(file);
  });
}

export async function parseTradesFile(fileOrData, existingTrades = []) {
  let data;
  
  if (fileOrData instanceof File) {
    data = await readFileData(fileOrData);
  } else {
    data = fileOrData;
  }
  
  const trades = [];
  const errors = [];
  const duplicates = [];
  
  if (!data || data.length < 2) {
    throw new Error('Arquivo vazio ou inválido');
  }
  
  const headers = data[0];
  
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (!row || row.every(cell => !cell)) continue;
    
    try {
      const trade = parseUniversalTrade(row, headers);
      if (trade) {
        const isDuplicate = existingTrades.some(existing =>
          existing.asset === trade.asset &&
          existing.date === trade.date &&
          Math.abs(existing.pnl - trade.pnl) < 0.01
        );
        
        if (isDuplicate) {
          duplicates.push({ ...trade, index: i });
        } else {
          trades.push(trade);
        }
      }
    } catch (error) {
      errors.push({ line: i + 1, error: error.message, data: row });
    }
  }
  
  return { trades, errors, duplicates, total: data.length - 1 };
}

export function validateTrades(trades) {
  const errors = [];
  const valid = [];
  const invalid = [];
  
  trades.forEach((trade, index) => {
    const tradeErrors = [];
    if (!trade.asset) tradeErrors.push({ field: 'asset', message: 'Ativo é obrigatório' });
    if (!trade.date) tradeErrors.push({ field: 'date', message: 'Data é obrigatória' });
    if (trade.pnl === null || trade.pnl === undefined) {
      tradeErrors.push({ field: 'pnl', message: 'Resultado (PnL) é obrigatório' });
    }
    
    if (tradeErrors.length > 0) {
      errors.push({ line: index + 1, errors: tradeErrors });
      invalid.push(trade);
    } else {
      valid.push(trade);
    }
  });
  
  return {
    valid,
    invalid,
    errors,
    validCount: valid.length,
    invalidCount: invalid.length,
    total: trades.length,
    duplicateCount: 0
  };
}
