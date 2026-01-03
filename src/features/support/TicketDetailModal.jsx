import { useState } from 'react'
import { closeTicket } from '../../services/tickets'

export const TicketDetailModal = ({ ticket, onClose, onUpdate }) => {
  const [loading, setLoading] = useState(false)

  const handleCloseTicket = async () => {
    if (!window.confirm('Tem certeza que deseja fechar este ticket? Esta ação não pode ser desfeita.')) {
      return
    }

    try {
      setLoading(true)
      await closeTicket(ticket.id)
      alert('✅ Ticket fechado com sucesso!')
      onUpdate()
      onClose()
    } catch (error) {
      console.error('Erro ao fechar ticket:', error)
      alert('❌ Erro ao fechar ticket. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status) => {
    const styles = {
      aberto: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      resolvido: 'bg-green-500/20 text-green-400 border-green-500/30',
      fechado: 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
    
    const labels = {
      aberto: '🔵 Aberto',
      resolvido: '✅ Resolvido',
      fechado: '⚫ Fechado'
    }
    
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${styles[status]}`}>
        {labels[status]}
      </span>
    )
  }

  const getPriorityBadge = (priority) => {
    const styles = {
      alta: 'bg-red-500/20 text-red-400',
      media: 'bg-yellow-500/20 text-yellow-400',
      baixa: 'bg-gray-500/20 text-gray-400'
    }
    
    const labels = {
      alta: '🔴 Alta',
      media: '🟡 Média',
      baixa: '⚪ Baixa'
    }
    
    return (
      <span className={`px-2 py-0.5 rounded text-xs font-semibold ${styles[priority]}`}>
        {labels[priority]}
      </span>
    )
  }

  const getCategoryLabel = (category) => {
    const labels = {
      bug: '🐛 Bug',
      duvida: '❓ Dúvida',
      sugestao: '💡 Sugestão',
      outro: '📝 Outro'
    }
    return labels[category] || category
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-zinc-900 rounded-xl border border-zinc-800 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-zinc-800 sticky top-0 bg-zinc-900 z-10">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-white">Ticket #{ticket.id.slice(0, 8)}</h2>
            {getStatusBadge(ticket.status)}
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white text-2xl"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Info */}
          <div className="bg-zinc-800/50 rounded-lg p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-zinc-400">Categoria:</span>
              <span className="text-sm text-white font-semibold">{getCategoryLabel(ticket.category)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-zinc-400">Prioridade:</span>
              {getPriorityBadge(ticket.priority)}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-zinc-400">Criado em:</span>
              <span className="text-sm text-white">{ticket.createdAt?.toLocaleString('pt-BR')}</span>
            </div>
            {ticket.respondedAt && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-zinc-400">Respondido em:</span>
                <span className="text-sm text-white">{ticket.respondedAt?.toLocaleString('pt-BR')}</span>
              </div>
            )}
          </div>

          {/* Assunto */}
          <div>
            <h3 className="text-sm font-semibold text-zinc-400 mb-2">Assunto</h3>
            <p className="text-lg font-bold text-white">{ticket.subject}</p>
          </div>

          {/* Descrição */}
          <div>
            <h3 className="text-sm font-semibold text-zinc-400 mb-2">Sua Mensagem</h3>
            <div className="bg-zinc-800 rounded-lg p-4">
              <p className="text-white whitespace-pre-wrap">{ticket.description}</p>
            </div>
          </div>

          {/* Resposta do Admin */}
          {ticket.adminResponse && (
            <div>
              <h3 className="text-sm font-semibold text-green-400 mb-2 flex items-center gap-2">
                ✅ Resposta do Suporte
                {ticket.respondedBy && (
                  <span className="text-xs text-zinc-500">por {ticket.respondedBy}</span>
                )}
              </h3>
              <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                <p className="text-white whitespace-pre-wrap">{ticket.adminResponse}</p>
              </div>
            </div>
          )}

          {/* Aguardando resposta */}
          {!ticket.adminResponse && ticket.status === 'aberto' && (
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
              <p className="text-sm text-blue-400">
                ⏳ <strong>Aguardando resposta...</strong> Nossa equipe responderá em breve. Você receberá uma notificação quando houver novidades.
              </p>
            </div>
          )}

          {/* Botões */}
          <div className="flex gap-3 pt-4 border-t border-zinc-800">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-white font-bold rounded-lg transition-colors"
            >
              Fechar
            </button>
            
            {ticket.status !== 'fechado' && (
              <button
                onClick={handleCloseTicket}
                className="flex-1 px-6 py-3 bg-red-900/20 hover:bg-red-900/30 text-red-400 font-bold rounded-lg transition-colors disabled:opacity-50"
                disabled={loading}
              >
                {loading ? 'Fechando...' : '🔒 Fechar Ticket'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
