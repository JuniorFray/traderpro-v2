// src/utils/universalTradeParser.js
// Parser Universal de Trades - Aceita qualquer formato Excel/CSV

import * as XLSX from 'xlsx';
import Papa from 'papaparse';

// Mapeamento flexível de colunas (aceita vários nomes)
const COLUMN_MAPPING = {
  asset: ['ativo', 'asset', 'símbolo', 'symbol', 'instrumento', 'ticker'],
  date: ['data', 'date', 'data_operação', 'trade_date'],
  market: ['mercado', 'market', 'tipo_mercado'],
  currency: ['moeda', 'currency', 'ccy'],
  quantity: ['quantidade', 'quantity', 'lotes', 'lots', 'contratos', 'volume'],
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

// Detectar mercado automaticamente pelo ativo
function detectMarket(asset) {
  if (!asset) return 'forex';
  
  const assetUpper = asset.toUpperCase();
  
  // B3 - Ações
  if (/^[A-Z]{4}[0-9]{1,2}$/.test(assetUpper)) return 'b3swing';
  
  // B3 - Futuros
  if (/WIN|IND|DOL|WDO|FUT/.test(assetUpper)) return 'b3daytrade';
  
  // Forex - Pares de moedas
  if (/^[A-Z]{6}$/.test(assetUpper)) return 'forex';
  
  // Cripto
  if (/BTC|ETH|USD[TC]|USDT/.test(assetUpper)) return 'crypto';
  
  return 'forex'; // default
}

// Detectar moeda pelo mercado
function detectCurrency(market) {
  const currencyMap = {
    'b3daytrade': 'BRL',
    'b3swing': 'BRL',
    'forex': 'USD',
    'crypto': 'USD'
  };
  return currencyMap[market] || 'BRL';
}

// Calcular imposto automaticamente
function calculateTax(market, pnl) {
  const taxRates = {
    'b3daytrade': 0.20,
    'b3swing': 0.15,
    'forex': 0.15,
    'crypto': 0.15
  };
  
  const rate = taxRates[market] || 0.15;
  const currency = detectCurrency(market);
  
  if (pnl <= 0) {
    return {
      rate,
      amount: 0,
      category: market,
      dueDate: null,
      isPaid: false,
      exempt: true,
      currency
    };
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

// Normalizar nome da coluna
function normalizeColumnName(header) {
  return header
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .replace(/[^a-z0-9]/g, '_')
    .trim();
}

// Mapear colunas detectadas
function mapColumns(headers) {
  const mapping = {};
  
  headers.forEach((header, index) => {
    const normalized = normalizeColumnName(header);
    
    // Procurar correspondência
    for (const [field, aliases] of Object.entries(COLUMN_MAPPING)) {
      if (aliases.some(alias => normalized.includes(alias.replace(/[^a-z0-9]/g, '_')))) {
        mapping[field] = index;
        break;
      }
    }
  });
  
  return mapping;
}

// Parsear valor numérico
function parseNumber(value) {
  if (value === null || value === undefined || value === '') return null;
  
  // Remover formatação brasileira/internacional
  const cleaned = String(value)
    .replace(/[R$\s]/g, '')
    .replace(/\./g, '')
    .replace(',', '.');
  
  const num = parseFloat(cleaned);
  return isNaN(num) ? null : num;
}

// Parsear data
function parseDate(value) {
  if (!value) return null;
  
  // Se já é data ISO
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  
  // Tentar parsear DD/MM/YYYY ou DD-MM-YYYY
  const match = String(value).match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})$/);
  if (match) {
    const [, day, month, year] = match;
    const fullYear = year.length === 2 ? `20${year}` : year;
    return `${fullYear}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }
  
  // Tentar Date Excel (número serial)
  const num = parseFloat(value);
  if (!isNaN(num) && num > 40000) { // Excel dates start from 1900
    const date = new Date((num - 25569) * 86400 * 1000);
    return date.toISOString().split('T')[0];
  }
  
  return null;
}

// Processar linha de trade
function processTradeRow(row, columnMapping) {
  const getValue = (field) => {
    const index = columnMapping[field];
    return index !== undefined ? row[index] : null;
  };
  
  const asset = getValue('asset') || '';
  const date = parseDate(getValue('date'));
  const pnl = parseNumber(getValue('pnl'));
  
  if (!asset || !date || pnl === null) {
    return null; // Linha inválida
  }
  
  const market = getValue('market') || detectMarket(asset);
  const currency = getValue('currency') || detectCurrency(market);
  
  const trade = {
    asset: String(asset).trim(),
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
  
  return trade;
}

// Parser principal - Excel
export async function parseExcelFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        
        // Pegar primeira planilha
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1, defval: '' });
        
        if (jsonData.length < 2) {
          reject(new Error('Arquivo vazio ou sem dados'));
          return;
        }
        
        // Primeira linha = headers
        const headers = jsonData[0];
        const columnMapping = mapColumns(headers);
        
        // Processar linhas
        const trades = [];
        const errors = [];
        
        for (let i = 1; i < jsonData.length; i++) {
          const row = jsonData[i];
          
          // Pular linhas vazias
          if (row.every(cell => !cell)) continue;
          
          const trade = processTradeRow(row, columnMapping);
          
          if (trade) {
            trades.push(trade);
          } else {
            errors.push({ row: i + 1, reason: 'Dados obrigatórios faltando' });
          }
        }
        
        resolve({ trades, errors, columnMapping });
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => reject(new Error('Erro ao ler arquivo'));
    reader.readAsArrayBuffer(file);
  });
}

// Parser principal - CSV
export async function parseCSVFile(file) {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      complete: (results) => {
        try {
          const jsonData = results.data;
          
          if (jsonData.length < 2) {
            reject(new Error('Arquivo vazio ou sem dados'));
            return;
          }
          
          const headers = jsonData[0];
          const columnMapping = mapColumns(headers);
          
          const trades = [];
          const errors = [];
          
          for (let i = 1; i < jsonData.length; i++) {
            const row = jsonData[i];
            if (row.every(cell => !cell)) continue;
            
            const trade = processTradeRow(row, columnMapping);
            
            if (trade) {
              trades.push(trade);
            } else {
              errors.push({ row: i + 1, reason: 'Dados obrigatórios faltando' });
            }
          }
          
          resolve({ trades, errors, columnMapping });
        } catch (error) {
          reject(error);
        }
      },
      error: (error) => reject(error)
    });
  });
}

// Parser universal - detecta tipo
export async function parseTradeFile(file) {
  const extension = file.name.split('.').pop().toLowerCase();
  
  if (extension === 'csv') {
    return parseCSVFile(file);
  } else if (['xlsx', 'xls'].includes(extension)) {
    return parseExcelFile(file);
  } else {
    throw new Error('Formato não suportado. Use .xlsx, .xls ou .csv');
  }
}

// Validar trades
export function validateTrades(trades, existingTrades = []) {
  const duplicates = [];
  const valid = [];
  
  trades.forEach((trade, index) => {
    // Verificar duplicata
    const isDuplicate = existingTrades.some(existing => 
      existing.asset === trade.asset &&
      existing.date === trade.date &&
      Math.abs(existing.pnl - trade.pnl) < 0.01
    );
    
    if (isDuplicate) {
      duplicates.push({ ...trade, index });
    } else {
      valid.push(trade);
    }
  });
  
  return {
    valid,
    duplicates,
    total: trades.length,
    validCount: valid.length,
    duplicateCount: duplicates.length
  };
}
