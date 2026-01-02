import { useState } from "react"
import { Card, Button } from "../ui"

export const TradeFilters = ({ onFilterChange }) => {
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    symbol: "",
    strategy: "",
    result: "all" // all, win, loss
  })

  const handleChange = (field, value) => {
    const newFilters = { ...filters, [field]: value }
    setFilters(newFilters)
    onFilterChange(newFilters)
  }

  const handleReset = () => {
    const resetFilters = {
      startDate: "",
      endDate: "",
      symbol: "",
      strategy: "",
      result: "all"
    }
    setFilters(resetFilters)
    onFilterChange(resetFilters)
  }

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-white">🔍 Filtros</h3>
        <button
          onClick={handleReset}
          className="text-sm text-primary hover:text-primary/80"
        >
          Limpar Filtros
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div>
          <label className="block text-sm font-medium text-zinc-400 mb-2">
            Data Início
          </label>
          <input
            type="date"
            value={filters.startDate}
            onChange={(e) => handleChange("startDate", e.target.value)}
            className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm focus:outline-none focus:border-primary"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-400 mb-2">
            Data Fim
          </label>
          <input
            type="date"
            value={filters.endDate}
            onChange={(e) => handleChange("endDate", e.target.value)}
            className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm focus:outline-none focus:border-primary"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-400 mb-2">
            Ativo
          </label>
          <input
            type="text"
            value={filters.symbol}
            onChange={(e) => handleChange("symbol", e.target.value)}
            placeholder="Ex: XAUUSD"
            className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm focus:outline-none focus:border-primary"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-400 mb-2">
            Estratégia
          </label>
          <input
            type="text"
            value={filters.strategy}
            onChange={(e) => handleChange("strategy", e.target.value)}
            placeholder="Ex: CSV"
            className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm focus:outline-none focus:border-primary"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-400 mb-2">
            Resultado
          </label>
          <select
            value={filters.result}
            onChange={(e) => handleChange("result", e.target.value)}
            className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm focus:outline-none focus:border-primary"
          >
            <option value="all">Todos</option>
            <option value="win">Apenas Ganhos</option>
            <option value="loss">Apenas Perdas</option>
          </select>
        </div>
      </div>
    </Card>
  )
}
