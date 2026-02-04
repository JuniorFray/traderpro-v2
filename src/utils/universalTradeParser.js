import * as XLSX from 'xlsx';

const FIELD_ALIASES = {
  asset: ['ativo', 'asset', 'simbolo', 'symbol', 'instrument', 'par', 'pair'],
  date: ['data', 'date', 'time', 'datetime', 'horario', 'hora_de_fecho', 'closing_time', 'tempo_de_atualizacao'],
  type: ['type', 'tipo', 'direction', 'direcao', 'direção_de_abertura', 'opening_direction', 'lado'],
  market: ['mercado', 'market', 'type', 'categoria'],
  currency: ['moeda', 'currency'],
  quantity: ['quantidade', 'quantity', 'volume', 'lotes', 'lots', 'size', 'quantidade_de_fecho', 'closing_quantity', 'qtd._preenchida', 'qtde'],
  entryPrice: ['precoentrada', 'entryprice', 'entrada', 'entry', 'openprice', 'preco', 'preço_de_entrada', 'opening_price', 'preco_medio'],
  exitPrice: ['precosaida', 'exitprice', 'saida', 'exit', 'closeprice', 'preço_de_fecho', 'closing_price', 'preco_medio'],
  entryTime: ['horaentrada', 'entrytime'],
  exitTime: ['horasaida', 'exittime'],
  pnl: ['resultado', 'pnl', 'profit', 'lucro', 'gain', 'liquidos', 'líquidos', 'net_profit', 'gross_profit', 'closed_p&l', 'net_closed_p&l'],
  commission: ['corretagem', 'commission', 'taxas', 'fees', 'custos', 'comissao'],
  swap: ['swap', 'rollover', 'overnight'],
  strategy: ['estrategia', 'strategy', 'setup'],
  notes: ['observacoes', 'notes', 'comentarios', 'comments'],
  positionId: ['position_id', 'positionid', 'id_posicao'],
  status: ['status', 'estado', 'state']
};

function detectMarket(asset) {
  if (!asset) return 'forex';
  
  const clean = asset.toUpperCase()
    .replace(/\.H$/i, '')
    .replace(/\.h$/i, '')
    .trim();
  
  if (clean.match(/^BTC|^ETH|^LTC|^XRP|^DOGE|^ADA|^SOL|^DOT|^MATIC|^AVAX|^LINK/)) {
    return 'forex';
  }
  
  if (clean.match(/^WIN|^WDO|^IND|^DOL/) || clean.includes('FUT')) {
    return 'b3daytrade';
  }
  
  if (clean.match(/^[A-Z]{4}\d/)) {
    return 'b3swing';
  }
  
  if (clean.match(/^XAU|^XAG|^GOLD|^SILVER/)) {
    return 'forex';
  }
  
  if (clean.match(/^(EUR|USD|GBP|JPY|AUD|CAD|CHF|NZD)[A-Z]{3}$/)) {
    return 'forex';
  }
  
  if (clean.match(/^[A-Z]{6,8}$/)) {
    return 'forex';
  }
  
  return 'forex';
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
  
  const str = String(value).trim();
  
  let cleaned = str
    .replace(/\s/g, '')
    .replace(/[R$€£¥]/g, '')
    .replace(/lotes?/gi, '')
    .replace(/usd|brl|eur|gbp/gi, '');
  
  const dotCount = (cleaned.match(/\./g) || []).length;
  const commaCount = (cleaned.match(/,/g) || []).length;
  
  let normalized;
  
  if (commaCount > 0 && dotCount === 0) {
    normalized = cleaned.replace(/\./g, '').replace(',', '.');
  }
  else if (dotCount > 0 && commaCount === 0) {
    normalized = cleaned.replace(/,/g, '');
  }
  else if (dotCount > 0 && commaCount > 0) {
    const lastDot = cleaned.lastIndexOf('.');
    const lastComma = cleaned.lastIndexOf(',');
    
    if (lastDot > lastComma) {
      normalized = cleaned.replace(/,/g, '').replace(/\./g, '');
      const parts = str.match(/\.(\d+)$/);
      if (parts) normalized = normalized.slice(0, -parts[1].length) + '.' + parts[1];
    } else {
      normalized = cleaned.replace(/,/g, '');
    }
  }
  else {
    normalized = cleaned;
  }
  
  const num = parseFloat(normalized);
  return isNaN(num) ? null : num;
}

function parseDate(value) {
  if (!value) return null;
  if (value instanceof Date) return value.toISOString().split('T')[0];
  
  const str = String(value).trim();
  
  if (str.match(/\d{4}\.\d{2}\.\d{2}/)) {
    const parts = str.split(' ')[0].split('.');
    return `${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`;
  }
  
  if (str.match(/\d{4}-\d{2}-\d{2}/)) {
    return str.split('T')[0];
  }
  
  if (str.match(/\d{2}\/\d{2}\/\d{4}/)) {
    const parts = str.split('/');
    return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
  }
  
  if (str.match(/\d{1,2}\s+[A-Za-z]{3}\s+\d{4}/)) {
    const monthMap = {
      'jan': '01', 'fev': '02', 'mar': '03', 'abr': '04',
      'mai': '05', 'jun': '06', 'jul': '07', 'ago': '08',
      'set': '09', 'out': '10', 'nov': '11', 'dez': '12',
      'feb': '02', 'apr': '04', 'may': '05', 'aug': '08',
      'sep': '09', 'oct': '10', 'dec': '12'
    };
    
    const parts = str.split(' ');
    const day = parts[0].padStart(2, '0');
    const monthAbbr = parts[1].toLowerCase();
    const year = parts[2];
    const month = monthMap[monthAbbr] || '01';
    
    return `${year}-${month}-${day}`;
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
    if (columnIndex !== undefined && row[columnIndex]) {
      return row[columnIndex];
    }
    
    const aliases = FIELD_ALIASES[field] || [];
    
    for (const alias of aliases) {
      const cleanAlias = alias.toLowerCase().replace(/\s+/g, '_');
      const index = normalized.findIndex(h => h.includes(cleanAlias));
      
      if (index !== -1 && row[index]) {
        return row[index];
      }
    }
    
    return null;
  };
  
  const asset = getValue('asset');
  
  const entryDateCol = normalized[0] && normalized[0].includes('horario') ? 0 : undefined;
  const exitDateCol = normalized[8] && normalized[8].includes('horario') ? 8 : undefined;
  
  const entryDate = entryDateCol !== undefined ? parseDate(row[entryDateCol]) : parseDate(getValue('date'));
  const pnl = parseNumber(getValue('pnl'));
  
  if (!asset || !entryDate || pnl === null) {
    return null;
  }
  
  let market = getValue('market') ? getValue('market').toLowerCase() : null;
  
  if (market === 'crypto') {
    market = 'forex';
  }
  
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

/**
 * ✅ FUNÇÃO PARA AGRUPAR ORDENS DA TICKMILL POR POSITION ID
 * Tickmill exporta cada ordem individualmente (abertura, stop, take profit)
 * Esta função consolida todas as ordens de uma mesma posição em um único trade
 */
function groupTickmillOrders(data, headers) {
  console.log('🔄 Agrupando ordens Tickmill por Position ID...');
  
  const normalized = headers.map(h => 
    String(h).toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, '_')
  );
  
  // Encontrar índices das colunas importantes
  const posIdIdx = normalized.findIndex(h => h.includes('position_id'));
  const statusIdx = normalized.findIndex(h => h.includes('status'));
  const pnlIdx = normalized.findIndex(h => h.includes('closed_p&l'));
  const typeIdx = normalized.findIndex(h => h.includes('tipo'));
  const sideIdx = normalized.findIndex(h => h.includes('lado'));
  
  if (posIdIdx === -1) {
    console.log('⚠️ Não é arquivo Tickmill (Position ID não encontrado)');
    return null;
  }
  
  // Agrupar ordens por Position ID
  const positionsMap = new Map();
  
  for (const row of data) {
    const posId = String(row[posIdIdx] || '').trim();
    const status = String(row[statusIdx] || '').trim();
    
    // Ignorar ordens sem Position ID ou não executadas
    if (!posId || status !== 'Executado') continue;
    
    if (!positionsMap.has(posId)) {
      positionsMap.set(posId, []);
    }
    
    positionsMap.get(posId).push(row);
  }
  
  console.log(`📊 ${positionsMap.size} posições únicas encontradas`);
  
  // Consolidar cada posição em um único trade
  const consolidatedRows = [];
  
  for (const [posId, orders] of positionsMap.entries()) {
    // Encontrar ordem de abertura (primeira ordem com preço médio)
    const openOrder = orders.find(order => {
      const type = String(order[typeIdx] || '').toLowerCase();
      return type.includes('mercado') || type.includes('limite') || type.includes('stop');
    });
    
    // Encontrar ordem de fechamento (ordem com Closed P&L preenchido)
    const closeOrder = orders.find(order => {
      const pnl = String(order[pnlIdx] || '').trim();
      return pnl && pnl !== '0.0' && pnl !== '';
    });
    
    if (!openOrder || !closeOrder) {
      console.warn(`⚠️ Posição ${posId} incompleta (sem abertura ou fechamento)`);
      continue;
    }
    
    // Criar linha consolidada mesclando abertura e fechamento
    const consolidatedRow = [...openOrder];
    
    // Sobrescrever campos do fechamento
    if (pnlIdx !== -1 && closeOrder[pnlIdx]) {
      consolidatedRow[pnlIdx] = closeOrder[pnlIdx];
    }
    
    // Usar comissão da ordem de fechamento se existir
    const commissionIdx = normalized.findIndex(h => h.includes('commission'));
    if (commissionIdx !== -1) {
      const openComm = parseNumber(openOrder[commissionIdx]) || 0;
      const closeComm = parseNumber(closeOrder[commissionIdx]) || 0;
      consolidatedRow[commissionIdx] = openComm + closeComm;
    }
    
    // Usar data/hora da ordem de fechamento
    const dateIdx = normalized.findIndex(h => h.includes('tempo_de_atualizacao'));
    if (dateIdx !== -1 && closeOrder[dateIdx]) {
      consolidatedRow[dateIdx] = closeOrder[dateIdx];
    }
    
    consolidatedRows.push(consolidatedRow);
  }
  
  console.log(`✅ ${consolidatedRows.length} trades consolidados`);
  return consolidatedRows;
}

/**
 * ✅ FUNÇÃO PARA DETECTAR SE É ARQUIVO TICKMILL
 */
function isTickmillFile(headers) {
  const headerText = headers.join('|').toLowerCase();
  return headerText.includes('position id') || 
         headerText.includes('position_id') ||
         (headerText.includes('lado') && headerText.includes('closed p&l'));
}

/**
 * ✅ FUNÇÃO CORRIGIDA PARA LER ARQUIVOS MT5 (XLSX) E CTRADER (CSV)
 * Detecta automaticamente o tipo de arquivo pela assinatura binária
 */
async function readFileData(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        let data = new Uint8Array(e.target.result);
        
        // ✅ REMOVER BOM UTF-8 se presente (0xEF 0xBB 0xBF)
        if (data.length >= 3 && data[0] === 0xEF && data[1] === 0xBB && data[2] === 0xBF) {
          console.log('🔧 BOM UTF-8 detectado e removido');
          data = data.slice(3);
        }
        
        // ✅ DETECTAR TIPO DE ARQUIVO
        // XLSX começa com "PK" (0x50 0x4B) = arquivo ZIP comprimido
        const isXLSX = data.length >= 2 && data[0] === 0x50 && data[1] === 0x4B;
        
        let workbook;
        
        if (isXLSX) {
          // ✅ XLSX BINÁRIO (MT5) - ler direto do ArrayBuffer
          console.log('📊 Arquivo XLSX detectado (MT5)');
          workbook = XLSX.read(data, { 
            type: 'array',
            raw: false,
            codepage: 65001, // UTF-8
            cellDates: true,
            dateNF: 'yyyy.mm.dd'
          });
        } else {
          // ✅ CSV/TEXTO (cTrader) - decodificar e ler como string
          console.log('📄 Arquivo CSV/Texto detectado (cTrader)');
          const decoder = new TextDecoder('utf-8');
          const textContent = decoder.decode(data);
          
          workbook = XLSX.read(textContent, { 
            type: 'string',
            raw: false,
            codepage: 65001,
            FS: ',', // Field separator = vírgula
            dateNF: 'dd/mm/yyyy'
          });
        }
        
        // Ler a primeira planilha
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        
        // Converter para JSON
        const jsonData = XLSX.utils.sheet_to_json(firstSheet, { 
          header: 1, // Retorna arrays ao invés de objetos
          defval: '', // Valor padrão para células vazias
          raw: false, // Não retornar valores raw (converte datas, números, etc)
          blankrows: false // Ignorar linhas completamente em branco
        });
        
        console.log(`✅ Arquivo lido com sucesso: ${jsonData.length} linhas`);
        resolve(jsonData);
        
      } catch (error) {
        console.error('❌ Erro ao ler arquivo:', error);
        reject(new Error('Erro ao ler arquivo: ' + error.message));
      }
    };
    
    reader.onerror = () => reject(new Error('Erro ao ler arquivo'));
    
    // ✅ SEMPRE usar readAsArrayBuffer para detectar corretamente o tipo
    reader.readAsArrayBuffer(file);
  });
}

/**
 * ✅ FUNÇÃO CORRIGIDA PARA DETECTAR HEADERS
 * Agora detecta corretamente headers MT5 que aparecem APÓS linhas de metadados
 */
function findHeaderRow(data) {
  if (!data || data.length < 2) return -1;
  
  for (let i = 0; i < Math.min(data.length, 30); i++) {
    const row = data[i];
    const firstCell = String(row[0] || '').toLowerCase();
    
    // Ignorar linhas vazias ou com apenas 1 célula preenchida
    const nonEmptyCells = row.filter(c => c && String(c).trim() !== '').length;
    if (nonEmptyCells <= 1) {
      continue;
    }
    
    // Normalizar texto da linha para busca
    const rowText = row.join('|').toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
    
    // ✅ NOVA DETECÇÃO: Linha que contém múltiplos campos conhecidos
    const headerKeywords = [
      'horario', 'time', 'hora',
      'position', 'ticket', 'order',
      'ativo', 'symbol', 'simbolo', 'asset',
      'tipo', 'type', 'direction',
      'volume', 'quantidade', 'quantity',
      'profit', 'resultado', 'pnl', 'lucro'
    ];
    
    const keywordMatches = headerKeywords.filter(keyword => 
      rowText.includes(keyword)
    ).length;
    
    // Se encontrou 3+ keywords de header, é muito provável que seja o header
    if (keywordMatches >= 3) {
      console.log(`✅ Header detectado na linha ${i + 1} (${keywordMatches} keywords)`);
      return i;
    }
    
    // ✅ FALLBACK: Detectar seção "Posições" seguida de header na próxima linha
    if (firstCell.includes('posicoes') || firstCell.includes('posições') || firstCell.includes('position')) {
      // Verificar se a próxima linha tem headers
      if (i + 1 < data.length) {
        const nextRow = data[i + 1];
        const nextRowText = nextRow.join('|').toLowerCase();
        
        if (nextRowText.includes('horario') || nextRowText.includes('time') || 
            nextRowText.includes('ativo') || nextRowText.includes('symbol')) {
          console.log(`✅ Header detectado na linha ${i + 2} (após seção "Posições")`);
          return i + 1;
        }
      }
    }
  }
  
  // ✅ ÚLTIMO FALLBACK: MT5 com dados diretos (sem headers explícitos)
  const firstRow = data[0];
  if (firstRow && firstRow.length >= 5) {
    const firstCell = String(firstRow[0] || '');
    // MT5 começa com data: "2025.07.29 00:06:23"
    if (firstCell.match(/^\d{4}\.\d{2}\.\d{2}/)) {
      console.log('⚠️ MT5 sem headers explícitos detectado - usando headers padrão');
      return -1; // Sinaliza que precisa inserir headers
    }
  }
  
  return -1; // Não encontrou headers
}

export async function parseTradesFile(fileOrData, existingTrades = []) {
  let data = fileOrData instanceof File ? await readFileData(fileOrData) : fileOrData;
  const trades = [];
  const errors = [];
  const duplicates = [];
  
  if (!data || data.length < 2) throw new Error('Arquivo vazio');
  
  // ✅ USAR NOVA FUNÇÃO DE DETECÇÃO
  let startIndex = findHeaderRow(data);
  
  // ✅ FALLBACK: MT5 sem headers (apenas dados)
  if (startIndex === -1) {
    const firstRow = data[0];
    if (firstRow && firstRow.length >= 5) {
      const firstCell = String(firstRow[0] || '');
      // MT5 começa com data: "2025.07.29 00:06:23" ou similar
      if (firstCell.match(/^\d{4}\.\d{2}\.\d{2}/) || firstCell.match(/^\d{2}\/\d{2}\/\d{4}/)) {
        console.log('🔧 Inserindo headers padrão MT5');
        // Headers MT5 padrão (posições/ordens)
        const mt5Headers = [
          'Horário', 'Position', 'Ativo', 'Tipo', 'Volume', 
          'Preço', 'S/L', 'T/P', 'Horário', 'Estado', 
          'Comentário', 'Comissão', 'Swap', 'Resultado'
        ];
        data.unshift(mt5Headers);
        startIndex = 0;
      }
    }
  }
  
  if (startIndex === -1) {
    console.error('❌ Headers não encontrados. Primeiras 10 linhas:', data.slice(0, 10));
    throw new Error('Formato de arquivo não reconhecido - headers não encontrados');
  }
  
  if (startIndex >= data.length - 1) {
    throw new Error('Arquivo sem dados de trades');
  }
  
  const headers = data[startIndex];
  console.log('📋 Headers encontrados:', headers);
  
  // ✅ DETECTAR E PROCESSAR ARQUIVO TICKMILL
  let dataRows = data.slice(startIndex + 1);
  
  if (isTickmillFile(headers)) {
    console.log('🎯 Arquivo Tickmill detectado!');
    const consolidatedRows = groupTickmillOrders(dataRows, headers);
    
    if (consolidatedRows && consolidatedRows.length > 0) {
      dataRows = consolidatedRows;
      console.log(`✅ Usando ${dataRows.length} trades consolidados da Tickmill`);
    } else {
      console.warn('⚠️ Falha ao consolidar ordens Tickmill, processando normalmente');
    }
  }
  
  // ✅ PROCESSAR LINHAS DE DADOS
  for (let i = 0; i < dataRows.length; i++) {
    const row = dataRows[i];
    
    // Ignorar linhas completamente vazias
    if (!row || row.every(c => !c)) continue;
    
    // ✅ PARAR em seções como "Ordens", "Orders", "Ofertas", "Total"
    const cell = String(row[0] || '').toLowerCase();
    if (cell.includes('ordens') || cell.includes('orders') || 
        cell.includes('ofertas') || cell.includes('total') ||
        cell.includes('resumo') || cell.includes('summary')) {
      console.log(`🛑 Fim da seção de trades na linha ${i + 1}: "${row[0]}"`);
      break;
    }
    
    try {
      const trade = parseUniversalTrade(row, headers);
      if (trade) {
        // Verificar duplicatas
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
      console.warn(`⚠️ Erro ao processar linha ${i + 1}:`, error.message);
    }
  }
  
  console.log(`✅ Processamento concluído: ${trades.length} trades, ${duplicates.length} duplicatas, ${errors.length} erros`);
  
  return { 
    trades, 
    errors, 
    duplicates, 
    total: dataRows.length
  };
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