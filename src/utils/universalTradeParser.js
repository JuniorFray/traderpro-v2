// src/utils/universalTradeParser.js - VERSÃO CORRIGIDA PARA MT5
import * as XLSX from 'xlsx';


const FIELD_ALIASES = {
  asset: ['ativo', 'asset', 'símbolo', 'symbol', 'ticket', 'instrument', 'simbolo'],
  date: ['data', 'date', 'time', 'datetime', 'abertura', 'horario', 'horário'],
  market: ['mercado', 'market', 'type', 'categoria'],
  currency: ['moeda', 'currency'],
  quantity: ['quantidade', 'quantity', 'volume', 'lotes', 'lots', 'size'],
  entryPrice: ['preço_entrada', 'entry_price', 'entrada', 'entry', 'preço_abertura', 'open_price', 'preco', 'precoentrada'],
  exitPrice: ['preço_saída', 'exit_price', 'saída', 'exit', 'preço_fechamento', 'close_price', 'precosaida'],
  entryTime: ['hora_entrada', 'entry_time', 'horário_entrada'],
  exitTime: ['hora_saída', 'exit_time', 'horário_saída'],
  pnl: ['resultado', 'pnl', 'profit', 'lucro', 'p&l', 'gain', 'lucro'],
  commission: ['corretagem', 'commission', 'taxas', 'fees', 'custos', 'comissao', 'comissão'],
  swap: ['swap', 'rollover', 'overnight'],
  strategy: ['estratégia', 'strategy', 'setup', 'estrategia'],
  notes: ['observações', 'notes', 'comentários', 'comments', 'anotações', 'observacoes', 'comentario']
};


function detectMarket(asset) {
  if (!asset) return 'forex';
  
  // Remover sufixo .h (mesa proprietária)
  const assetClean = asset.toUpperCase().replace('.H', '').replace('.h', '');
  
  // ✅ Forex: pares de moedas (EURUSD, GBPUSD, etc)
  if (assetClean.match(/^(EUR|USD|GBP|JPY|AUD|CAD|CHF|NZD|XAU|XAG|BTC|ETH)/)) {
    return 'forex';
  }
  
  // ✅ Qualquer ativo com 6 letras (padrão forex)
  if (assetClean.match(/^[A-Z]{6,8}$/)) {
    return 'forex';
  }
  
  // B3 Futuros
  if (assetClean.includes('FUT') || assetClean.match(/^(WIN|WDO|IND|DOL)/)) {
    return 'b3daytrade';
  }
  
  // B3 Ações
  if (assetClean.match(/^[A-Z]{4}[0-9]/)) {
    return 'b3swing';
  }
  
  // Padrão: se tem .h ou não detectou, é forex
  if (asset.includes('.h') || asset.includes('.H')) {
    return 'forex';
  }
  
  return 'forex'; // Padrão forex
}



function detectCurrency(market) {
  const currencyMap = {
    'b3daytrade': 'BRL',
    'b3swing': 'BRL',
    'b3options': 'BRL',
    'forex': 'USD'
  };
  return currencyMap[market] || 'USD';
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


// ✅ CORRIGIDO: Remove espaços de valores como "- 5.00"
function parseNumber(value) {
  if (value === null || value === undefined || value === '') return null;
  
  // Se já é número, retorna direto
  if (typeof value === 'number') return value;
  
  // Remover TODOS os espaços (MT5 usa "- 5.00")
  const cleaned = String(value)
    .trim()
    .replace(/\s+/g, '') // Remove espaços
    .replace(/R\$/g, '')
    .replace(/[€£¥]/g, '');
  
  // Detectar formato: ponto ou vírgula como decimal
  const hasComma = cleaned.includes(',');
  const hasDot = cleaned.includes('.');
  const lastComma = cleaned.lastIndexOf(',');
  const lastDot = cleaned.lastIndexOf('.');
  
  let normalized = cleaned;
  
  if (hasDot && (!hasComma || lastDot > lastComma)) {
    // Formato: 1.234,56 ou 1234.56
    normalized = cleaned.replace(/,/g, '');
  } else if (hasComma && (!hasDot || lastComma > lastDot)) {
    // Formato: 1,234.56 ou 1234,56
    normalized = cleaned.replace(/\./g, '').replace(',', '.');
  } else if (hasComma && !hasDot) {
    normalized = cleaned.replace(',', '.');
  } else if (hasDot && !hasComma) {
    const afterDot = cleaned.split('.')[1];
    if (afterDot && afterDot.length <= 2) {
      normalized = cleaned;
    } else {
      normalized = cleaned.replace(/\./g, '');
    }
  }
  
  const num = parseFloat(normalized);
  return isNaN(num) ? null : num;
}


// ✅ CORRIGIDO: Reconhece formato MT5 "2025.04.21 02:45:07"
function parseDate(value) {
  if (!value) return null;
  if (value instanceof Date) return value.toISOString().split('T')[0];
  
  const str = String(value).trim();
  
  // ISO 8601
  if (str.match(/^\d{4}-\d{2}-\d{2}/)) return str.split('T')[0];
  
  // ✅ FORMATO MT5: "2025.04.21 02:45:07"
  if (str.match(/^\d{4}\.\d{2}\.\d{2}/)) {
    const cleanDate = str.split(' ')[0]; // Remove a hora
    const [year, month, day] = cleanDate.split('.');
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }
  
  // DD/MM/YYYY
  if (str.match(/^\d{2}\/\d{2}\/\d{4}/)) {
    const [day, month, year] = str.split('/');
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }
  
  // DD-MM-YYYY ou DD.MM.YYYY
  if (str.match(/^\d{1,2}[\-\.\/]\d{1,2}[\-\.\/]\d{4}/)) {
    const parts = str.split(/[\-\.\/]/);
    if (parts[0] > 12) {
      return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
    }
    return `${parts[2]}-${parts[0].padStart(2, '0')}-${parts[1].padStart(2, '0')}`;
  }
  
  // Excel serial date
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


// ✅ CORRIGIDO: Detecta seção "Posições" do MT5
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
        reject(new Error('Erro ao ler arquivo: ' + error.message));
      }
    };
    reader.onerror = () => reject(new Error('Erro ao ler arquivo'));
    reader.readAsArrayBuffer(file);
  });
}


// ✅ CORRIGIDO: Processa seção "Posições" do MT5
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
  
  // ✅ DETECTAR seção "Posições" do MT5
  let startIndex = 0;
  for (let i = 0; i < data.length; i++) {
    const firstCell = String(data[i][0] || '').toLowerCase();
    if (firstCell.includes('posições') || firstCell.includes('posicoes') || firstCell.includes('position')) {
      startIndex = i + 1; // Próxima linha é o header
      break;
    }
  }
  
  const headers = data[startIndex];
  
  // ✅ Processar linhas da seção "Posições"
  for (let i = startIndex + 1; i < data.length; i++) {
    const row = data[i];
    
    // Pular linhas vazias
    if (!row || row.every(cell => !cell)) continue;
    
    // ✅ PARAR se encontrar outra seção (Ordens, Transações)
    const firstCell = String(row[0] || '').toLowerCase();
    if (firstCell.includes('ordens') || firstCell.includes('transações') || firstCell.includes('transacoes') || firstCell.includes('orders') || firstCell.includes('deals')) {
      break; // Fim da seção Posições
    }
    
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
