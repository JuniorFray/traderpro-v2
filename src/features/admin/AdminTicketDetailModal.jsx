import { useState, useEffect } from 'react'
import { doc, onSnapshot } from 'firebase/firestore'
import { db } from '../../services/firebase'
import { addTicketMessage, updateTicketStatus, markTicketAsRead } from '../../services/tickets' // ✅ ADICIONADO

export const AdminTicketDetailModal = ({ ticket, onClose, onUpdate, user }) => {
  const [loading, setLoading] = useState(false)
  const [response, setResponse] = useState('')
  const [currentTicket, setCurrentTicket] = useState(ticket)

  // ✅ ATUALIZAÇÃO EM TEMPO REAL - Escuta mudanças no ticket
  useEffect(() => {
    if (!ticket?.id) return

    // ✅ ADICIONADO: Marcar como lido quando admin abre o ticket
    markTicketAsRead(ticket.id, true) // true = isAdmin
      .then(() => {
        console.log('✅ Ticket marcado como lido pelo admin')
        // Atualizar contador no parent
        if (onUpdate) onUpdate()
      })
      .catch(err => console.error('Erro ao marcar ticket como lido:', err))

    const ticketRef = doc(db, 'tickets', ticket.id)
    const unsubscribe = onSnapshot(ticketRef, (snapshot) => {
      if (snapshot.exists()) {
        setCurrentTicket({
          id: snapshot.id,
          ...snapshot.data(),
          createdAt: snapshot.data().createdAt?.toDate?.(),
          updatedAt: snapshot.data().updatedAt?.toDate?.(),
        })
      }
    })

    return () => unsubscribe()
  }, [ticket?.id])

  const handleRespond = async () => {
    if (!response.trim()) {
      alert('Por favor, escreva uma resposta.')
      return
    }

    try {
      setLoading(true)

      // ✅ Adiciona mensagem SEM fechar o ticket
      await addTicketMessage(currentTicket.id, {
        text: response,
        isAdmin: true,
        adminEmail: user.email,
        createdAt: new Date()
      })

      // ✅ Limpa o campo para nova mensagem
      setResponse('')
      
      // ✅ Notifica o parent para atualizar lista
      if (onUpdate) onUpdate()

      // ✅ Feedback visual
      console.log('✅ Mensagem enviada com sucesso!')
      
    } catch (error) {
      console.error('Erro ao responder ticket:', error)
      alert('Erro ao enviar mensagem. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (status) => {
    const statusLabels = {
      'aberto': 'Aberto',
      'resolvido': 'Resolvido',
      'fechado': 'Fechado'
    }

    if (!window.confirm(`Alterar status para "${statusLabels[status]}"?`)) {
      return
    }

    try {
      setLoading(true)
      await updateTicketStatus(currentTicket.id, status)
      alert(`Status alterado para "${statusLabels[status]}"!`)
      
      // ✅ Atualizar contador
      if (onUpdate) onUpdate()

      // Fecha modal apenas se fechar o ticket
      if (status === 'fechado') {
        onClose()
      }
    } catch (error) {
      console.error('Erro ao atualizar status:', error)
      alert('Erro ao atualizar status. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status) => {
    const styles = {
      'aberto': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      'resolvido': 'bg-green-500/20 text-green-400 border-green-500/30',
      'fechado': 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }

    const labels = {
      'aberto': '🔵 Aberto',
      'resolvido': '✅ Resolvido',
      'fechado': '🔒 Fechado'
    }

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${styles[status]}`}>
        {labels[status]}
      </span>
    )
  }

  const getPriorityBadge = (priority) => {
    const styles = {
      'alta': 'bg-red-500/20 text-red-400',
      'media': 'bg-yellow-500/20 text-yellow-400',
      'baixa': 'bg-gray-500/20 text-gray-400'
    }

    const labels = {
      'alta': '🔴 Alta',
      'media': '🟡 Média',
      'baixa': '⚪ Baixa'
    }

    return (
      <span className={`px-2 py-0.5 rounded text-xs font-semibold ${styles[priority]}`}>
        {labels[priority]}
      </span>
    )
  }

  const getCategoryLabel = (category) => {
    const labels = {
      'bug': '🐛 Bug',
      'duvida': '❓ Dúvida',
      'sugestao': '💡 Sugestão',
      'outro': '📌 Outro'
    }
    return labels[category] || category
  }

  const isTicketClosed = currentTicket.status === 'fechado'

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-zinc-900 rounded-xl border border-zinc-800 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-zinc-800 sticky top-0 bg-zinc-900 z-10">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-white">🎫 Ticket #{currentTicket.id.slice(0, 8)}</h2>
            {getStatusBadge(currentTicket.status)}
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
                <span className="text-white font-semibold ml-2">{currentTicket.userEmail}</span>
              </div>
              <div>
                <span className="text-zinc-500">Nome:</span>
                <span className="text-white font-semibold ml-2">{currentTicket.userName || 'N/A'}</span>
              </div>
              <div>
                <span className="text-zinc-500">User ID:</span>
                <span className="text-white font-mono text-xs ml-2">{currentTicket.userId.slice(0, 12)}...</span>
              </div>
            </div>
          </div>

          {/* Info do Ticket */}
          <div className="bg-zinc-800/50 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-zinc-400 mb-3">📋 Detalhes do Ticket</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-zinc-500">Categoria:</span>
                <span className="text-white font-semibold">{getCategoryLabel(currentTicket.category)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-500">Prioridade:</span>
                {getPriorityBadge(currentTicket.priority)}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-500">Criado em:</span>
                <span className="text-white">{currentTicket.createdAt?.toLocaleString('pt-BR')}</span>
              </div>
            </div>
          </div>

          {/* Assunto */}
          <div>
            <h3 className="text-sm font-semibold text-zinc-400 mb-2">📝 Assunto</h3>
            <p className="text-lg font-bold text-white">{currentTicket.subject}</p>
          </div>

          {/* Descrição do Usuário */}
          <div>
            <h3 className="text-sm font-semibold text-zinc-400 mb-2">💬 Mensagem Inicial do Usuário</h3>
            <div className="bg-zinc-800 rounded-lg p-4">
              <p className="text-white whitespace-pre-wrap">{currentTicket.description}</p>
            </div>
          </div>

          {/* Histório de Mensagens */}
          {currentTicket.messages && currentTicket.messages.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-zinc-400 mb-3">💬 Histórico da Conversa</h3>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {currentTicket.messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`rounded-lg p-4 ${
                      msg.isAdmin
                        ? 'bg-blue-500/10 border border-blue-500/30'
                        : 'bg-zinc-800'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-white">
                        {msg.isAdmin ? '🛡️ Admin' : '👤 Usuário'}
                        {msg.adminEmail && <span className="text-zinc-400 ml-2">({msg.adminEmail})</span>}
                      </span>
                      <span className="text-xs text-zinc-500">
                        {msg.createdAt?.toDate?.()?.toLocaleString('pt-BR') || 'Agora'}
                      </span>
                    </div>
                    <p className="text-sm text-white whitespace-pre-wrap">{msg.text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ✅ CAMPO DE RESPOSTA - SEMPRE VISÍVEL (exceto se fechado) */}
          {!isTicketClosed && (
            <div className="bg-blue-500/5 border border-blue-500/20 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-primary mb-2">✉️ Enviar Nova Mensagem</h3>
              <textarea
                value={response}
                onChange={(e) => setResponse(e.target.value)}
                placeholder="Digite sua resposta ao usuário..."
                rows={6}
                className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:border-primary focus:outline-none resize-none"
                maxLength={2000}
                disabled={loading}
              />
              <div className="flex items-center justify-between mt-2">
                <p className="text-xs text-zinc-500">
                  {response.length}/2000 caracteres
                </p>
                <button
                  onClick={handleRespond}
                  className="px-6 py-3 bg-primary hover:bg-primary/90 text-black font-bold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={loading || !response.trim()}
                >
                  {loading ? '📤 Enviando...' : '📤 Enviar Mensagem'}
                </button>
              </div>
            </div>
          )}

          {/* Ticket Fechado */}
          {isTicketClosed && (
            <div className="bg-gray-500/10 border border-gray-500/30 rounded-lg p-4 text-center">
              <p className="text-gray-400">
                🔒 Ticket fechado. Para continuar a conversa, reabra o ticket.
              </p>
            </div>
          )}

          {/* Ações */}
          <div className="flex flex-col gap-3 pt-4 border-t border-zinc-800">
            {/* Botões de Status */}
            <div>
              <h3 className="text-sm font-semibold text-zinc-400 mb-2">⚙️ Alterar Status</h3>
              <div className="flex flex-wrap gap-2">
                {currentTicket.status !== 'aberto' && (
                  <button
                    onClick={() => handleStatusChange('aberto')}
                    className="px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 font-bold rounded-lg transition-colors border border-blue-500/30"
                    disabled={loading}
                  >
                    🔵 Reabrir
                  </button>
                )}
                {currentTicket.status !== 'resolvido' && (
                  <button
                    onClick={() => handleStatusChange('resolvido')}
                    className="px-4 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 font-bold rounded-lg transition-colors border border-green-500/30"
                    disabled={loading}
                  >
                    ✅ Marcar como Resolvido
                  </button>
                )}
                {currentTicket.status !== 'fechado' && (
                  <button
                    onClick={() => handleStatusChange('fechado')}
                    className="px-4 py-2 bg-gray-500/20 hover:bg-gray-500/30 text-gray-400 font-bold rounded-lg transition-colors border border-gray-500/30"
                    disabled={loading}
                  >
                    🔒 Fechar Ticket
                  </button>
                )}
              </div>
            </div>

            {/* Botão Fechar Modal */}
            <button
              onClick={onClose}
              className="w-full px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-white font-bold rounded-lg transition-colors"
            >
              ⬅️ Fechar Detalhes
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
