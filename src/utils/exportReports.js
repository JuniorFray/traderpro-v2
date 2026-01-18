import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import * as XLSX from 'xlsx'
import { MARKET_NAMES } from '../constants/markets'

const formatPercent = (value) => {
  if (typeof value !== 'number' || isNaN(value)) return '0%'
  return `${(value * 100).toFixed(2)}%`
}

// ✅ Funções auxiliares de conversão
const convertValue = (usdValue, brlValue, selectedCurrency, exchangeRate) => {
  if (selectedCurrency === 'USD') {
    return usdValue + (brlValue / exchangeRate)
  } else {
    return (usdValue * exchangeRate) + brlValue
  }
}

const formatCurrency = (value, currency = 'BRL', keepSign = true) => {
  const symbol = currency === 'USD' ? '$' : 'R$'
  const locale = currency === 'USD' ? 'en-US' : 'pt-BR'
  const absValue = Math.abs(value)
  const formatted = absValue.toLocaleString(locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
  
  if (keepSign && value < 0) {
    return `-${symbol} ${formatted}`
  }
  return `${symbol} ${formatted}`
}


const formatWithEquivalent = (usdValue, brlValue, selectedCurrency, exchangeRate) => {
  const mainValue = convertValue(usdValue, brlValue, selectedCurrency, exchangeRate)
  const mainFormatted = formatCurrency(mainValue, selectedCurrency)
  
  if (selectedCurrency === 'USD') {
    const brlTotal = (usdValue * exchangeRate) + brlValue
    return `${mainFormatted} (~ R$ ${brlTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })})`
  } else {
    const usdTotal = usdValue + (brlValue / exchangeRate)
    return `${mainFormatted} (~ $ ${usdTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })})`
  }
}


// ✅ Calcular métricas separando USD e BRL
const calculateMetricsWithCurrency = (trades, exchangeRate) => {
  let totalPnlUSD = 0, totalPnlBRL = 0
  let totalCommissionUSD = 0, totalCommissionBRL = 0
  let totalSwapUSD = 0, totalSwapBRL = 0
  let totalTaxUSD = 0, totalTaxBRL = 0
  let wins = 0, losses = 0
  let maxWinUSD = 0, maxWinBRL = 0
  let maxLossUSD = 0, maxLossBRL = 0
  let winsUSD = [], winsBRL = []
  let lossesUSD = [], lossesBRL = []

  trades.forEach(trade => {
    const isUSD = trade.currency === 'USD'
    const pnl = parseFloat(trade.pnl) || 0
    const commission = parseFloat(trade.commission) || 0
    const swap = parseFloat(trade.swap) || 0
    const tax = parseFloat(trade.taxes?.amount) || 0

    if (isUSD) {
      totalPnlUSD += pnl
      totalCommissionUSD += commission
      totalSwapUSD += swap
      totalTaxUSD += tax

      if (pnl > 0) {
        wins++
        winsUSD.push(pnl)
        if (pnl > maxWinUSD) maxWinUSD = pnl
      } else if (pnl < 0) {
        losses++
        lossesUSD.push(pnl)
        if (pnl < maxLossUSD) maxLossUSD = pnl
      }
    } else {
      totalPnlBRL += pnl
      totalCommissionBRL += commission
      totalSwapBRL += swap
      totalTaxBRL += tax

      if (pnl > 0) {
        wins++
        winsBRL.push(pnl)
        if (pnl > maxWinBRL) maxWinBRL = pnl
      } else if (pnl < 0) {
        losses++
        lossesBRL.push(pnl)
        if (pnl < maxLossBRL) maxLossBRL = pnl
      }
    }
  })

  const winRate = trades.length > 0 ? (wins / trades.length) * 100 : 0
  
  const totalGrossProfitUSD = winsUSD.reduce((a, b) => a + b, 0)
  const totalGrossProfitBRL = winsBRL.reduce((a, b) => a + b, 0)
  const totalGrossLossUSD = Math.abs(lossesUSD.reduce((a, b) => a + b, 0))
  const totalGrossLossBRL = Math.abs(lossesBRL.reduce((a, b) => a + b, 0))

  const totalGrossProfit = totalGrossProfitUSD + (totalGrossProfitBRL / exchangeRate)
  const totalGrossLoss = totalGrossLossUSD + (totalGrossLossBRL / exchangeRate)
  const profitFactor = totalGrossLoss > 0 ? totalGrossProfit / totalGrossLoss : 0

  return {
    totalPnlUSD, totalPnlBRL,
    totalCommissionUSD, totalCommissionBRL,
    totalSwapUSD, totalSwapBRL,
    totalTaxUSD, totalTaxBRL,
    wins, losses, winRate, profitFactor,
    maxWinUSD, maxWinBRL,
    maxLossUSD, maxLossBRL,
    totalTrades: trades.length
  }
}

export const exportToPDF = (trades, metricsOld, period = 'completo', selectedCurrency = 'USD', exchangeRate = 5.45) => {
  const doc = new jsPDF()
  
  // ✅ Recalcular métricas com separação de moedas
  const metrics = calculateMetricsWithCurrency(trades, exchangeRate)

  const totalPnl = convertValue(metrics.totalPnlUSD, metrics.totalPnlBRL, selectedCurrency, exchangeRate)
  const totalCommission = convertValue(metrics.totalCommissionUSD, metrics.totalCommissionBRL, selectedCurrency, exchangeRate)
  const totalSwap = convertValue(metrics.totalSwapUSD, metrics.totalSwapBRL, selectedCurrency, exchangeRate)
  const totalTax = convertValue(metrics.totalTaxUSD, metrics.totalTaxBRL, selectedCurrency, exchangeRate)
  const totalCosts = totalCommission + totalSwap
  const netProfit = totalPnl - totalCosts - totalTax
  const maxWin = convertValue(metrics.maxWinUSD, metrics.maxWinBRL, selectedCurrency, exchangeRate)
  const maxLoss = convertValue(metrics.maxLossUSD, metrics.maxLossBRL, selectedCurrency, exchangeRate)

  // ========================================
  // PÁGINA 1: CAPA
  // ========================================
  doc.setFillColor(34, 197, 94)
  doc.rect(0, 0, 210, 60, 'F')

  doc.setTextColor(255, 255, 255)
  doc.setFontSize(28)
  doc.text('TraderPro', 105, 30, { align: 'center' })
  doc.setFontSize(16)
  doc.text('Relatório de Trading - v3.0', 105, 42, { align: 'center' })

  doc.setTextColor(0, 0, 0)
  doc.setFontSize(12)
  doc.text('Período: ' + period, 14, 75)
  doc.text('Gerado em: ' + new Date().toLocaleString('pt-BR'), 14, 82)
  doc.text('Total de Trades: ' + metrics.totalTrades, 14, 89)
  doc.text(`Moeda: ${selectedCurrency} (1 USD = R$ ${exchangeRate.toFixed(4)})`, 14, 96)

  const isProfit = netProfit >= 0
  doc.setFontSize(14)
  doc.text('Resultado Líquido', 14, 112)
  doc.setTextColor(isProfit ? 34 : 220, isProfit ? 197 : 38, isProfit ? 94 : 38)
  doc.setFontSize(28)
  doc.text(formatCurrency(netProfit, selectedCurrency), 14, 125)
  doc.setFontSize(10)
  doc.setTextColor(120, 120, 120)
  const equivalent = selectedCurrency === 'USD' 
  ? `~ R$ ${((netProfit * exchangeRate)).toLocaleString('pt-BR', {minimumFractionDigits: 2})}`
  : `~ $ ${(netProfit / exchangeRate).toLocaleString('en-US', {minimumFractionDigits: 2})}`

  doc.text(equivalent, 14, 132)
  doc.setTextColor(0, 0, 0)

  // Cards
  const drawCard = (x, y, label, value, color = 0) => {
    doc.setDrawColor(220, 220, 220)
    doc.setFillColor(248, 248, 248)
    doc.roundedRect(x, y, 90, 22, 3, 3, 'FD')

    doc.setFontSize(9)
    doc.setTextColor(120, 120, 120)
    doc.text(label, x + 5, y + 9)

    doc.setFontSize(14)
    if (color === 1) doc.setTextColor(34, 197, 94)
    else if (color === 2) doc.setTextColor(220, 38, 38)
    else doc.setTextColor(0, 0, 0)

    doc.text(String(value), x + 5, y + 17)
    doc.setTextColor(0, 0, 0)
  }

  let cardY = 145
  drawCard(14, cardY, 'Win Rate', `${metrics.winRate.toFixed(1)}%`)
  drawCard(110, cardY, 'Profit Factor', metrics.profitFactor.toFixed(2))

  cardY += 27
  drawCard(14, cardY, 'Vitórias', metrics.wins, 1)
  drawCard(110, cardY, 'Derrotas', metrics.losses, 2)

  cardY += 27
  drawCard(14, cardY, 'Maior Ganho', formatCurrency(maxWin, selectedCurrency), 1)
  drawCard(110, cardY, 'Maior Perda', formatCurrency(Math.abs(maxLoss), selectedCurrency), 2)

  cardY += 27
  drawCard(14, cardY, 'Impostos', formatCurrency(totalTax, selectedCurrency), 2)
  drawCard(110, cardY, 'Custos Op.', formatCurrency(totalCosts, selectedCurrency), 2)

  // ========================================
  // PÁGINA 2: BREAKDOWN FINANCEIRO
  // ========================================
  doc.addPage()
  doc.setFontSize(18)
  doc.setTextColor(34, 197, 94)
  doc.text('Breakdown Financeiro Detalhado', 14, 20)
  doc.setTextColor(0, 0, 0)

  autoTable(doc, {
    startY: 30,
    head: [['Descrição', 'Valor']],
    body: [
      ['Resultado Bruto', formatWithEquivalent(metrics.totalPnlUSD, metrics.totalPnlBRL, selectedCurrency, exchangeRate)],
      ['- Corretagem', formatWithEquivalent(metrics.totalCommissionUSD, metrics.totalCommissionBRL, selectedCurrency, exchangeRate)],
      ['- Swap', formatWithEquivalent(metrics.totalSwapUSD, metrics.totalSwapBRL, selectedCurrency, exchangeRate)],
      ['- Impostos', formatWithEquivalent(metrics.totalTaxUSD, metrics.totalTaxBRL, selectedCurrency, exchangeRate)],
      ['= Resultado Líquido', formatCurrency(netProfit, selectedCurrency)],
    ],
    theme: 'striped',
    headStyles: { fillColor: [34, 197, 94], fontStyle: 'bold' },
    columnStyles: {
      0: { cellWidth: 85 },
      1: { cellWidth: 85, halign: 'right', fontStyle: 'bold' }
    },
    didParseCell: function(data) {
      if (data.row.index === 4) {
        data.cell.styles.fillColor = netProfit >= 0 ? [220, 252, 231] : [254, 226, 226]
      }
    }
  })

  // Distribuição Win/Loss
  doc.setFontSize(16)
  doc.setTextColor(34, 197, 94)
  doc.text('Distribuição de Resultados', 14, doc.lastAutoTable.finalY + 15)
  doc.setTextColor(0, 0, 0)

  const centerX = 105
  const centerY = doc.lastAutoTable.finalY + 50
  const radius = 30

  const total = metrics.wins + metrics.losses
  if (total > 0) {
    const winPercentage = (metrics.wins / total) * 100
    const winAngle = (metrics.wins / total) * 360

    doc.setFillColor(34, 197, 94)
    doc.circle(centerX, centerY, radius, 'F')

    if (metrics.losses > 0) {
      doc.setFillColor(220, 38, 38)
      const points = [[centerX, centerY]]
      
      for (let angle = winAngle; angle <= 360; angle += 5) {
        const rad = (angle * Math.PI) / 180
        const x = centerX + radius * Math.cos(rad)
        const y = centerY + radius * Math.sin(rad)
        points.push([x, y])
      }
      
      points.push([centerX, centerY])
      
      doc.lines(
        points.slice(1).map((point, i) => {
          if (i === 0) return [point[0] - centerX, point[1] - centerY]
          return [point[0] - points[i][0], point[1] - points[i][1]]
        }),
        centerX,
        centerY,
        [1, 1],
        'F'
      )
    }

    doc.setFontSize(12)
    doc.setFillColor(34, 197, 94)
    doc.circle(30, centerY + 40, 3, 'F')
    doc.setTextColor(0, 0, 0)
    doc.text(`Vitórias: ${metrics.wins} (${winPercentage.toFixed(1)}%)`, 40, centerY + 42)

    doc.setFillColor(220, 38, 38)
    doc.circle(30, centerY + 50, 3, 'F')
    doc.text(`Derrotas: ${metrics.losses} (${(100-winPercentage).toFixed(1)}%)`, 40, centerY + 52)
  }

  // ========================================
  // PÁGINA 3: HISTÓRICO DE TRADES
  // ========================================
  doc.addPage()
  doc.setFontSize(18)
  doc.setTextColor(34, 197, 94)
  doc.text('Histórico Completo de Trades', 14, 20)
  doc.setTextColor(0, 0, 0)

  const tradeTableData = trades
    .sort((a, b) => a.date.localeCompare(b.date))
    .map(t => {
      const pnl = parseFloat(t.pnl) || 0
      const commission = parseFloat(t.commission) || 0
      const swap = parseFloat(t.swap) || 0
      const tax = parseFloat(t.taxes?.amount) || 0
      const currency = t.currency || 'BRL'
      
      // Converter para moeda selecionada se necessário
      let displayPnl = pnl
      if (selectedCurrency === 'USD' && currency === 'BRL') {
        displayPnl = pnl / exchangeRate
      } else if (selectedCurrency === 'BRL' && currency === 'USD') {
        displayPnl = pnl * exchangeRate
      }
      
      return [
        t.date,
        t.asset,
        currency,
        MARKET_NAMES[t.market] || t.market || '-',
        formatCurrency(displayPnl, selectedCurrency, true)
      ]
    })

  autoTable(doc, {
    startY: 30,
    head: [['Data', 'Ativo', 'Moeda Orig.', 'Mercado', `P&L (${selectedCurrency})`]],
    body: tradeTableData,
    theme: 'striped',
    headStyles: { fillColor: [34, 197, 94], fontStyle: 'bold', fontSize: 9 },
    bodyStyles: { fontSize: 8 },
    columnStyles: {
      0: { cellWidth: 25 },
      1: { cellWidth: 30 },
      2: { cellWidth: 22, halign: 'center' },
      3: { cellWidth: 30 },
      4: { cellWidth: 35, halign: 'right', fontStyle: 'bold' }
    }
  })

  // Footer
  const pageCount = doc.internal.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.setTextColor(150, 150, 150)
    doc.text(
      `Página ${i} de ${pageCount} • TraderPro © ${new Date().getFullYear()}`,
      105,
      290,
      { align: 'center' }
    )
  }

  doc.save(`traderpro-relatorio-${Date.now()}.pdf`)
  return doc
}

// EXPORTAR PARA EXCEL
export const exportToExcel = (trades, metricsOld, period, selectedCurrency = 'USD', exchangeRate = 5.45) => {
  const wb = XLSX.utils.book_new()
  const metrics = calculateMetricsWithCurrency(trades, exchangeRate)

  const totalPnl = convertValue(metrics.totalPnlUSD, metrics.totalPnlBRL, selectedCurrency, exchangeRate)
  const totalCommission = convertValue(metrics.totalCommissionUSD, metrics.totalCommissionBRL, selectedCurrency, exchangeRate)
  const totalSwap = convertValue(metrics.totalSwapUSD, metrics.totalSwapBRL, selectedCurrency, exchangeRate)
  const totalTax = convertValue(metrics.totalTaxUSD, metrics.totalTaxBRL, selectedCurrency, exchangeRate)
  const netProfit = totalPnl - totalCommission - totalSwap - totalTax

  // ABA 1: Resumo
  const summaryData = [
    ['TraderPro - Relatório de Trading v3.0'],
    ['Gerado em:', new Date().toLocaleString('pt-BR')],
    [`Moeda: ${selectedCurrency}`, `1 USD = R$ ${exchangeRate.toFixed(4)}`],
    [],
    ['RESUMO GERAL'],
    ['Total de Trades', metrics.totalTrades],
    ['Resultado Bruto', totalPnl],
    ['Corretagem', -totalCommission],
    ['Swap', -totalSwap],
    ['Impostos', -totalTax],
    ['Resultado Líquido', netProfit],
    [],
    ['MÉTRICAS'],
    ['Win Rate', `${metrics.winRate.toFixed(2)}%`],
    ['Profit Factor', metrics.profitFactor.toFixed(2)],
    ['Vitórias', metrics.wins],
    ['Derrotas', metrics.losses],
  ]
  const ws1 = XLSX.utils.aoa_to_sheet(summaryData)
  XLSX.utils.book_append_sheet(wb, ws1, 'Resumo')

  // ABA 2: Trades
  const tradesData = [
    ['Data', 'Ativo', 'Moeda Original', 'Mercado', `P&L (${selectedCurrency})`, 'P&L Original', 'Corretagem', 'Impostos']
  ]

  trades.sort((a, b) => a.date.localeCompare(b.date)).forEach(t => {
    const pnl = parseFloat(t.pnl) || 0
    const currency = t.currency || 'BRL'
    
    let displayPnl = pnl
    if (selectedCurrency === 'USD' && currency === 'BRL') {
      displayPnl = pnl / exchangeRate
    } else if (selectedCurrency === 'BRL' && currency === 'USD') {
      displayPnl = pnl * exchangeRate
    }

    tradesData.push([
      t.date,
      t.asset,
      currency,
      MARKET_NAMES[t.market] || t.market || '-',
      displayPnl,
      pnl,
      t.commission || 0,
      t.taxes?.amount || 0
    ])
  })

  const ws2 = XLSX.utils.aoa_to_sheet(tradesData)
  XLSX.utils.book_append_sheet(wb, ws2, 'Trades')

  XLSX.writeFile(wb, `traderpro-relatorio-${Date.now()}.xlsx`)
}

// EXPORTAR PARA CSV
export const exportToCSV = (trades, selectedCurrency = 'USD', exchangeRate = 5.45) => {
  const headers = [
    'Data', 'Ativo', 'Moeda Original', 'Mercado', `P&L (${selectedCurrency})`, 'P&L Original', 'Corretagem', 'Impostos'
  ]

  const rows = trades
    .sort((a, b) => a.date.localeCompare(b.date))
    .map(t => {
      const pnl = parseFloat(t.pnl) || 0
      const currency = t.currency || 'BRL'
      
      let displayPnl = pnl
      if (selectedCurrency === 'USD' && currency === 'BRL') {
        displayPnl = pnl / exchangeRate
      } else if (selectedCurrency === 'BRL' && currency === 'USD') {
        displayPnl = pnl * exchangeRate
      }

      return [
        t.date,
        t.asset,
        currency,
        MARKET_NAMES[t.market] || t.market || '-',
        displayPnl.toFixed(2),
        pnl.toFixed(2),
        (t.commission || 0).toFixed(2),
        (t.taxes?.amount || 0).toFixed(2)
      ]
    })

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell =>
      typeof cell === 'string' && cell.includes(',') ? `"${cell}"` : cell
    ).join(','))
  ].join('\n')

  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `traderpro-relatorio-${Date.now()}.csv`
  link.click()
}
