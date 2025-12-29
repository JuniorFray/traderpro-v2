import { Button } from "../ui"
import { exportToPDF, exportToExcel, exportToCSV } from "../../utils/exportReports"
import { calculateMetrics } from "../../utils/metrics"
import { useAuth } from "../../features/auth/AuthContext"

export const ExportButtons = ({ trades, filteredTrades = null }) => {
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

    const metrics = calculateMetrics(tradesToExport)
    exportToPDF(tradesToExport, metrics, getPeriodLabel())
  }

  const handleExportExcel = () => {
    if (tradesToExport.length === 0) {
      alert("Não há trades para exportar")
      return
    }

    const metrics = calculateMetrics(tradesToExport)
    exportToExcel(tradesToExport, metrics, getPeriodLabel())
  }

  const handleExportCSV = () => {
    if (tradesToExport.length === 0) {
      alert("Não há trades para exportar")
      return
    }

    exportToCSV(tradesToExport)
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
