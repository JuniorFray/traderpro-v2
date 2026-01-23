// src/components/onboarding/AccountSetupModal.jsx
import { useState } from 'react'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'

export const AccountSetupModal = ({ isOpen, onClose, onSubmit, loading }) => {
  const [formData, setFormData] = useState({
    initialBalance: '',
    currency: 'USD',
    hasImportedHistory: false
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (!formData.initialBalance || parseFloat(formData.initialBalance) < 0) {
      alert('Por favor, informe um saldo inicial válido')
      return
    }
    
    onSubmit(formData)
  }

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="🎯 Configure sua Conta"
      size="md"
      showCloseButton={false}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mb-6">
          <p className="text-sm text-blue-300">
            💡 <strong>Importante:</strong> Configure seu saldo inicial para começar a rastrear seu capital corretamente.
          </p>
        </div>

        {/* Moeda */}
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-2">
            Moeda da Conta
          </label>
          <select
            value={formData.currency}
            onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
            className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary"
            required
          >
            <option value="USD">🇺🇸 Dólar (USD)</option>
            <option value="BRL">🇧🇷 Real (BRL)</option>
            <option value="EUR">🇪🇺 Euro (EUR)</option>
          </select>
        </div>

        {/* Saldo Inicial */}
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-2">
            Saldo Inicial *
          </label>
          <Input
            type="number"
            step="0.01"
            placeholder="Ex: 10000.00"
            value={formData.initialBalance}
            onChange={(e) => setFormData({ ...formData, initialBalance: e.target.value })}
            required
          />
          <p className="text-xs text-zinc-500 mt-1">
            O saldo que você tinha quando começou a operar
          </p>
        </div>

        {/* Checkbox Histórico Importado */}
        <div className="bg-zinc-800/50 rounded-lg p-4">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.hasImportedHistory}
              onChange={(e) => setFormData({ ...formData, hasImportedHistory: e.target.checked })}
              className="mt-1"
            />
            <div>
              <span className="text-sm font-medium text-white">
                Já tenho histórico de trades importados
              </span>
              <p className="text-xs text-zinc-400 mt-1">
                Marque esta opção se você já importou trades anteriores. Isso ajudará no cálculo correto do saldo atual.
              </p>
            </div>
          </label>
        </div>

        {/* Botões */}
        <div className="flex gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="flex-1"
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            className="flex-1"
            disabled={loading}
          >
            {loading ? 'Salvando...' : 'Confirmar'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
