import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import * as XLSX from 'xlsx'
import { formatCurrency, formatPercent } from './metrics'
import { MARKET_NAMES } from '../constants/markets'

export const exportToPDF = (trades, metrics, period = 'completo') => {
  const doc = new jsPDF()

  // Calcular custos e impostos
  const totalCommission = trades.reduce((sum, t) => sum + (parseFloat(t.commission) || 0), 0)
  const totalSwap = trades.reduce((sum, t) => sum + (parseFloat(t.swap) || 0), 0)
  const totalTax = trades.reduce((sum, t) => sum + (parseFloat(t.taxes?.amount) || 0), 0)
  const totalCosts = totalCommission + totalSwap
  const netProfit = metrics.netProfit - totalCosts - totalTax

  // Calcular médias corretamente
  const avgLoss = metrics.losingTrades > 0 ? metrics.grossLoss / metrics.losingTrades : 0

  // ===== PAGINA 1: CAPA =====
  doc.setFillColor(34, 197, 94)
  doc.rect(0, 0, 210, 60, 'F')

  doc.setTextColor(255, 255, 255)
  doc.setFontSize(28)
  doc.text('TraderPro', 105, 30, { align: 'center' })
  doc.setFontSize(16)
  doc.text('Relatorio de Trading - v3.0', 105, 42, { align: 'center' })

  doc.setTextColor(0, 0, 0)
  doc.setFontSize(12)
  doc.text('Periodo: ' + period, 14, 75)
  doc.text('Gerado em: ' + new Date().toLocaleString('pt-BR'), 14, 82)
  doc.text('Total de Trades: ' + metrics.totalTrades, 14, 89)

  const isProfit = netProfit >= 0
  doc.setFontSize(14)
  doc.text('Resultado Liquido:', 14, 105)
  doc.setTextColor(isProfit ? 34 : 220, isProfit ? 197 : 38, isProfit ? 94 : 38)
  doc.setFontSize(28)
  doc.text(formatCurrency(netProfit), 14, 118)
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

  let cardY = 135
  drawCard(14, cardY, 'Win Rate', formatPercent(metrics.winRate))
  drawCard(110, cardY, 'Profit Factor', metrics.profitFactor.toFixed(2))

  cardY += 27
  drawCard(14, cardY, 'Vitorias', metrics.winningTrades, 1)
  drawCard(110, cardY, 'Derrotas', metrics.losingTrades, 2)

  cardY += 27
  drawCard(14, cardY, 'Maior Ganho', formatCurrency(metrics.maxWin), 1)
  drawCard(110, cardY, 'Maior Perda', formatCurrency(metrics.maxLoss), 2)

  cardY += 27
  drawCard(14, cardY, 'Impostos', formatCurrency(totalTax), 2)
  drawCard(110, cardY, 'Custos Op.', formatCurrency(totalCosts), 2)

  // ===== PAGINA 2: BREAKDOWN FINANCEIRO =====
  doc.addPage()
  doc.setFontSize(18)
  doc.setTextColor(34, 197, 94)
  doc.text('Breakdown Financeiro', 14, 20)
  doc.setTextColor(0, 0, 0)

  autoTable(doc, {
    startY: 30,
    head: [['Descricao', 'Valor']],
    body: [
      ['Resultado Bruto', formatCurrency(metrics.netProfit)],
      ['(-) Corretagem', formatCurrency(totalCommission)],
      ['(-) Swap', formatCurrency(totalSwap)],
      ['(-) Impostos', formatCurrency(totalTax)],
      ['(=) Resultado Liquido', formatCurrency(netProfit)],
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

  // Metricas Detalhadas
  doc.setFontSize(16)
  doc.setTextColor(34, 197, 94)
  const finalY = doc.lastAutoTable.finalY + 15
  doc.text('Metricas Detalhadas', 14, finalY)
  doc.setTextColor(0, 0, 0)

  autoTable(doc, {
    startY: finalY + 5,
    head: [['Metrica', 'Valor']],
    body: [
      ['Total de Trades', String(metrics.totalTrades)],
      ['Win Rate', formatPercent(metrics.winRate)],
      ['Profit Factor', metrics.profitFactor.toFixed(2)],
      ['Trades Vencedores', String(metrics.winningTrades)],
      ['Trades Perdedores', String(metrics.losingTrades)],
      ['Total em Lucros', formatCurrency(metrics.grossProfit)],
      ['Total em Perdas', formatCurrency(metrics.grossLoss)],
      ['Maior Ganho', formatCurrency(metrics.maxWin)],
      ['Maior Perda', formatCurrency(metrics.maxLoss)],
      ['Media de Ganho', formatCurrency(metrics.avgWin)],
      ['Media de Perda', formatCurrency(avgLoss)],
      ['Expectativa', formatCurrency(metrics.expectancy)],
    ],
    theme: 'striped',
    headStyles: { fillColor: [34, 197, 94], fontStyle: 'bold' },
    columnStyles: {
      0: { cellWidth: 85 },
      1: { cellWidth: 85, halign: 'right', fontStyle: 'bold' }
    }
  })

  // ===== PAGINA 3: DESEMPENHO POR MERCADO =====
  doc.addPage()
  doc.setFontSize(18)
  doc.setTextColor(34, 197, 94)
  doc.text('Desempenho por Mercado', 14, 20)
  doc.setTextColor(0, 0, 0)

  // Agrupar por mercado
  const marketBreakdown = {}
  trades.forEach(trade => {
    const market = trade.market || 'forex'
    if (!marketBreakdown[market]) {
      marketBreakdown[market] = {
        trades: 0,
        wins: 0,
        losses: 0,
        totalPnL: 0,
        totalTax: 0,
        totalCosts: 0
      }
    }
    marketBreakdown[market].trades++
    marketBreakdown[market].totalPnL += trade.pnl
    marketBreakdown[market].totalTax += (trade.taxes?.amount || 0)
    marketBreakdown[market].totalCosts += (trade.commission || 0) + (trade.swap || 0)
    if (trade.pnl > 0) marketBreakdown[market].wins++
    else if (trade.pnl < 0) marketBreakdown[market].losses++
  })

  const marketData = Object.entries(marketBreakdown).map(([market, data]) => {
    const winRate = data.trades > 0 ? (data.wins / data.trades) * 100 : 0
    const netResult = data.totalPnL - data.totalCosts - data.totalTax
    return [
      MARKET_NAMES[market] || market,
      String(data.trades),
      formatPercent(winRate),
      formatCurrency(data.totalPnL),
      formatCurrency(data.totalTax),
      formatCurrency(netResult)
    ]
  })

  autoTable(doc, {
    startY: 30,
    head: [['Mercado', 'Trades', 'Win Rate', 'PnL Bruto', 'Impostos', 'Liquido']],
    body: marketData,
    theme: 'striped',
    headStyles: { fillColor: [34, 197, 94], fontStyle: 'bold' },
    columnStyles: {
      0: { cellWidth: 35 },
      1: { cellWidth: 20, halign: 'center' },
      2: { cellWidth: 22, halign: 'right' },
      3: { cellWidth: 28, halign: 'right' },
      4: { cellWidth: 25, halign: 'right' },
      5: { cellWidth: 30, halign: 'right', fontStyle: 'bold' }
    }
  })

  // ===== PAGINA 4: HISTORICO DE TRADES =====
  doc.addPage()
  doc.setFontSize(18)
  doc.setTextColor(34, 197, 94)
  doc.text('Historico Completo de Trades', 14, 20)
  doc.setTextColor(0, 0, 0)

  const tradeTableData = trades
    .sort((a, b) => a.date.localeCompare(b.date))
    .map(t => [
      t.date,
      t.asset,
      MARKET_NAMES[t.market] || t.market || '-',
      t.strategy || '-',
      formatCurrency(t.pnl),
      formatCurrency(t.taxes?.amount || 0),
      formatCurrency(t.pnl - (t.taxes?.amount || 0) - (t.commission || 0) - (t.swap || 0))
    ])

  autoTable(doc, {
    startY: 30,
    head: [['Data', 'Ativo', 'Mercado', 'Estrategia', 'P&L', 'Impostos', 'Liquido']],
    body: tradeTableData,
    theme: 'striped',
    headStyles: { fillColor: [34, 197, 94], fontStyle: 'bold', fontSize: 9 },
    bodyStyles: { fontSize: 8 },
    columnStyles: {
      0: { cellWidth: 20 },
      1: { cellWidth: 20 },
      2: { cellWidth: 24 },
      3: { cellWidth: 24 },
      4: { cellWidth: 23, halign: 'right' },
      5: { cellWidth: 23, halign: 'right' },
      6: { cellWidth: 23, halign: 'right', fontStyle: 'bold' }
    }
  })

  // Footer em todas as páginas
  const pageCount = doc.internal.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.setTextColor(150, 150, 150)
    doc.text(
      'Pagina ' + i + ' de ' + pageCount + ' | TraderPro ' + new Date().getFullYear(),
      105,
      290,
      { align: 'center' }
    )
  }

    // Fazer download
  doc.save(`traderpro-relatorio-${Date.now()}.pdf`)
  return doc
}

// ===== EXPORTAR PARA EXCEL =====
export const exportToExcel = (trades, metrics) => {
  const wb = XLSX.utils.book_new()

  // Calcular custos
  const totalCommission = trades.reduce((sum, t) => sum + (parseFloat(t.commission) || 0), 0)
  const totalSwap = trades.reduce((sum, t) => sum + (parseFloat(t.swap) || 0), 0)
  const totalTax = trades.reduce((sum, t) => sum + (parseFloat(t.taxes?.amount) || 0), 0)
  const netProfit = metrics.netProfit - totalCommission - totalSwap - totalTax

  // ABA 1: Resumo
  const summaryData = [
    ['TraderPro - Relatório de Trading v3.0'],
    ['Gerado em', new Date().toLocaleString('pt-BR')],
    [],
    ['RESUMO GERAL'],
    ['Total de Trades', metrics.totalTrades],
    ['Resultado Bruto', metrics.netProfit],
    ['Corretagem', -totalCommission],
    ['Swap', -totalSwap],
    ['Impostos', -totalTax],
    ['Resultado Líquido', netProfit],
    [],
    ['MÉTRICAS'],
    ['Win Rate', (metrics.winRate / 100).toFixed(4)],
    ['Profit Factor', metrics.profitFactor],
    ['Vitórias', metrics.winningTrades],
    ['Derrotas', metrics.losingTrades],
    ['Maior Ganho', metrics.maxWin],
    ['Maior Perda', metrics.maxLoss],
    ['Média de Ganho', metrics.avgWin],
    ['Expectativa', metrics.expectancy]
  ]
  
  const ws1 = XLSX.utils.aoa_to_sheet(summaryData)
  XLSX.utils.book_append_sheet(wb, ws1, 'Resumo')

  // ABA 2: Por Mercado
  const marketBreakdown = {}
  trades.forEach(trade => {
    const market = trade.market || 'forex'
    if (!marketBreakdown[market]) {
      marketBreakdown[market] = {
        trades: 0, wins: 0, totalPnL: 0, totalTax: 0, totalCosts: 0
      }
    }
    marketBreakdown[market].trades++
    marketBreakdown[market].totalPnL += trade.pnl
    marketBreakdown[market].totalTax += (trade.taxes?.amount || 0)
    marketBreakdown[market].totalCosts += (trade.commission || 0) + (trade.swap || 0)
    if (trade.pnl > 0) marketBreakdown[market].wins++
  })

  const marketData = [
    ['Mercado', 'Trades', 'Win Rate', 'PnL Bruto', 'Impostos', 'Custos', 'Líquido']
  ]
  Object.entries(marketBreakdown).forEach(([market, data]) => {
    const winRate = (data.wins / data.trades) * 100
    const netResult = data.totalPnL - data.totalCosts - data.totalTax
    marketData.push([
      MARKET_NAMES[market] || market,
      data.trades,
      (winRate / 100).toFixed(4),
      data.totalPnL,
      data.totalTax,
      data.totalCosts,
      netResult
    ])
  })

  const ws2 = XLSX.utils.aoa_to_sheet(marketData)
  XLSX.utils.book_append_sheet(wb, ws2, 'Por Mercado')

  // ABA 3: Trades
  const tradesData = [
    ['Data', 'Ativo', 'Mercado', 'Estratégia', 'Qtd', 'Entrada', 'Saída', 'PnL', 'Corretagem', 'Swap', 'Impostos', 'Líquido']
  ]
  
  trades
    .sort((a, b) => a.date.localeCompare(b.date))
    .forEach(t => {
      const netResult = t.pnl - (t.commission || 0) - (t.swap || 0) - (t.taxes?.amount || 0)
      tradesData.push([
        t.date,
        t.asset,
        MARKET_NAMES[t.market] || t.market || '-',
        t.strategy || '-',
        t.quantity || 1,
        t.entryPrice || 0,
        t.exitPrice || 0,
        t.pnl,
        t.commission || 0,
        t.swap || 0,
        t.taxes?.amount || 0,
        netResult
      ])
    })

  const ws3 = XLSX.utils.aoa_to_sheet(tradesData)
  XLSX.utils.book_append_sheet(wb, ws3, 'Trades')

  // Gerar arquivo
  XLSX.writeFile(wb, `traderpro-relatorio-${Date.now()}.xlsx`)
}

// ===== EXPORTAR PARA CSV =====
export const exportToCSV = (trades) => {
  const headers = [
    'Data', 'Ativo', 'Mercado', 'Estratégia', 'Quantidade',
    'Preço Entrada', 'Preço Saída', 'PnL', 'Corretagem', 'Swap',
    'Impostos', 'Taxa Imposto', 'Líquido'
  ]

  const rows = trades
    .sort((a, b) => a.date.localeCompare(b.date))
    .map(t => {
      const netResult = t.pnl - (t.commission || 0) - (t.swap || 0) - (t.taxes?.amount || 0)
      return [
        t.date,
        t.asset,
        MARKET_NAMES[t.market] || t.market || '-',
        t.strategy || '-',
        t.quantity || 1,
        t.entryPrice || 0,
        t.exitPrice || 0,
        t.pnl,
        t.commission || 0,
        t.swap || 0,
        t.taxes?.amount || 0,
        t.taxes?.rate || 0,
        netResult
      ]
    })

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => 
      typeof cell === 'string' && cell.includes(',') ? `"${cell}"` : cell
    ).join(','))
  ].join('\n')

  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `traderpro-relatorio-${Date.now()}.csv`
  link.click()
}



