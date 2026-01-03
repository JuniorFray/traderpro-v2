import { useState, useEffect } from 'react'
import { useAuth } from '../auth/AuthContext'
import { getUserTickets } from '../../services/tickets'
import { NewTicketModal } from './NewTicketModal'
import { TicketDetailModal } from './TicketDetailModal'

export const SupportPage = () => {
  const { user, isPro } = useAuth()
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [showNewTicketModal, setShowNewTicketModal] = useState(false)
  const [selectedTicket, setSelectedTicket] = useState(null)
  const [filter, setFilter] = useState('todos') // todos, aberto, resolvido, fechado

  useEffect(() => {
    loadTickets()
  }, [user])

  const loadTickets = async () => {
    try {
      setLoading(true)
      const userTickets = await getUserTickets(user.uid)
      setTickets(userTickets)
    } catch (error) {
      console.error('Erro ao carregar tickets:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredTickets = tickets.filter(ticket => {
    if (filter === 'todos') return true
    return ticket.status === filter
  })

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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-white">🎧 Suporte</h1>
          <p className="text-zinc-400 mt-1">
            Abra tickets e acompanhe suas solicitações
          </p>
        </div>
        
        <button
          onClick={() => setShowNewTicketModal(true)}
          className="px-6 py-3 bg-primary hover:bg-primary/90 text-black font-bold rounded-lg transition-colors flex items-center gap-2"
        >
          ➕ Novo Ticket
        </button>
      </div>

            {/* Filtros */}
      <div className="flex flex-wrap gap-2">
        {['todos', 'aberto', 'resolvido', 'fechado'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            style={filter === status ? {
              backgroundColor: '#00e676',
              color: '#000',
              fontWeight: 'bold',
              boxShadow: '0 4px 14px rgba(0, 230, 118, 0.5)'
            } : {}}
            className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
              filter === status
                ? ''
                : 'bg-zinc-800 text-zinc-300 border border-zinc-700 hover:bg-zinc-700 hover:text-white'
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
            {status === 'todos' && ` (${tickets.length})`}
            {status !== 'todos' && ` (${tickets.filter(t => t.status === status).length})`}
          </button>
        ))}
      </div>


      {/* Loading */}
      {loading && (
        <div className="text-center py-12">
          <div className="inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-zinc-400 mt-4">Carregando tickets...</p>
        </div>
      )}

      {/* Lista de Tickets */}
      {!loading && filteredTickets.length === 0 && (
        <div className="text-center py-12 bg-zinc-900 rounded-xl border border-zinc-800">
          <div className="text-6xl mb-4">📭</div>
          <h3 className="text-xl font-bold text-white mb-2">Nenhum ticket encontrado</h3>
          <p className="text-zinc-400 mb-6">
            {filter === 'todos' 
              ? 'Você ainda não criou nenhum ticket.'
              : `Você não tem tickets com status "${filter}".`
            }
          </p>
          {filter === 'todos' && (
            <button
              onClick={() => setShowNewTicketModal(true)}
              className="px-6 py-3 bg-primary hover:bg-primary/90 text-black font-bold rounded-lg transition-colors"
            >
              Criar Primeiro Ticket
            </button>
          )}
        </div>
      )}

      {!loading && filteredTickets.length > 0 && (
        <div className="space-y-4">
          {filteredTickets.map((ticket) => (
            <div
              key={ticket.id}
              onClick={() => setSelectedTicket(ticket)}
              className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 hover:border-primary/30 transition-all cursor-pointer"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-start gap-3 mb-2">
                    <div className="text-2xl">
                      {ticket.category === 'bug' && '🐛'}
                      {ticket.category === 'duvida' && '❓'}
                      {ticket.category === 'sugestao' && '💡'}
                      {ticket.category === 'outro' && '📝'}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-white mb-1">
                        {ticket.subject}
                      </h3>
                      <p className="text-zinc-400 text-sm line-clamp-2">
                        {ticket.description}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-zinc-500">
                    <span>📅 {ticket.createdAt?.toLocaleDateString('pt-BR')}</span>
                    <span>•</span>
                    <span>{getCategoryLabel(ticket.category)}</span>
                    {ticket.adminResponse && (
                      <>
                        <span>•</span>
                        <span className="text-green-400">✅ Respondido</span>
                      </>
                    )}
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                  {getPriorityBadge(ticket.priority)}
                  {getStatusBadge(ticket.status)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      {showNewTicketModal && (
        <NewTicketModal
          onClose={() => setShowNewTicketModal(false)}
          onSuccess={() => {
            setShowNewTicketModal(false)
            loadTickets()
          }}
        />
      )}

      {selectedTicket && (
        <TicketDetailModal
          ticket={selectedTicket}
          onClose={() => setSelectedTicket(null)}
          onUpdate={loadTickets}
        />
      )}
    </div>
  )
}
