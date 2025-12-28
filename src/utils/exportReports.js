import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import * as XLSX from 'xlsx'
import { formatCurrency, formatPercent } from './metrics'

export const exportToPDF = (trades, metrics, period = 'completo') => {
  const doc = new jsPDF()
  
  const totalResult = metrics.netProfit || metrics.totalPnL || 0
  
  // ===== PAGINA 1: CAPA =====
  doc.setFillColor(34, 197, 94)
  doc.rect(0, 0, 210, 60, 'F')
  
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(28)
  doc.text('TraderPro', 105, 30, { align: 'center' })
  doc.setFontSize(16)
  doc.text('Relatorio de Trading', 105, 42, { align: 'center' })
  
  doc.setTextColor(0, 0, 0)
  doc.setFontSize(12)
  doc.text('Periodo: ' + period, 14, 75)
  doc.text('Gerado em: ' + new Date().toLocaleString('pt-BR'), 14, 82)
  doc.text('Total de Trades: ' + metrics.totalTrades, 14, 89)
  
  const isProfit = totalResult >= 0
  doc.setFontSize(14)
  doc.text('Resultado Total:', 14, 105)
  doc.setTextColor(isProfit ? 34 : 220, isProfit ? 197 : 38, isProfit ? 94 : 38)
  doc.setFontSize(28)
  doc.text(formatCurrency(totalResult), 14, 118)
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
  drawCard(14, cardY, 'Vitorias', metrics.wins, 1)
  drawCard(110, cardY, 'Derrotas', metrics.losses, 2)
  
  cardY += 27
  drawCard(14, cardY, 'Maior Ganho', formatCurrency(metrics.bestTrade), 1)
  drawCard(110, cardY, 'Maior Perda', formatCurrency(metrics.worstTrade), 2)
  
  cardY += 27
  drawCard(14, cardY, 'Media por Trade', formatCurrency(metrics.avgTrade || metrics.averageWin || 0))
  drawCard(110, cardY, 'Total Lucros', formatCurrency(metrics.totalProfit || 0), 1)
  
  // ===== PAGINA 2: GRAFICO PIZZA + METRICAS =====
  doc.addPage()
  doc.setFontSize(18)
  doc.setTextColor(34, 197, 94)
  doc.text('Distribuicao de Resultados', 14, 20)
  doc.setTextColor(0, 0, 0)
  
  // Grafico de Pizza
  const centerX = 105
  const centerY = 70
  const radius = 35
  
  const total = metrics.wins + metrics.losses
  const winAngle = (metrics.wins / total) * 360
  
  // Fatia de vitorias (verde)
  doc.setFillColor(34, 197, 94)
  doc.circle(centerX, centerY, radius, 'F')
  
  // Fatia de derrotas (vermelho) - sobrepor
  if (metrics.losses > 0) {
    const startAngle = (winAngle * Math.PI) / 180
    doc.setFillColor(220, 38, 38)
    
    // Desenhar setor
    doc.lines([
      [0, 0],
      [radius * Math.cos(startAngle), radius * Math.sin(startAngle)],
    ], centerX, centerY)
    
    const step = 5
    for (let angle = winAngle; angle <= 360; angle += step) {
      const rad = (angle * Math.PI) / 180
      const x = centerX + radius * Math.cos(rad)
      const y = centerY + radius * Math.sin(rad)
      doc.triangle(centerX, centerY, x, y, centerX + radius * Math.cos((angle + step) * Math.PI / 180), centerY + radius * Math.sin((angle + step) * Math.PI / 180), 'F')
    }
  }
  
  // Legendas
  doc.setFontSize(11)
  doc.setFillColor(34, 197, 94)
  doc.circle(40, 125, 3, 'F')
  doc.setTextColor(0, 0, 0)
  doc.text('Vitorias: ' + metrics.wins + ' (' + formatPercent((metrics.wins / total) * 100) + ')', 48, 127)
  
  doc.setFillColor(220, 38, 38)
  doc.circle(40, 135, 3, 'F')
  doc.text('Derrotas: ' + metrics.losses + ' (' + formatPercent((metrics.losses / total) * 100) + ')', 48, 137)
  
  // Tabela de metricas
  doc.setFontSize(16)
  doc.setTextColor(34, 197, 94)
  doc.text('Metricas Detalhadas', 14, 155)
  doc.setTextColor(0, 0, 0)
  
  autoTable(doc, {
    startY: 160,
    head: [['Metrica', 'Valor']],
    body: [
      ['Total de Trades', String(metrics.totalTrades)],
      ['Resultado Liquido', formatCurrency(totalResult)],
      ['Win Rate', formatPercent(metrics.winRate)],
      ['Profit Factor', metrics.profitFactor.toFixed(2)],
      ['Trades Vencedores', String(metrics.wins)],
      ['Trades Perdedores', String(metrics.losses)],
      ['Total em Lucros', formatCurrency(metrics.totalProfit || 0)],
      ['Total em Perdas', formatCurrency(metrics.totalLoss || 0)],
      ['Maior Ganho', formatCurrency(metrics.bestTrade)],
      ['Maior Perda', formatCurrency(metrics.worstTrade)],
      ['Media de Ganho', formatCurrency(metrics.averageWin || 0)],
      ['Media de Perda', formatCurrency(metrics.averageLoss || 0)],
    ],
    theme: 'striped',
    headStyles: { fillColor: [34, 197, 94], fontStyle: 'bold' },
    columnStyles: {
      0: { cellWidth: 90 },
      1: { cellWidth: 90, halign: 'right', fontStyle: 'bold' }
    }
  })
  
  // ===== PAGINA 3: CURVA DE PATRIMONIO =====
  doc.addPage()
  doc.setFontSize(18)
  doc.setTextColor(34, 197, 94)
  doc.text('Curva de Patrimonio', 14, 20)
  doc.setTextColor(0, 0, 0)
  
  // Calcular equity curve
  const sortedTrades = [...trades].sort((a, b) => a.date.localeCompare(b.date))
  let accumulated = 0
  const equityData = sortedTrades.map(t => {
    accumulated += t.pnl
    return accumulated
  })
  
  // Dimensoes do grafico
  const chartX = 20
  const chartY = 40
  const chartWidth = 170
  const chartHeight = 80
  
  // Eixos
  doc.setDrawColor(150, 150, 150)
  doc.line(chartX, chartY, chartX, chartY + chartHeight) // Y
  doc.line(chartX, chartY + chartHeight, chartX + chartWidth, chartY + chartHeight) // X
  
  // Valores min e max
  const maxEquity = Math.max(...equityData, 0)
  const minEquity = Math.min(...equityData, 0)
  const range = maxEquity - minEquity || 1
  
  // Linha zero
  const zeroY = chartY + chartHeight - ((0 - minEquity) / range) * chartHeight
  doc.setDrawColor(200, 200, 200)
  doc.setLineDash([2, 2])
  doc.line(chartX, zeroY, chartX + chartWidth, zeroY)
  doc.setLineDash([])
  
  // Desenhar curva
  doc.setDrawColor(34, 197, 94)
  doc.setLineWidth(1.5)
  
  for (let i = 0; i < equityData.length - 1; i++) {
    const x1 = chartX + (i / (equityData.length - 1)) * chartWidth
    const y1 = chartY + chartHeight - ((equityData[i] - minEquity) / range) * chartHeight
    
    const x2 = chartX + ((i + 1) / (equityData.length - 1)) * chartWidth
    const y2 = chartY + chartHeight - ((equityData[i + 1] - minEquity) / range) * chartHeight
    
    doc.line(x1, y1, x2, y2)
  }
  
  doc.setLineWidth(0.2)
  
  // Labels
  doc.setFontSize(9)
  doc.setTextColor(100, 100, 100)
  doc.text('Inicial', chartX, chartY + chartHeight + 8)
  doc.text('Final', chartX + chartWidth - 10, chartY + chartHeight + 8)
  doc.text(formatCurrency(maxEquity), chartX - 25, chartY + 5)
  doc.text(formatCurrency(minEquity), chartX - 25, chartY + chartHeight + 3)
  
  doc.setFontSize(10)
  doc.setTextColor(0, 0, 0)
  doc.text('Resultado final: ' + formatCurrency(equityData[equityData.length - 1] || 0), chartX, chartY + chartHeight + 20)
  
  // ===== HISTORICO DE TRADES =====
  doc.addPage()
  doc.setFontSize(18)
  doc.setTextColor(34, 197, 94)
  doc.text('Historico Completo de Trades', 14, 20)
  doc.setTextColor(0, 0, 0)
  
  const tradesData = sortedTrades.map(t => [
    t.date,
    t.asset || t.symbol || 'N/A',
    t.strategy || '-',
    formatCurrency(t.pnl),
    formatCurrency(t.commission || 0),
    formatCurrency(t.swap || 0)
  ])
  
  autoTable(doc, {
    startY: 30,
    head: [['Data', 'Ativo', 'Estrategia', 'P&L', 'Comissao', 'Swap']],
    body: tradesData,
    theme: 'striped',
    headStyles: { fillColor: [34, 197, 94], fontStyle: 'bold' },
    styles: { fontSize: 8 },
    columnStyles: {
      0: { cellWidth: 28 },
      1: { cellWidth: 30 },
      2: { cellWidth: 35 },
      3: { cellWidth: 30, halign: 'right', fontStyle: 'bold' },
      4: { cellWidth: 27, halign: 'right' },
      5: { cellWidth: 27, halign: 'right' }
    },
    didParseCell: function(data) {
      if (data.column.index === 3 && data.section === 'body') {
        const value = sortedTrades[data.row.index].pnl
        if (value > 0) {
          data.cell.styles.textColor = [34, 197, 94]
        } else if (value < 0) {
          data.cell.styles.textColor = [220, 38, 38]
        }
      }
    }
  })
  
  // Rodape
  const pageCount = doc.internal.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.setTextColor(150, 150, 150)
    doc.text(
      'Pagina ' + i + ' de ' + pageCount + ' | TraderPro ' + new Date().getFullYear(),
      105,
      285,
      { align: 'center' }
    )
  }
  
  doc.save('traderpro-relatorio-' + Date.now() + '.pdf')
}

export const exportToExcel = (trades, metrics, period = 'completo') => {
  const totalResult = metrics.netProfit || metrics.totalPnL || 0
  
  const wb = XLSX.utils.book_new()
  
  const wsMetrics = XLSX.utils.aoa_to_sheet([
    ['TraderPro - Relatorio de Trading'],
    ['Periodo: ' + period],
    ['Gerado em: ' + new Date().toLocaleDateString('pt-BR')],
    [],
    ['Metrica', 'Valor'],
    ['Total de Trades', metrics.totalTrades],
    ['Resultado Liquido', totalResult],
    ['Win Rate', metrics.winRate.toFixed(2) + '%'],
    ['Profit Factor', metrics.profitFactor.toFixed(2)],
    ['Vitorias', metrics.wins],
    ['Derrotas', metrics.losses],
    ['Total Lucros', metrics.totalProfit || 0],
    ['Total Perdas', metrics.totalLoss || 0],
    ['Maior Ganho', metrics.bestTrade],
    ['Maior Perda', metrics.worstTrade],
  ])
  
  const wsTrades = XLSX.utils.aoa_to_sheet([
    ['Data', 'Ativo', 'Estrategia', 'P&L', 'Comissao', 'Swap', 'Notas'],
    ...trades.map(t => [
      t.date,
      t.asset || t.symbol || 'N/A',
      t.strategy || '-',
      t.pnl,
      t.commission || 0,
      t.swap || 0,
      t.notes || ''
    ])
  ])
  
  XLSX.utils.book_append_sheet(wb, wsMetrics, 'Resumo')
  XLSX.utils.book_append_sheet(wb, wsTrades, 'Trades')
  XLSX.writeFile(wb, 'traderpro-relatorio-' + Date.now() + '.xlsx')
}

export const exportToCSV = (trades) => {
  const csv = [
    'Data,Ativo,Estrategia,P&L,Comissao,Swap,Notas',
    ...trades.map(t => 
      t.date + ',' + (t.asset || 'N/A') + ',' + (t.strategy || '-') + ',' + t.pnl + ',' + (t.commission || 0) + ',' + (t.swap || 0) + ',"' + (t.notes || '').replace(/"/g, '""') + '"'
    )
  ].join('\n')
  
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = 'traderpro-trades-' + Date.now() + '.csv'
  link.click()
}
