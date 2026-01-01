import * as XLSX from 'xlsx'

/**
 * Parser para arquivos de histórico do MetaTrader 5
 */
export const parseMT5File = async (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result)
        const workbook = XLSX.read(data, { type: 'array' })
        
        // Primeira planilha
        const sheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[sheetName]
        
        // Converter para JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 })
        
        // Detectar e extrair trades
        const trades = extractTrades(jsonData)
        
        resolve({
          success: true,
          trades,
          metadata: extractMetadata(jsonData)
        })
      } catch (error) {
        reject({
          success: false,
          error: 'Erro ao processar arquivo MT5'
        })
      }
    }

    reader.onerror = () => {
      reject({
        success: false,
        error: 'Erro ao ler arquivo'
      })
    }

    reader.readAsArrayBuffer(file)
  })
}

/**
 * Extrai metadados do relatório MT5
 */
const extractMetadata = (data) => {
  const metadata = {
    broker: '',
    account: '',
    date: ''
  }

  // Procurar linhas com metadados (primeiras 10 linhas)
  for (let i = 0; i < Math.min(10, data.length); i++) {
    const row = data[i]
    if (!row || row.length === 0) continue

    const firstCell = String(row[0] || '').toLowerCase()
    
    if (firstCell.includes('empresa') || firstCell.includes('company')) {
      metadata.broker = row[3] || ''
    }
    if (firstCell.includes('conta') || firstCell.includes('account')) {
      metadata.account = String(row[3] || '').split(' ')[0]
    }
    if (firstCell.includes('data') || firstCell.includes('date')) {
      metadata.date = row[3] || ''
    }
  }

  return metadata
}

/**
 * Extrai trades da seção "Posições"
 */
const extractTrades = (data) => {
  const trades = []
  let inPositionsSection = false
  let headerRow = null

  // Encontrar seção "Posições" e cabeçalho
  for (let i = 0; i < data.length; i++) {
    const row = data[i]
    if (!row || row.length === 0) continue

    const firstCell = String(row[0] || '').toLowerCase()

    // Detectar início da seção Posições
    if (firstCell.includes('posições') || firstCell.includes('positions')) {
      inPositionsSection = true
      continue
    }

    // Detectar fim da seção (próxima seção)
    if (inPositionsSection && (firstCell.includes('ordens') || firstCell.includes('orders') || firstCell.includes('transações'))) {
      break
    }

    // Identificar linha de cabeçalho
    if (inPositionsSection && !headerRow) {
      if (firstCell.includes('horário') || firstCell.includes('time')) {
        headerRow = row.map(h => String(h || '').toLowerCase())
        continue
      }
    }

    // Extrair dados do trade
    if (inPositionsSection && headerRow && row[0]) {
      const trade = parseTradeRow(row, headerRow)
      if (trade) {
        trades.push(trade)
      }
    }
  }

  return trades
}

/**
 * Processa uma linha de trade
 */
const parseTradeRow = (row, header) => {
  // Mapear colunas
  const getColumn = (names) => {
    for (const name of names) {
      const idx = header.findIndex(h => h.includes(name))
      if (idx >= 0 && row[idx] !== undefined && row[idx] !== '') {
        return row[idx]
      }
    }
    return null
  }

  // Extrair dados
  const openTime = getColumn(['horário', 'time'])
  const position = getColumn(['position', 'posição', 'ticket'])
  const symbol = getColumn(['ativo', 'symbol'])
  const closePrice = getColumn(['preço', 'price'])
  const commission = getColumn(['comissão', 'commission'])
  const swap = getColumn(['swap'])
  const profit = getColumn(['lucro', 'profit', 'p/l'])

  // Validar campos obrigatórios
  if (!openTime || !symbol || profit === null) {
    return null
  }

  // Normalizar dados
  return {
    date: normalizeDate(openTime),
    asset: normalizeSymbol(symbol),
    pnl: parseFloat(profit) || 0,
    commission: parseFloat(commission) || 0,
    swap: parseFloat(swap) || 0,
    strategy: '', // Será preenchido depois
    notes: position ? `MT5 Position: #${position}` : '',
    positionId: position || null // Para detecção de duplicatas
  }
}

/**
 * Normaliza data MT5 para formato YYYY-MM-DD
 */
const normalizeDate = (dateStr) => {
  if (!dateStr) return new Date().toISOString().split('T')[0]

  // Formato MT5: "2025.04.21 02:45:07" ou "2025.04.21"
  const cleanDate = String(dateStr).split(' ')[0]
  const parts = cleanDate.split('.')
  
  if (parts.length === 3) {
    return `${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`
  }

  return new Date().toISOString().split('T')[0]
}

/**
 * Normaliza símbolo removendo sufixos
 */
const normalizeSymbol = (symbol) => {
  if (!symbol) return 'N/A'
  
  // Remove sufixos comuns: .h, .a, .raw, etc
  return String(symbol)
    .replace(/\.(h|a|raw|pro|mt5|ecn)$/i, '')
    .trim()
    .toUpperCase()
}

/**
 * Valida lista de trades
 */
export const validateTrades = (trades, existingTrades = []) => {
  const results = {
    valid: [],
    duplicates: [],
    errors: []
  }

  const existingPositionIds = new Set(
    existingTrades
      .map(t => t.notes?.match(/#(\d+)/)?.[1])
      .filter(Boolean)
  )

  trades.forEach((trade, index) => {
    const errors = []

    // Validações
    if (!trade.asset || trade.asset === 'N/A') {
      errors.push('Ativo inválido')
    }
    if (!trade.date) {
      errors.push('Data inválida')
    }
    if (trade.pnl === null || isNaN(trade.pnl)) {
      errors.push('P&L inválido')
    }

    // Verificar duplicatas
    if (trade.positionId && existingPositionIds.has(String(trade.positionId))) {
      results.duplicates.push({
        ...trade,
        index,
        reason: 'Position ID já importado'
      })
      return
    }

    if (errors.length > 0) {
      results.errors.push({
        ...trade,
        index,
        errors
      })
    } else {
      results.valid.push(trade)
    }
  })

  return results
}
