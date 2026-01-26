import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import * as XLSX from 'xlsx'
import { MARKET_NAMES } from '../constants/markets'

const formatPercent = (value) => {
  if (typeof value !== 'number' || isNaN(value)) return '0%'
  return `${(value * 100).toFixed(2)}%`
}

const convertValue = (usdValue, brlValue, selectedCurrency, exchangeRate) => {
  const usd = parseFloat(usdValue || 0)
  const brl = parseFloat(brlValue || 0)
  
  if (selectedCurrency === 'USD') {
    return usd + (brl / exchangeRate)
  } else {
    return (usd * exchangeRate) + brl
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

export const exportToPDF = (trades, metrics, period = 'completo', selectedCurrency = 'USD', exchangeRate = 5.45) => {
  const doc = new jsPDF()
  
  if (!metrics || metrics.totalPnlUSD === undefined) {
    console.error('Métricas inválidas recebidas no exportToPDF')
    return
  }

  const totalPnl = convertValue(metrics.totalPnlUSD, metrics.totalPnlBRL, selectedCurrency, exchangeRate)
  const totalCommission = convertValue(metrics.totalCommissionUSD, metrics.totalCommissionBRL, selectedCurrency, exchangeRate)
  const totalSwap = convertValue(metrics.totalSwapUSD, metrics.totalSwapBRL, selectedCurrency, exchangeRate)
  const totalTax = convertValue(metrics.totalTaxUSD, metrics.totalTaxBRL, selectedCurrency, exchangeRate)
  const totalCosts = totalCommission + totalSwap
  const netProfit = totalPnl + totalCosts - totalTax
  const maxWin = convertValue(metrics.maxWinUSD, metrics.maxWinBRL, selectedCurrency, exchangeRate)
  const maxLoss = convertValue(metrics.maxLossUSD, metrics.maxLossBRL, selectedCurrency, exchangeRate)

  // ANÁLISES ADICIONAIS
  const tradesWithPnl = trades.map(t => ({
    ...t,
    pnlConverted: t.currency === selectedCurrency 
      ? parseFloat(t.pnl || 0)
      : selectedCurrency === 'USD' 
        ? parseFloat(t.pnl || 0) / exchangeRate
        : parseFloat(t.pnl || 0) * exchangeRate
  }))

  const top5Best = [...tradesWithPnl]
    .sort((a, b) => b.pnlConverted - a.pnlConverted)
    .slice(0, 5)

  const top5Worst = [...tradesWithPnl]
    .filter(t => t.pnlConverted < 0)
    .sort((a, b) => a.pnlConverted - b.pnlConverted)
    .slice(0, 5)

  const byAsset = {}
  tradesWithPnl.forEach(t => {
    const asset = t.asset || 'Desconhecido'
    if (!byAsset[asset]) {
      byAsset[asset] = { trades: 0, pnl: 0, wins: 0, losses: 0 }
    }
    byAsset[asset].trades++
    byAsset[asset].pnl += t.pnlConverted
    if (t.pnlConverted > 0) byAsset[asset].wins++
    else if (t.pnlConverted < 0) byAsset[asset].losses++
  })

  const assetPerformance = Object.entries(byAsset)
    .map(([asset, data]) => ({
      asset,
      ...data,
      winRate: data.trades > 0 ? (data.wins / data.trades) * 100 : 0
    }))
    .sort((a, b) => b.pnl - a.pnl)
    .slice(0, 10)

  const byWeekday = { 0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [] }
  const weekdayNames = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']
  
  tradesWithPnl.forEach(t => {
    const date = new Date(t.date + 'T00:00:00')
    const day = date.getDay()
    byWeekday[day].push(t.pnlConverted)
  })

  const weekdayStats = Object.entries(byWeekday).map(([day, pnls]) => ({
    day: weekdayNames[day],
    trades: pnls.length,
    totalPnl: pnls.reduce((a, b) => a + b, 0),
    avgPnl: pnls.length > 0 ? pnls.reduce((a, b) => a + b, 0) / pnls.length : 0,
    wins: pnls.filter(p => p > 0).length,
    winRate: pnls.length > 0 ? (pnls.filter(p => p > 0).length / pnls.length) * 100 : 0
  }))

  let accumulated = 0
  const equityCurve = tradesWithPnl
    .sort((a, b) => a.date.localeCompare(b.date))
    .map(t => {
      accumulated += t.pnlConverted
      return { date: t.date, equity: accumulated }
    })

  // ========================================
  // PÁGINA 1: CAPA
  // ========================================
  doc.setFillColor(15, 23, 42)
  doc.rect(0, 0, 210, 70, 'F')

  doc.setTextColor(34, 197, 94)
  doc.setFontSize(36)
  doc.setFont('helvetica', 'bold')
  doc.text('TraderPro', 105, 30, { align: 'center' })
  
  doc.setTextColor(226, 232, 240)
  doc.setFontSize(14)
  doc.setFont('helvetica', 'normal')
  doc.text('Relatório Profissional de Trading - v3.0', 105, 42, { align: 'center' })
  
  doc.setFontSize(10)
  doc.setTextColor(148, 163, 184)
  doc.text('Análise completa de performance e métricas avançadas', 105, 50, { align: 'center' })

  doc.setFillColor(34, 197, 94)
  doc.roundedRect(40, 60, 130, 12, 2, 2, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.text(`PERIODO: ${period}`, 105, 67, { align: 'center' })

  doc.setTextColor(0, 0, 0)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.text('Gerado em: ' + new Date().toLocaleString('pt-BR', { 
    dateStyle: 'short', 
    timeStyle: 'short' 
  }), 14, 85)
  doc.text(`Total de Trades: ${metrics.totalTrades || trades.length}`, 14, 92)
  doc.text(`Moeda: ${selectedCurrency}`, 14, 99)
  doc.setFontSize(8)
  doc.setTextColor(100, 100, 100)
  doc.text(`Taxa de câmbio: 1 USD = R$ ${exchangeRate.toFixed(4)}`, 14, 105)

  const isProfit = netProfit >= 0
  doc.setDrawColor(15, 23, 42)
  doc.setLineWidth(0.5)
  doc.setFillColor(isProfit ? 220 : 254, isProfit ? 252 : 226, isProfit ? 231 : 226)
  doc.roundedRect(14, 115, 182, 35, 3, 3, 'FD')

  doc.setFontSize(11)
  doc.setTextColor(100, 100, 100)
  doc.setFont('helvetica', 'bold')
  doc.text('RESULTADO LIQUIDO NO PERIODO', 105, 125, { align: 'center' })
  
  doc.setTextColor(isProfit ? 22 : 185, isProfit ? 163 : 28, isProfit ? 74 : 28)
  doc.setFontSize(32)
  doc.setFont('helvetica', 'bold')
  doc.text(formatCurrency(netProfit, selectedCurrency), 105, 140, { align: 'center' })
  
  doc.setFontSize(9)
  doc.setTextColor(120, 120, 120)
  doc.setFont('helvetica', 'normal')
  const equivalent = selectedCurrency === 'USD' 
    ? `~ R$ ${(netProfit * exchangeRate).toLocaleString('pt-BR', {minimumFractionDigits: 2})}`
    : `~ $ ${(netProfit / exchangeRate).toLocaleString('en-US', {minimumFractionDigits: 2})}`
  doc.text(equivalent, 105, 147, { align: 'center' })

  const drawModernCard = (x, y, label, value, colorType = 'neutral') => {
    const colors = {
      win: { bg: [220, 252, 231], border: [34, 197, 94], text: [22, 163, 74] },
      loss: { bg: [254, 226, 226], border: [220, 38, 38], text: [185, 28, 28] },
      neutral: { bg: [248, 250, 252], border: [203, 213, 225], text: [51, 65, 85] },
      info: { bg: [219, 234, 254], border: [59, 130, 246], text: [37, 99, 235] }
    }
    
    const color = colors[colorType]
    
    doc.setFillColor(...color.bg)
    doc.setDrawColor(...color.border)
    doc.setLineWidth(0.3)
    doc.roundedRect(x, y, 88, 20, 2, 2, 'FD')

    doc.setFontSize(8)
    doc.setTextColor(100, 100, 100)
    doc.setFont('helvetica', 'normal')
    doc.text(label, x + 5, y + 7)

    doc.setFontSize(14)
    doc.setTextColor(...color.text)
    doc.setFont('helvetica', 'bold')
    doc.text(String(value), x + 5, y + 15)
  }

  let cardY = 160
  drawModernCard(14, cardY, 'Win Rate', `${(metrics.winRate || 0).toFixed(1)}%`, 'info')
  drawModernCard(108, cardY, 'Profit Factor', (metrics.profitFactor || 0).toFixed(2), 'info')

  cardY += 25
  drawModernCard(14, cardY, 'Vitorias', `${metrics.wins || 0}`, 'win')
  drawModernCard(108, cardY, 'Derrotas', `${metrics.losses || 0}`, 'loss')

  cardY += 25
  drawModernCard(14, cardY, 'Maior Ganho', formatCurrency(maxWin, selectedCurrency), 'win')
  drawModernCard(108, cardY, 'Maior Perda', formatCurrency(Math.abs(maxLoss), selectedCurrency), 'loss')

  cardY += 25
  drawModernCard(14, cardY, 'Custos Totais', formatCurrency(Math.abs(totalCosts), selectedCurrency), 'neutral')
  drawModernCard(108, cardY, 'Impostos', formatCurrency(Math.abs(totalTax), selectedCurrency), 'neutral')

  // ========================================
// PÁGINA 2: BREAKDOWN
// ========================================
doc.addPage()
doc.setFillColor(15, 23, 42)
doc.rect(0, 0, 210, 25, 'F')
doc.setTextColor(255, 255, 255)
doc.setFontSize(16)
doc.setFont('helvetica', 'bold')
doc.text('BREAKDOWN FINANCEIRO DETALHADO', 14, 15)

autoTable(doc, {
  startY: 35,
  head: [['Descricao', 'Valor']],
  body: [
    ['Resultado Bruto', formatWithEquivalent(metrics.totalPnlUSD, metrics.totalPnlBRL, selectedCurrency, exchangeRate)],
    ['(-) Corretagem', formatWithEquivalent(Math.abs(metrics.totalCommissionUSD), Math.abs(metrics.totalCommissionBRL), selectedCurrency, exchangeRate)],
    ['(-) Swap/Juros', formatWithEquivalent(Math.abs(metrics.totalSwapUSD), Math.abs(metrics.totalSwapBRL), selectedCurrency, exchangeRate)],
    ['(-) Impostos', formatWithEquivalent(Math.abs(metrics.totalTaxUSD), Math.abs(metrics.totalTaxBRL), selectedCurrency, exchangeRate)],
    ['(=) Resultado Liquido', formatCurrency(netProfit, selectedCurrency)],
  ],
  theme: 'plain',
  headStyles: { 
    fillColor: [34, 197, 94], 
    textColor: [255, 255, 255],
    fontStyle: 'bold',
    fontSize: 11
  },
  bodyStyles: {
    fontSize: 10,
    textColor: [51, 65, 85]
  },
  columnStyles: {
    0: { cellWidth: 90, fontStyle: 'bold' },
    1: { cellWidth: 90, halign: 'right', fontStyle: 'bold' }
  },
  didParseCell: function(data) {
    if (data.row.index === 4) {
      data.cell.styles.fillColor = netProfit >= 0 ? [220, 252, 231] : [254, 226, 226]
      data.cell.styles.textColor = netProfit >= 0 ? [22, 163, 74] : [185, 28, 28]
      data.cell.styles.fontSize = 12
    }
  }
})

// ========================================
// GRÁFICO DE PIZZA CORRIGIDO
// ========================================
const distY = doc.lastAutoTable.finalY + 20
doc.setFontSize(14)
doc.setTextColor(15, 23, 42)
doc.setFont('helvetica', 'bold')
doc.text('DISTRIBUICAO DE RESULTADOS', 14, distY)

const centerX = 50
const centerY = distY + 35
const radius = 25

const total = (metrics.wins || 0) + (metrics.losses || 0)
if (total > 0) {
  const winPercentage = ((metrics.wins || 0) / total) * 100
  const lossPercentage = 100 - winPercentage
  
  const winAngleDegrees = (winPercentage / 100) * 360
  
  doc.setFillColor(220, 38, 38)
  doc.circle(centerX, centerY, radius, 'F')
  
  if (winPercentage > 0) {
    doc.setFillColor(34, 197, 94)
    
    const points = []
    const startAngle = -90
    const endAngle = startAngle + winAngleDegrees
    
    points.push([centerX, centerY])
    
    for (let angle = startAngle; angle <= endAngle; angle += 2) {
      const rad = (angle * Math.PI) / 180
      const x = centerX + radius * Math.cos(rad)
      const y = centerY + radius * Math.sin(rad)
      points.push([x, y])
    }
    
    points.push([centerX, centerY])
    
    if (points.length > 2) {
      doc.triangle(
        points[0][0], points[0][1],
        points[1][0], points[1][1],
        points[2][0], points[2][1],
        'F'
      )
      
      if (points.length > 3) {
        for (let i = 0; i < points.length - 2; i++) {
          const p1 = points[0]
          const p2 = points[i + 1]
          const p3 = points[i + 2]
          
          doc.setFillColor(34, 197, 94)
          doc.triangle(p1[0], p1[1], p2[0], p2[1], p3[0], p3[1], 'F')
        }
      }
    }
  }

  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  
  doc.setFillColor(34, 197, 94)
  doc.circle(90, centerY - 10, 3, 'F')
  doc.setTextColor(22, 163, 74)
  doc.text(`Vitorias: ${metrics.wins || 0} (${winPercentage.toFixed(1)}%)`, 100, centerY - 8)

  doc.setFillColor(220, 38, 38)
  doc.circle(90, centerY + 5, 3, 'F')
  doc.setTextColor(185, 28, 28)
  doc.text(`Derrotas: ${metrics.losses || 0} (${lossPercentage.toFixed(1)}%)`, 100, centerY + 7)
}

// ========================================
// CURVA DE CAPITAL (COM ESPAÇAMENTO CORRETO)
// ========================================
const equityY = centerY + radius + 20  // ✅ CORREÇÃO: usa centerY + radius + margem
doc.setFontSize(14)
doc.setTextColor(15, 23, 42)
doc.setFont('helvetica', 'bold')
doc.text('CURVA DE CAPITAL', 14, equityY)

const chartX = 14
const chartY = equityY + 10
const chartWidth = 180
const chartHeight = 50

doc.setFillColor(248, 250, 252)
doc.rect(chartX, chartY, chartWidth, chartHeight, 'F')

doc.setDrawColor(203, 213, 225)
doc.setLineWidth(0.3)
const zeroY = chartY + chartHeight / 2
doc.line(chartX, zeroY, chartX + chartWidth, zeroY)

const equityValues = equityCurve.map(e => e.equity)
const maxEquity = Math.max(...equityValues, 0)
const minEquity = Math.min(...equityValues, 0)
const range = maxEquity - minEquity || 1

if (equityCurve.length > 1) {
  doc.setLineWidth(1)
  
  for (let i = 0; i < equityCurve.length - 1; i++) {
    const x1 = chartX + (i / (equityCurve.length - 1)) * chartWidth
    const y1 = chartY + chartHeight - ((equityCurve[i].equity - minEquity) / range) * chartHeight
    
    const x2 = chartX + ((i + 1) / (equityCurve.length - 1)) * chartWidth
    const y2 = chartY + chartHeight - ((equityCurve[i + 1].equity - minEquity) / range) * chartHeight
    
    if (equityCurve[i + 1].equity >= 0) {
      doc.setDrawColor(34, 197, 94)
    } else {
      doc.setDrawColor(220, 38, 38)
    }
    
    doc.line(x1, y1, x2, y2)
  }
}

doc.setFontSize(7)
doc.setTextColor(100, 116, 139)
doc.setFont('helvetica', 'normal')
doc.text(formatCurrency(maxEquity, selectedCurrency), chartX - 2, chartY + 3, { align: 'right' })
doc.text(formatCurrency(0, selectedCurrency), chartX - 2, zeroY + 2, { align: 'right' })
doc.text(formatCurrency(minEquity, selectedCurrency), chartX - 2, chartY + chartHeight, { align: 'right' })

doc.text('Inicio', chartX, chartY + chartHeight + 5)
doc.text('Fim', chartX + chartWidth, chartY + chartHeight + 5, { align: 'right' })

doc.setDrawColor(203, 213, 225)
doc.setLineWidth(0.5)
doc.rect(chartX, chartY, chartWidth, chartHeight)



  // ========================================
  // PÁGINA 3: ANÁLISES AVANÇADAS
  // ========================================
  doc.addPage()
  doc.setFillColor(15, 23, 42)
  doc.rect(0, 0, 210, 25, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.text('ANALISES AVANCADAS', 14, 15)

  let currentY = 35

  doc.setFontSize(12)
  doc.setTextColor(22, 163, 74)
  doc.setFont('helvetica', 'bold')
  doc.text('TOP 5 MELHORES TRADES', 14, currentY)

  autoTable(doc, {
    startY: currentY + 5,
    head: [['Data', 'Ativo', `P&L (${selectedCurrency})`]],
    body: top5Best.map(t => [
      t.date,
      t.asset,
      formatCurrency(t.pnlConverted, selectedCurrency)
    ]),
    theme: 'plain',
    headStyles: { 
      fillColor: [220, 252, 231], 
      textColor: [22, 163, 74],
      fontStyle: 'bold',
      fontSize: 9
    },
    bodyStyles: { fontSize: 9, textColor: [51, 65, 85] },
    columnStyles: {
      0: { cellWidth: 35 },
      1: { cellWidth: 40 },
      2: { cellWidth: 45, halign: 'right', fontStyle: 'bold', textColor: [22, 163, 74] }
    }
  })

  currentY = doc.lastAutoTable.finalY + 15

  doc.setFontSize(12)
  doc.setTextColor(185, 28, 28)
  doc.setFont('helvetica', 'bold')
  doc.text('TOP 5 PIORES TRADES', 14, currentY)

  if (top5Worst.length > 0) {
    autoTable(doc, {
      startY: currentY + 5,
      head: [['Data', 'Ativo', `P&L (${selectedCurrency})`]],
      body: top5Worst.map(t => [
        t.date,
        t.asset,
        formatCurrency(t.pnlConverted, selectedCurrency)
      ]),
      theme: 'plain',
      headStyles: { 
        fillColor: [254, 226, 226], 
        textColor: [185, 28, 28],
        fontStyle: 'bold',
        fontSize: 9
      },
      bodyStyles: { fontSize: 9, textColor: [51, 65, 85] },
      columnStyles: {
        0: { cellWidth: 35 },
        1: { cellWidth: 40 },
        2: { cellWidth: 45, halign: 'right', fontStyle: 'bold', textColor: [185, 28, 28] }
      }
    })
  }

  // ========================================
  // PÁGINA 4: PERFORMANCE
  // ========================================
  doc.addPage()
  doc.setFillColor(15, 23, 42)
  doc.rect(0, 0, 210, 25, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.text('PERFORMANCE DETALHADA', 14, 15)

  currentY = 35

  doc.setFontSize(12)
  doc.setTextColor(15, 23, 42)
  doc.text('TOP 10 ATIVOS', 14, currentY)

  autoTable(doc, {
    startY: currentY + 5,
    head: [['Ativo', 'Trades', 'Win Rate', `P&L (${selectedCurrency})`]],
    body: assetPerformance.map(a => [
      a.asset,
      a.trades.toString(),
      `${a.winRate.toFixed(1)}%`,
      formatCurrency(a.pnl, selectedCurrency)
    ]),
    theme: 'striped',
    headStyles: { 
      fillColor: [34, 197, 94],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 9
    },
    bodyStyles: { fontSize: 9 },
    columnStyles: {
      0: { cellWidth: 45, fontStyle: 'bold' },
      1: { cellWidth: 25, halign: 'center' },
      2: { cellWidth: 30, halign: 'center' },
      3: { cellWidth: 40, halign: 'right', fontStyle: 'bold' }
    },
    didParseCell: function(data) {
      if (data.column.index === 3 && data.row.section === 'body') {
        const pnl = assetPerformance[data.row.index].pnl
        data.cell.styles.textColor = pnl >= 0 ? [22, 163, 74] : [185, 28, 28]
      }
    }
  })

  currentY = doc.lastAutoTable.finalY + 15

  doc.setFontSize(12)
  doc.setTextColor(15, 23, 42)
  doc.text('PERFORMANCE POR DIA DA SEMANA', 14, currentY)

  autoTable(doc, {
    startY: currentY + 5,
    head: [['Dia', 'Trades', 'Win Rate', `P&L Medio (${selectedCurrency})`]],
    body: weekdayStats
      .filter(w => w.trades > 0)
      .map(w => [
        w.day,
        w.trades.toString(),
        `${w.winRate.toFixed(1)}%`,
        formatCurrency(w.avgPnl, selectedCurrency)
      ]),
    theme: 'striped',
    headStyles: { 
      fillColor: [59, 130, 246],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 9
    },
    bodyStyles: { fontSize: 9 },
    columnStyles: {
      0: { cellWidth: 35, fontStyle: 'bold' },
      1: { cellWidth: 25, halign: 'center' },
      2: { cellWidth: 30, halign: 'center' },
      3: { cellWidth: 50, halign: 'right', fontStyle: 'bold' }
    },
    didParseCell: function(data) {
      if (data.column.index === 3 && data.row.section === 'body') {
        const avgPnl = weekdayStats.filter(w => w.trades > 0)[data.row.index].avgPnl
        data.cell.styles.textColor = avgPnl >= 0 ? [22, 163, 74] : [185, 28, 28]
      }
    }
  })

  // ========================================
  // PÁGINA 5+: HISTÓRICO
  // ========================================
  doc.addPage()
  doc.setFillColor(15, 23, 42)
  doc.rect(0, 0, 210, 25, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.text('HISTORICO COMPLETO DE TRADES', 14, 15)

  const tradeTableData = equityCurve.map((t, idx) => {
    const trade = tradesWithPnl[idx]
    return [
      trade.date,
      trade.asset,
      trade.currency,
      MARKET_NAMES[trade.market] || trade.market || '-',
      formatCurrency(trade.pnlConverted, selectedCurrency, true),
      formatCurrency(t.equity, selectedCurrency, true)
    ]
  })

  autoTable(doc, {
    startY: 35,
    head: [['Data', 'Ativo', 'Moeda', 'Mercado', `P&L (${selectedCurrency})`, 'Resultado Acum.']],
    body: tradeTableData,
    theme: 'striped',
    headStyles: { 
      fillColor: [34, 197, 94], 
      fontStyle: 'bold', 
      fontSize: 8,
      textColor: [255, 255, 255]
    },
    bodyStyles: { fontSize: 7 },
    columnStyles: {
      0: { cellWidth: 24 },
      1: { cellWidth: 28 },
      2: { cellWidth: 18, halign: 'center' },
      3: { cellWidth: 25 },
      4: { cellWidth: 32, halign: 'right', fontStyle: 'bold' },
      5: { cellWidth: 33, halign: 'right', fontStyle: 'bold' }
    },
    didParseCell: function(data) {
      if ((data.column.index === 4 || data.column.index === 5) && data.row.section === 'body') {
        const idx = data.row.index
        const pnl = data.column.index === 4 
          ? tradesWithPnl[idx].pnlConverted 
          : equityCurve[idx].equity
        data.cell.styles.textColor = pnl >= 0 ? [22, 163, 74] : [185, 28, 28]
      }
    }
  })

  // Footer
  const pageCount = doc.internal.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFillColor(248, 250, 252)
    doc.rect(0, 287, 210, 10, 'F')
    doc.setFontSize(7)
    doc.setTextColor(100, 116, 139)
    doc.setFont('helvetica', 'normal')
    doc.text(
      `Pagina ${i} de ${pageCount} • TraderPro © ${new Date().getFullYear()} • Relatorio gerado automaticamente`,
      105,
      292,
      { align: 'center' }
    )
  }

  doc.save(`traderpro-relatorio-${Date.now()}.pdf`)
  return doc
}

// EXPORTAR PARA EXCEL
export const exportToExcel = (trades, metrics, period, selectedCurrency = 'USD', exchangeRate = 5.45) => {
  const wb = XLSX.utils.book_new()

  const totalPnl = convertValue(metrics.totalPnlUSD, metrics.totalPnlBRL, selectedCurrency, exchangeRate)
  const totalCommission = convertValue(metrics.totalCommissionUSD, metrics.totalCommissionBRL, selectedCurrency, exchangeRate)
  const totalSwap = convertValue(metrics.totalSwapUSD, metrics.totalSwapBRL, selectedCurrency, exchangeRate)
  const totalTax = convertValue(metrics.totalTaxUSD, metrics.totalTaxBRL, selectedCurrency, exchangeRate)
  const totalCosts = totalCommission + totalSwap
  const netProfit = totalPnl + totalCosts - totalTax

  const summaryData = [
    ['TraderPro - Relatorio de Trading'],
    ['Gerado em:', new Date().toLocaleString('pt-BR')],
    [`Moeda: ${selectedCurrency}`, `1 USD = R$ ${exchangeRate.toFixed(4)}`],
    [],
    ['RESUMO GERAL'],
    ['Total de Trades', metrics.totalTrades || trades.length],
    ['Resultado Bruto', totalPnl],
    ['Corretagem', totalCommission],
    ['Swap', totalSwap],
    ['Impostos', -Math.abs(totalTax)],
    ['Resultado Liquido', netProfit],
    [],
    ['METRICAS'],
    ['Win Rate', `${(metrics.winRate || 0).toFixed(2)}%`],
    ['Profit Factor', (metrics.profitFactor || 0).toFixed(2)],
    ['Vitorias', metrics.wins || 0],
    ['Derrotas', metrics.losses || 0],
  ]
  const ws1 = XLSX.utils.aoa_to_sheet(summaryData)
  XLSX.utils.book_append_sheet(wb, ws1, 'Resumo')

  const tradesData = [
    ['Data', 'Ativo', 'Moeda Original', 'Mercado', `P&L (${selectedCurrency})`, 'P&L Original', 'Corretagem', 'Swap', 'Impostos']
  ]

  trades.sort((a, b) => a.date.localeCompare(b.date)).forEach(t => {
    const pnl = parseFloat(t.pnl) || 0
    const currency = t.currency || 'USD'
    
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
      t.swap || 0,
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
    'Data', 'Ativo', 'Moeda Original', 'Mercado', `P&L (${selectedCurrency})`, 'P&L Original', 'Corretagem', 'Swap', 'Impostos'
  ]

  const rows = trades
    .sort((a, b) => a.date.localeCompare(b.date))
    .map(t => {
      const pnl = parseFloat(t.pnl) || 0
      const currency = t.currency || 'USD'
      
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
        (t.swap || 0).toFixed(2),
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
  link.link.download = `traderpro-relatorio-${Date.now()}.csv`
  link.click()
}
