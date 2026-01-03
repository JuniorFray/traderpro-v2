import { useState, useEffect } from 'react'
import { useAuth } from '../auth/AuthContext'
import { getAllTickets, getTicketStats } from '../../services/tickets'
import { AdminTicketDetailModal } from './AdminTicketDetailModal'

export const AdminTicketsPage = () => {
  const { user } = useAuth()
  const [tickets, setTickets] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedTicket, setSelectedTicket] = useState(null)
  const [filterStatus, setFilterStatus] = useState('todos')
  const [filterPriority, setFilterPriority] = useState('todos')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [allTickets, ticketStats] = await Promise.all([
        getAllTickets(),
        getTicketStats()
      ])
      setTickets(allTickets)
      setStats(ticketStats)
    } catch (error) {
      console.error('Erro ao carregar tickets:', error)
    } finally {
      setLoading(false)
    }
  }

  // Filtros
  const filteredTickets = tickets.filter(ticket => {
    const statusMatch = filterStatus === 'todos' || ticket.status === filterStatus
    const priorityMatch = filterPriority === 'todos' || ticket.priority === filterPriority
    return statusMatch && priorityMatch
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
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-white">🎧 Suporte - Admin</h1>
        <p className="text-zinc-400 mt-1">
          Gerencie tickets dos usuários
        </p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <div className="text-2xl font-black text-white mb-1">{stats.total}</div>
            <div className="text-xs text-zinc-400">Total de Tickets</div>
          </div>
          
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
            <div className="text-2xl font-black text-blue-400 mb-1">{stats.abertos}</div>
            <div className="text-xs text-zinc-400">🔵 Abertos</div>
          </div>
          
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
            <div className="text-2xl font-black text-red-400 mb-1">{stats.aguardandoResposta}</div>
            <div className="text-xs text-zinc-400">⚠️ Aguardando</div>
          </div>
          
          <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
            <div className="text-2xl font-black text-green-400 mb-1">{stats.resolvidos}</div>
            <div className="text-xs text-zinc-400">✅ Resolvidos</div>
          </div>
          
          <div className="bg-gray-500/10 border border-gray-500/30 rounded-xl p-4">
            <div className="text-2xl font-black text-gray-400 mb-1">{stats.fechados}</div>
            <div className="text-xs text-zinc-400">⚫ Fechados</div>
          </div>
        </div>
      )}

      {/* Filtros */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
        <div className="grid md:grid-cols-2 gap-4">
          {/* Filtro Status */}
          <div>
            <label className="block text-sm font-semibold text-white mb-2">Status</label>
            <div className="flex flex-wrap gap-2">
              {['todos', 'aberto', 'resolvido', 'fechado'].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  style={filterStatus === status ? {
                    backgroundColor: '#00e676',
                    color: '#000',
                    fontWeight: 'bold',
                    boxShadow: '0 4px 14px rgba(0, 230, 118, 0.5)'
                  } : {}}
                  className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                    filterStatus === status
                      ? ''
                      : 'bg-zinc-800 text-zinc-300 border border-zinc-700 hover:bg-zinc-700'
                  }`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Filtro Prioridade */}
          <div>
            <label className="block text-sm font-semibold text-white mb-2">Prioridade</label>
            <div className="flex flex-wrap gap-2">
              {['todos', 'alta', 'media', 'baixa'].map((priority) => (
                <button
                  key={priority}
                  onClick={() => setFilterPriority(priority)}
                  style={filterPriority === priority ? {
                    backgroundColor: '#00e676',
                    color: '#000',
                    fontWeight: 'bold',
                    boxShadow: '0 4px 14px rgba(0, 230, 118, 0.5)'
                  } : {}}
                  className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                    filterPriority === priority
                      ? ''
                      : 'bg-zinc-800 text-zinc-300 border border-zinc-700 hover:bg-zinc-700'
                  }`}
                >
                  {priority.charAt(0).toUpperCase() + priority.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>
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
          <p className="text-zinc-400">
            Não há tickets com os filtros selecionados.
          </p>
        </div>
      )}

      {!loading && filteredTickets.length > 0 && (
        <div className="space-y-3">
          {filteredTickets.map((ticket) => (
            <div
              key={ticket.id}
              onClick={() => setSelectedTicket(ticket)}
              className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 hover:border-primary/30 transition-all cursor-pointer"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                {/* Conteúdo */}
                <div className="flex-1">
                  <div className="flex items-start gap-3 mb-2">
                    <div className="text-2xl">
                      {ticket.category === 'bug' && '🐛'}
                      {ticket.category === 'duvida' && '❓'}
                      {ticket.category === 'sugestao' && '💡'}
                      {ticket.category === 'outro' && '📝'}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-bold text-white">
                          {ticket.subject}
                        </h3>
                        {!ticket.adminResponse && ticket.status === 'aberto' && (
                          <span className="px-2 py-0.5 bg-red-500/20 text-red-400 text-xs font-bold rounded-full border border-red-500/30 animate-pulse">
                            NOVO
                          </span>
                        )}
                        {ticket.isPro && (
                          <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 text-xs font-bold rounded-full">
                            👑 PRO
                          </span>
                        )}
                      </div>
                      <p className="text-zinc-400 text-sm line-clamp-2 mb-2">
                        {ticket.description}
                      </p>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-500">
                        <span>👤 {ticket.userEmail}</span>
                        <span>•</span>
                        <span>📅 {ticket.createdAt?.toLocaleString('pt-BR')}</span>
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
                  </div>
                </div>
                
                {/* Badges */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                  {getPriorityBadge(ticket.priority)}
                  {getStatusBadge(ticket.status)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de Detalhes */}
      {selectedTicket && (
        <AdminTicketDetailModal
          ticket={selectedTicket}
          onClose={() => setSelectedTicket(null)}
          onUpdate={loadData}
        />
      )}
    </div>
  )
}
