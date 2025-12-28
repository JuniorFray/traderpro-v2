import { Button } from "../ui"
import { exportToPDF, exportToExcel, exportToCSV } from "../../utils/exportReports"
import { calculateMetrics } from "../../utils/metrics"

export const ExportButtons = ({ trades, filteredTrades = null }) => {
  const tradesToExport = filteredTrades || trades
  
  const handleExportPDF = () => {
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
      <Button 
        onClick={handleExportPDF}
        variant="outline"
        className="flex items-center gap-2"
      >
        📄 Exportar PDF
      </Button>
      
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
