import { useState } from 'react'
import { useAuth } from '../auth/AuthContext'
import { respondTicket, updateTicketStatus } from '../../services/tickets'

export const AdminTicketDetailModal = ({ ticket, onClose, onUpdate }) => {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [response, setResponse] = useState(ticket.adminResponse || '')
  const [newStatus, setNewStatus] = useState(ticket.status)

  const handleRespond = async () => {
    if (!response.trim()) {
      alert('Por favor, escreva uma resposta.')
      return
    }

    if (!window.confirm('Enviar resposta e marcar como resolvido?')) {
      return
    }

    try {
      setLoading(true)
      await respondTicket(ticket.id, response, user.email)
      alert('✅ Resposta enviada com sucesso!')
      onUpdate()
      onClose()
    } catch (error) {
      console.error('Erro ao responder ticket:', error)
      alert('❌ Erro ao enviar resposta. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (status) => {
    if (!window.confirm(`Alterar status para "${status}"?`)) {
      return
    }

    try {
      setLoading(true)
      await updateTicketStatus(ticket.id, status)
      alert(`✅ Status alterado para "${status}"!`)
      onUpdate()
      onClose()
    } catch (error) {
      console.error('Erro ao atualizar status:', error)
      alert('❌ Erro ao atualizar status. Tente novamente.')
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
      alta: 'bg-red-500/20 text-red-400 border border-red-500/30',
      media: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30',
      baixa: 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
    }
    
    const labels = {
      alta: '🔴 Alta',
      media: '🟡 Média',
      baixa: '⚪ Baixa'
    }
    
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${styles[priority]}`}>
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
      <div className="bg-zinc-900 rounded-xl border border-zinc-800 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-zinc-800 sticky top-0 bg-zinc-900 z-10">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-white">Ticket #{ticket.id.slice(0, 8)}</h2>
            {getStatusBadge(ticket.status)}
            {ticket.isPro && (
              <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs font-bold rounded-full">
                👑 PRO
              </span>
            )}
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
          {/* Info do Usuário */}
          <div className="bg-zinc-800/50 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-zinc-400 mb-3">👤 Informações do Usuário</h3>
            <div className="grid md:grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-zinc-500">Email:</span>
                <span className="text-white font-semibold ml-2">{ticket.userEmail}</span>
              </div>
              <div>
                <span className="text-zinc-500">Nome:</span>
                <span className="text-white font-semibold ml-2">{ticket.userName}</span>
              </div>
              <div>
                <span className="text-zinc-500">Tipo:</span>
                <span className="text-white font-semibold ml-2">
                  {ticket.isPro ? '👑 PRO' : '🆓 Free'}
                </span>
              </div>
              <div>
                <span className="text-zinc-500">User ID:</span>
                <span className="text-white font-mono text-xs ml-2">{ticket.userId.slice(0, 12)}...</span>
              </div>
            </div>
          </div>

          {/* Info do Ticket */}
          <div className="bg-zinc-800/50 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-zinc-400 mb-3">📋 Detalhes do Ticket</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-zinc-500">Categoria:</span>
                <span className="text-white font-semibold">{getCategoryLabel(ticket.category)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-500">Prioridade:</span>
                {getPriorityBadge(ticket.priority)}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-500">Criado em:</span>
                <span className="text-white">{ticket.createdAt?.toLocaleString('pt-BR')}</span>
              </div>
              {ticket.respondedAt && (
  <div className="flex items-center justify-between">
    <span className="text-sm text-zinc-400">Respondido em:</span>
    <span className="text-sm text-white">{ticket.respondedAt?.toLocaleString('pt-BR')}</span>
  </div>
)}

            </div>
          </div>

          {/* Assunto */}
          <div>
            <h3 className="text-sm font-semibold text-zinc-400 mb-2">📌 Assunto</h3>
            <p className="text-lg font-bold text-white">{ticket.subject}</p>
          </div>

          {/* Descrição do Usuário */}
          <div>
            <h3 className="text-sm font-semibold text-zinc-400 mb-2">💬 Mensagem do Usuário</h3>
            <div className="bg-zinc-800 rounded-lg p-4">
              <p className="text-white whitespace-pre-wrap">{ticket.description}</p>
            </div>
          </div>

          {/* Resposta do Admin (se já existe) */}
          {ticket.adminResponse && (
            <div>
              <h3 className="text-sm font-semibold text-green-400 mb-2 flex items-center gap-2">
                ✅ Sua Resposta
                <span className="text-xs text-zinc-500">({ticket.respondedAt?.toLocaleString('pt-BR')})</span>
              </h3>
              <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                <p className="text-white whitespace-pre-wrap">{ticket.adminResponse}</p>
              </div>
            </div>
          )}

          {/* Campo de Resposta (se ainda não respondeu) */}
          {!ticket.adminResponse && (
            <div>
              <h3 className="text-sm font-semibold text-primary mb-2">✍️ Escrever Resposta</h3>
              <textarea
                value={response}
                onChange={(e) => setResponse(e.target.value)}
                placeholder="Digite sua resposta ao usuário..."
                rows={6}
                className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:border-primary focus:outline-none resize-none"
                maxLength={2000}
              />
              <p className="text-xs text-zinc-500 mt-1">
                {response.length}/2000 caracteres
              </p>
            </div>
          )}

          {/* Ações */}
          <div className="flex flex-col gap-3 pt-4 border-t border-zinc-800">
            {/* Botões de Status */}
            <div>
              <h3 className="text-sm font-semibold text-zinc-400 mb-2">🔄 Alterar Status</h3>
              <div className="flex flex-wrap gap-2">
                {ticket.status !== 'aberto' && (
                  <button
                    onClick={() => handleStatusChange('aberto')}
                    className="px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 font-bold rounded-lg transition-colors border border-blue-500/30"
                    disabled={loading}
                  >
                    🔵 Reabrir
                  </button>
                )}
                {ticket.status !== 'resolvido' && (
                  <button
                    onClick={() => handleStatusChange('resolvido')}
                    className="px-4 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 font-bold rounded-lg transition-colors border border-green-500/30"
                    disabled={loading}
                  >
                    ✅ Marcar como Resolvido
                  </button>
                )}
                {ticket.status !== 'fechado' && (
                  <button
                    onClick={() => handleStatusChange('fechado')}
                    className="px-4 py-2 bg-gray-500/20 hover:bg-gray-500/30 text-gray-400 font-bold rounded-lg transition-colors border border-gray-500/30"
                    disabled={loading}
                  >
                    ⚫ Fechar
                  </button>
                )}
              </div>
            </div>

            {/* Botão de Responder */}
            {!ticket.adminResponse && (
              <button
                onClick={handleRespond}
                className="w-full px-6 py-4 bg-primary hover:bg-primary/90 text-black font-bold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading || !response.trim()}
              >
                {loading ? 'Enviando...' : '📤 Enviar Resposta e Marcar como Resolvido'}
              </button>
            )}

            {/* Botão Fechar Modal */}
            <button
              onClick={onClose}
              className="w-full px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-white font-bold rounded-lg transition-colors"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
