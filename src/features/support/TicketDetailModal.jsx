import { useState, useEffect, useRef } from 'react'
import { doc, onSnapshot } from 'firebase/firestore'
import { db } from '../../services/firebase'
import { addTicketMessage, updateTicketStatus, markTicketAsRead } from '../../services/tickets'

export const TicketDetailModal = ({ ticket, onClose, onUpdate }) => {
  const [loading, setLoading] = useState(false)
  const [currentTicket, setCurrentTicket] = useState(ticket)
  const [newMessage, setNewMessage] = useState('')
  const hasMarkedAsRead = useRef(false) // ✅ Flag para evitar múltiplas chamadas

  useEffect(() => {
    if (!ticket?.id) return

    // ✅ Marcar como lido APENAS UMA VEZ quando o modal abrir
    if (!hasMarkedAsRead.current) {
      markTicketAsRead(ticket.id).catch(err => {
        console.error('Erro ao marcar ticket como lido:', err)
      })
      hasMarkedAsRead.current = true
    }

    // ✅ Escutar atualizações em tempo real
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

  const handleSendMessage = async () => {
    if (!newMessage.trim()) {
      alert('Por favor, escreva uma mensagem.')
      return
    }

    try {
      setLoading(true)
      
      await addTicketMessage(currentTicket.id, {
        text: newMessage,
        isAdmin: false,
        createdAt: new Date()
      })

      setNewMessage('')
      alert('✅ Mensagem enviada com sucesso!')
      if (onUpdate) onUpdate()
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error)
      alert('❌ Erro ao enviar mensagem. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const handleCloseTicket = async () => {
    if (!window.confirm('Tem certeza que deseja fechar este ticket? Esta ação não pode ser desfeita.')) {
      return
    }

    try {
      setLoading(true)
      await updateTicketStatus(currentTicket.id, 'fechado')
      alert('✅ Ticket fechado com sucesso!')
      if (onUpdate) onUpdate()
      onClose()
    } catch (error) {
      console.error('Erro ao fechar ticket:', error)
      alert('❌ Erro ao fechar ticket. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  // ... resto do código permanece igual
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
            <h2 className="text-2xl font-bold text-white">Ticket #{currentTicket.id.slice(0, 8)}</h2>
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
          {/* Info */}
          <div className="bg-zinc-800/50 rounded-lg p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-zinc-400">Categoria:</span>
              <span className="text-sm text-white font-semibold">{getCategoryLabel(currentTicket.category)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-zinc-400">Prioridade:</span>
              {getPriorityBadge(currentTicket.priority)}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-zinc-400">Criado em:</span>
              <span className="text-sm text-white">{currentTicket.createdAt?.toLocaleString('pt-BR')}</span>
            </div>
            {currentTicket.updatedAt && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-zinc-400">Atualizado em:</span>
                <span className="text-sm text-white">{currentTicket.updatedAt?.toLocaleString('pt-BR')}</span>
              </div>
            )}
          </div>

          {/* Assunto */}
          <div>
            <h3 className="text-sm font-semibold text-zinc-400 mb-2">Assunto</h3>
            <p className="text-lg font-bold text-white">{currentTicket.subject}</p>
          </div>

          {/* Descrição */}
          <div>
            <h3 className="text-sm font-semibold text-zinc-400 mb-2">Sua Mensagem</h3>
            <div className="bg-zinc-800 rounded-lg p-4">
              <p className="text-white whitespace-pre-wrap">{currentTicket.description}</p>
            </div>
          </div>

          {/* Histórico de Mensagens */}
          {currentTicket.messages && currentTicket.messages.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-zinc-400 mb-3">💬 Conversa</h3>
              <div className="space-y-3">
                {currentTicket.messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`rounded-lg p-4 ${
                      msg.isAdmin
                        ? 'bg-green-500/10 border border-green-500/30'
                        : 'bg-zinc-800'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-white">
                        {msg.isAdmin ? '🛡️ Suporte' : '👤 Você'}
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

          {/* Aguardando resposta */}
          {(!currentTicket.messages || currentTicket.messages.length === 0) && currentTicket.status === 'aberto' && (
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
              <p className="text-sm text-blue-400">
                ⏳ <strong>Aguardando resposta...</strong> Nossa equipe responderá em breve.
              </p>
            </div>
          )}

          {/* Campo para adicionar mensagem */}
          {currentTicket.status !== 'fechado' && (
            <div className="bg-zinc-800/30 rounded-lg p-4 border border-zinc-700">
              <h3 className="text-sm font-semibold text-zinc-400 mb-3">✍️ Adicionar Mensagem</h3>
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Digite sua resposta ou adicione mais informações..."
                rows={4}
                className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:border-primary focus:outline-none resize-none"
              />
              <button
                onClick={handleSendMessage}
                disabled={loading || !newMessage.trim()}
                className="mt-3 w-full px-6 py-3 bg-primary hover:bg-primary/90 text-black font-bold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Enviando...' : '📤 Enviar Mensagem'}
              </button>
            </div>
          )}

          {/* Aviso ticket fechado */}
          {currentTicket.status === 'fechado' && (
            <div className="bg-gray-500/10 border border-gray-500/30 rounded-lg p-4">
              <p className="text-sm text-gray-400">
                🔒 <strong>Ticket fechado.</strong> Este ticket foi encerrado. Para nova solicitação, crie um novo ticket.
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
            
            {currentTicket.status !== 'fechado' && (
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