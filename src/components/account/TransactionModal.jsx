import { useState } from 'react'
import { Button } from '../../components/ui/Button'

export const TransactionModal = ({ isOpen, onClose, onSubmit, loading }) => {
  const [formData, setFormData] = useState({
    type: 'deposit',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    description: ''
  })

  if (!isOpen) return null

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <div 
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="bg-zinc-900 rounded-xl w-full max-w-md max-h-[90vh] overflow-y-auto border border-zinc-800"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header fixo */}
        <div className="sticky top-0 bg-zinc-900 border-b border-zinc-800 p-6 pb-4">
          <h2 className="text-2xl font-bold text-white">Nova Transação</h2>
        </div>

        {/* Conteúdo com scroll */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Tipo de Transação */}
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-2">
              Tipo de Transação
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, type: 'deposit' })}
                className={`p-4 rounded-lg border-2 transition-all ${
                  formData.type === 'deposit'
                    ? 'bg-emerald-500/20 border-emerald-500'
                    : 'bg-zinc-800 border-zinc-700 hover:border-zinc-600'
                }`}
              >
                <div className="text-3xl mb-2">💰</div>
                <div className={`font-medium ${formData.type === 'deposit' ? 'text-emerald-400' : 'text-zinc-400'}`}>
                  Depósito
                </div>
              </button>

              <button
                type="button"
                onClick={() => setFormData({ ...formData, type: 'withdrawal' })}
                className={`p-4 rounded-lg border-2 transition-all ${
                  formData.type === 'withdrawal'
                    ? 'bg-red-500/20 border-red-500'
                    : 'bg-zinc-800 border-zinc-700 hover:border-zinc-600'
                }`}
              >
                <div className="text-3xl mb-2">💸</div>
                <div className={`font-medium ${formData.type === 'withdrawal' ? 'text-red-400' : 'text-zinc-400'}`}>
                  Saque
                </div>
              </button>
            </div>
          </div>

          {/* Valor */}
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-2">
              Valor *
            </label>
            <input
              type="number"
              step="0.01"
              required
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              placeholder="Ex: 1000.00"
              className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Moeda - Desabilitado por enquanto */}
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-2">
              Moeda
            </label>
            <select
              disabled
              className="w-full px-4 py-3 bg-zinc-900 border border-zinc-700 rounded-lg text-white opacity-75 cursor-not-allowed"
            >
              <option value="USD">💵 Dólar (USD)</option>
            </select>
          </div>

          {/* Data */}
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-2">
              Data *
            </label>
            <input
              type="date"
              required
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Descrição */}
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-2">
              Descrição (opcional)
            </label>
            <textarea
              rows="3"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Ex: Aporte mensal, Retirada de lucros..."
              className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500 resize-none"
            />
          </div>

          {/* Botões */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              onClick={onClose}
              variant="secondary"
              className="flex-1"
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-emerald-600 hover:bg-emerald-700"
              disabled={loading}
            >
              {loading ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
