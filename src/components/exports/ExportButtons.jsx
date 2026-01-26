import { Button } from "../ui"
import { exportToPDF, exportToExcel, exportToCSV } from "../../utils/exportReports"
import { calculateMetrics } from "../../utils/metrics"
import { useAuth } from "../../features/auth/AuthContext"

export const ExportButtons = ({ 
  trades, 
  filteredTrades = null,
  metrics = null, // ✅ NOVO - Receber metrics já calculados da página Reports
  selectedCurrency = 'BRL',
  exchangeRate = 5.45
}) => {
  const { isPro } = useAuth()
  const tradesToExport = filteredTrades || trades

  const handleExportPDF = () => {
    if (!isPro) {
      alert("⚠️ Recurso PRO\n\nA exportação em PDF está disponível apenas para usuários PRO.\n\nAtualize seu plano para ter acesso a relatórios profissionais em PDF!")
      return
    }

    if (tradesToExport.length === 0) {
      alert("Não há trades para exportar")
      return
    }

    // ✅ Usar metrics recebidos ou calcular se não tiver
    const metricsForPDF = metrics || calculateMetrics(tradesToExport)
    
    // ✅ Adicionar totalTrades se não existir
    const enrichedMetrics = {
      ...metricsForPDF,
      totalTrades: tradesToExport.length
    }

    exportToPDF(tradesToExport, enrichedMetrics, getPeriodLabel(), selectedCurrency, exchangeRate)
  }

  const handleExportExcel = () => {
    if (tradesToExport.length === 0) {
      alert("Não há trades para exportar")
      return
    }

    const metricsForExcel = metrics || calculateMetrics(tradesToExport)
    
    const enrichedMetrics = {
      ...metricsForExcel,
      totalTrades: tradesToExport.length
    }

    exportToExcel(tradesToExport, enrichedMetrics, getPeriodLabel(), selectedCurrency, exchangeRate)
  }

  const handleExportCSV = () => {
    if (tradesToExport.length === 0) {
      alert("Não há trades para exportar")
      return
    }

    exportToCSV(tradesToExport, selectedCurrency, exchangeRate)
  }

  const getPeriodLabel = () => {
    if (tradesToExport.length === 0) return "Sem dados"

    const dates = tradesToExport.map(t => t.date).sort()
    const start = dates[0]
    const end = dates[dates.length - 1]

    if (start === end) return start
    return `${start} até ${end}`
  }

  return (
    <div className="flex flex-wrap gap-3">
      <div className="relative">
        <Button
          onClick={handleExportPDF}
          variant="outline"
          className={`flex items-center gap-2 ${!isPro ? 'opacity-75' : ''}`}
        >
          📄 Exportar PDF {!isPro && '👑'}
        </Button>
        {!isPro && (
          <span className="absolute -top-2 -right-2 bg-yellow-500 text-xs text-black font-bold px-2 py-0.5 rounded-full">
            PRO
          </span>
        )}
      </div>

      <Button
        onClick={handleExportExcel}
        variant="outline"
        className="flex items-center gap-2"
      >
        📊 Exportar Excel
      </Button>

      <Button
        onClick={handleExportCSV}
        variant="outline"
        className="flex items-center gap-2"
      >
        📋 Exportar CSV
      </Button>
    </div>
  )
}
