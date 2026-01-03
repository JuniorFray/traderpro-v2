import { useState } from 'react'
import { useAuth } from '../auth/AuthContext'
import { createTicket } from '../../services/tickets'

export const NewTicketModal = ({ onClose, onSuccess }) => {
  const { user, isPro } = useAuth()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    subject: '',
    category: 'duvida',
    priority: 'media',
    description: ''
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.subject.trim() || !formData.description.trim()) {
      alert('Por favor, preencha todos os campos obrigatórios.')
      return
    }

    try {
      setLoading(true)
      
      await createTicket({
        userId: user.uid,
        userEmail: user.email,
        userName: user.displayName || user.email.split('@')[0],
        isPro: isPro,
        ...formData
      })
      
      alert('✅ Ticket criado com sucesso! Nossa equipe responderá em breve.')
      onSuccess()
    } catch (error) {
      console.error('Erro ao criar ticket:', error)
      alert('❌ Erro ao criar ticket. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-zinc-900 rounded-xl border border-zinc-800 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-zinc-800 sticky top-0 bg-zinc-900 z-10">
          <h2 className="text-2xl font-bold text-white">➕ Novo Ticket</h2>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white text-2xl"
          >
            ✕
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Assunto */}
          <div>
            <label className="block text-sm font-semibold text-white mb-2">
              Assunto *
            </label>
            <input
              type="text"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              placeholder="Ex: Erro ao gerar relatório PDF"
              className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:border-primary focus:outline-none"
              maxLength={100}
              required
            />
            <p className="text-xs text-zinc-500 mt-1">
              {formData.subject.length}/100 caracteres
            </p>
          </div>

          {/* Categoria */}
          <div>
            <label className="block text-sm font-semibold text-white mb-2">
              Categoria *
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:border-primary focus:outline-none"
            >
              <option value="duvida">❓ Dúvida</option>
              <option value="bug">🐛 Bug / Erro</option>
              <option value="sugestao">💡 Sugestão</option>
              <option value="outro">📝 Outro</option>
            </select>
          </div>

          {/* Prioridade */}
          <div>
            <label className="block text-sm font-semibold text-white mb-2">
              Prioridade *
            </label>
            <select
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:border-primary focus:outline-none"
            >
              <option value="baixa">⚪ Baixa - Posso esperar</option>
              <option value="media">🟡 Média - Normal</option>
              <option value="alta">🔴 Alta - Urgente</option>
            </select>
          </div>

          {/* Descrição */}
          <div>
            <label className="block text-sm font-semibold text-white mb-2">
              Descrição *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Descreva detalhadamente sua dúvida, problema ou sugestão..."
              rows={6}
              className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:border-primary focus:outline-none resize-none"
              maxLength={1000}
              required
            />
            <p className="text-xs text-zinc-500 mt-1">
              {formData.description.length}/1000 caracteres
            </p>
          </div>

          {/* Avisos */}
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
            <p className="text-sm text-blue-400">
              💡 <strong>Dica:</strong> Seja o mais específico possível para recebermos uma resposta mais rápida e precisa.
            </p>
          </div>

          {/* Botões */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-white font-bold rounded-lg transition-colors"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-primary hover:bg-primary/90 text-black font-bold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? 'Enviando...' : 'Criar Ticket'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
