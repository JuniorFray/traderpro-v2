import { useState, useEffect } from "react"
import { Button } from "../../components/ui/Button"

export const TradeForm = ({ onSubmit, initialData = null, submitLabel = "Criar Trade" }) => {
  const [formData, setFormData] = useState({
    symbol: "",
    date: new Date().toISOString().split("T")[0],
    pnl: "",
    commission: "",
    swap: "",
    strategy: "",
    notes: ""
  })

  useEffect(() => {
    if (initialData) {
      const newFormData = {
        symbol: initialData.asset || initialData.symbol || "",
        date: initialData.date || new Date().toISOString().split("T")[0],
        pnl: initialData.pnl !== undefined ? initialData.pnl.toString() : "",
        commission: initialData.commission !== undefined ? initialData.commission.toString() : "",
        swap: initialData.swap !== undefined ? initialData.swap.toString() : "",
        strategy: initialData.strategy || "",
        notes: initialData.notes || ""
      }
      
      setFormData(newFormData)
    }
  }, [initialData])

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    const tradeData = {
      asset: formData.symbol,
      pnl: parseFloat(formData.pnl) || 0,
      commission: parseFloat(formData.commission) || 0,
      swap: parseFloat(formData.swap) || 0,
      strategy: formData.strategy,
      notes: formData.notes,
      date: formData.date
    }

    await onSubmit(tradeData)
    
    if (!initialData) {
      setFormData({
        symbol: "",
        date: new Date().toISOString().split("T")[0],
        pnl: "",
        commission: "",
        swap: "",
        strategy: "",
        notes: ""
      })
    }
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-zinc-400 mb-1">Ativo</label>
          <input
            type="text"
            name="symbol"
            value={formData.symbol}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-primary"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-400 mb-1">Data</label>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-primary"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-400 mb-1">Resultado ($)</label>
          <input
            type="number"
            name="pnl"
            step="0.01"
            value={formData.pnl}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-primary"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-400 mb-1">Comisso ($)</label>
          <input
            type="number"
            name="commission"
            step="0.01"
            value={formData.commission}
            onChange={handleChange}
            className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-primary"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-400 mb-1">Swap ($)</label>
          <input
            type="number"
            name="swap"
            step="0.01"
            value={formData.swap}
            onChange={handleChange}
            className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-primary"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-400 mb-1">Estratgia</label>
          <input
            type="text"
            name="strategy"
            value={formData.strategy}
            onChange={handleChange}
            className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-primary"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-zinc-400 mb-1">Observaes</label>
        <textarea
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          rows={3}
          className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-primary resize-none"
        />
      </div>

      <Button type="submit" className="w-full">
        {submitLabel}
      </Button>
    </form>
  )
}

