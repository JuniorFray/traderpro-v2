import { useState } from "react"
import { Button, Input, Card } from "../../components/ui"

export const TradeForm = ({ onSubmit, onCancel, initialData = null }) => {
  const [formData, setFormData] = useState(initialData || {
    asset: "",
    date: new Date().toISOString().split("T")[0],
    type: "TRADE",
    pnl: "",
    commission: "",
    swap: "",
    strategy: "",
    notes: ""
  })

  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    await onSubmit(formData)
    setLoading(false)
  }

  return (
    <Card>
      <form onSubmit={handleSubmit} className="space-y-4">
        <h3 className="text-xl font-bold text-white mb-4">
          {initialData ? "Editar Trade" : "Novo Trade"}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Ativo"
            name="asset"
            value={formData.asset}
            onChange={handleChange}
            placeholder="Ex: XAUUSD, WINZ24"
            required
          />

          <Input
            label="Data"
            name="date"
            type="date"
            value={formData.date}
            onChange={handleChange}
            required
          />

          <Input
            label="Resultado (R$)"
            name="pnl"
            type="number"
            step="0.01"
            value={formData.pnl}
            onChange={handleChange}
            placeholder="0.00"
            required
          />

          <Input
            label="Comissão (R$)"
            name="commission"
            type="number"
            step="0.01"
            value={formData.commission}
            onChange={handleChange}
            placeholder="-0.50"
          />

          <Input
            label="Swap (R$)"
            name="swap"
            type="number"
            step="0.01"
            value={formData.swap}
            onChange={handleChange}
            placeholder="0.00"
          />

          <Input
            label="Estratégia"
            name="strategy"
            value={formData.strategy}
            onChange={handleChange}
            placeholder="Ex: Scalp, Swing"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-400 mb-2">
            Observações
          </label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows={3}
            placeholder="Notas sobre o trade..."
            className="w-full px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-win focus:border-transparent"
          />
        </div>

        <div className="flex gap-3">
          <Button type="submit" variant="success" disabled={loading}>
            {loading ? "Salvando..." : initialData ? "Atualizar" : "Criar Trade"}
          </Button>
          
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
          )}
        </div>
      </form>
    </Card>
  )
}
