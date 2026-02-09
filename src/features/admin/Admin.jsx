import { useState, useEffect } from 'react'
import { doc, setDoc, deleteDoc, collection, getDocs, getDoc } from 'firebase/firestore'
import { db, auth } from '../../services/firebase'
import { Card } from '../../components/ui/Card'
import { useNavigate } from 'react-router-dom'
import { NotificationManager } from './NotificationManager'
import { AdminTicketsPage } from './AdminTicketsPage'
import { getUnreadTicketsCount } from '../../services/tickets' // ✅ ADICIONADO

export const Admin = () => {
  const [user, setUser] = useState(null)
  const navigate = useNavigate()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filter, setFilter] = useState('all')
  const [activeTab, setActiveTab] = useState('users')
  
  // ✅ Estados para controle EA
  const [globalEAEnabled, setGlobalEAEnabled] = useState(true)
  const [loadingGlobal, setLoadingGlobal] = useState(false)
  
  // ✅ ADICIONADO: Estado para tickets não lidos
  const [unreadTicketsCount, setUnreadTicketsCount] = useState(0)

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser)
      if (!currentUser) {
        navigate('/admin/login')
      }
    })

    return () => unsubscribe()
  }, [navigate])

  useEffect(() => {
    console.log('🚀 useEffect disparado!')
    console.log('👤 user:', user)
    console.log('❓ user existe?', !!user)
    
    if (user) {
      loadUsers()
      loadGlobalEAControl()
      loadUnreadTickets() // ✅ ADICIONADO
      
      // ✅ ADICIONADO: Atualizar tickets a cada 30s
      const interval = setInterval(loadUnreadTickets, 30000)
      return () => clearInterval(interval)
    }
  }, [user])

  const loadUsers = async () => {
    try {
      setLoading(true)

      const usersRef = collection(db, 'artifacts/trade-journal-public/users')
      const snapshot = await getDocs(usersRef)

      const usersList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))

      setUsers(usersList)
    } catch (error) {
      console.error('Erro:', error)
    } finally {
      setLoading(false)
    }
  }

  // ✅ CORRIGIDO: Carregar controle global EA
  const loadGlobalEAControl = async () => {
    try {
      setLoadingGlobal(true)
      // ✅ CAMINHO CORRETO (SEM 'config' no final)
      const controlDoc = await getDoc(doc(db, 'artifacts/trade-journal-public/settings/eaGlobalControl'))
      
      if (controlDoc.exists()) {
        const data = controlDoc.data()
        setGlobalEAEnabled(data.globalEnabled ?? true)
      } else {
        // ✅ Fallback: criar documento se não existir
        await setDoc(doc(db, 'artifacts/trade-journal-public/settings/eaGlobalControl'), {
          globalEnabled: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          updatedBy: 'system-init'
        })
        setGlobalEAEnabled(true)
      }
    } catch (error) {
      console.error('❌ Erro ao carregar controle global EA:', error)
      // Não bloqueia a interface se der erro
      setGlobalEAEnabled(true)
    } finally {
      setLoadingGlobal(false)
    }
  }

  // ✅ ADICIONADO: Função para carregar tickets não lidos
  const loadUnreadTickets = async () => {
    try {
      const count = await getUnreadTicketsCount()
      setUnreadTicketsCount(count)
    } catch (error) {
      console.error('Erro ao carregar tickets não lidos:', error)
    }
  }

  // ✅ CORRIGIDO: Toggle EA global
  const toggleGlobalEA = async () => {
    const action = globalEAEnabled ? 'DESATIVAR' : 'ATIVAR'
    if (!confirm(`⚠️ ${action} EA para TODOS os usuários?\n\nIsso ${globalEAEnabled ? 'bloqueará' : 'desbloqueará'} o envio de trades do MT5.`)) return

    setLoadingGlobal(true)
    try {
      const newStatus = !globalEAEnabled
      // ✅ CAMINHO CORRETO (SEM 'config')
      await setDoc(doc(db, 'artifacts/trade-journal-public/settings/eaGlobalControl'), {
        globalEnabled: newStatus,
        updatedAt: new Date().toISOString(),
        updatedBy: user?.email || 'admin'
      }, { merge: true })

      setGlobalEAEnabled(newStatus)
      alert(`✅ EA ${newStatus ? 'ATIVADO' : 'DESATIVADO'} globalmente!`)
    } catch (error) {
      console.error('❌ Erro ao alternar EA:', error)
      alert('❌ Erro: ' + error.message)
    } finally {
      setLoadingGlobal(false)
    }
  }

  // ✅ Toggle EA individual
  const toggleUserEA = async (userId, currentStatus) => {
    const newStatus = currentStatus === undefined ? false : !currentStatus
    
    try {
      const userRef = doc(db, 'artifacts/trade-journal-public/users', userId)
      await setDoc(userRef, {
        eaEnabled: newStatus,
        eaUpdatedAt: new Date().toISOString()
      }, { merge: true })
      
      setUsers(prev => prev.map(u => 
        u.id === userId ? { ...u, eaEnabled: newStatus } : u
      ))
      
      alert(`✅ EA ${newStatus ? 'ativado' : 'desativado'} para este usuário!`)
    } catch (error) {
      console.error('❌ Erro ao alternar EA do usuário:', error)
      alert('❌ Erro: ' + error.message)
    }
  }

  const addUser = async () => {
    const email = prompt('Email do usuário:')
    if (!email) return

    const userId = prompt('User ID (UID do Firebase):')
    if (!userId) return

    try {
      const userRef = doc(db, 'artifacts/trade-journal-public/users', userId)
      await setDoc(userRef, {
        email,
        isPro: false,
        eaEnabled: true, // ✅ EA habilitado por padrão
        createdAt: new Date().toISOString(),
        lastAccessAt: new Date().toISOString()
      }, { merge: true })

      await loadUsers()
      alert('✅ Usuário adicionado!')
    } catch (error) {
      console.error('❌ Erro ao adicionar usuário:', error)
      alert('❌ Erro: ' + error.message)
    }
  }

  const togglePro = async (userId, currentStatus) => {
    try {
      const userRef = doc(db, 'artifacts/trade-journal-public/users', userId)
      await setDoc(userRef, {
        isPro: !currentStatus,
        proUpdatedAt: new Date().toISOString()
      }, { merge: true })

      setUsers(prev => prev.map(u =>
        u.id === userId ? { ...u, isPro: !currentStatus } : u
      ))

      alert('✅ Status PRO atualizado!')
    } catch (error) {
      console.error('❌ Erro ao atualizar PRO:', error)
      alert('❌ Erro: ' + error.message)
    }
  }

  const deleteUser = async (userId) => {
    if (!confirm('⚠️ Excluir usuário? Esta ação não pode ser desfeita!')) return

    try {
      await deleteDoc(doc(db, 'artifacts/trade-journal-public/users', userId))
      setUsers(prev => prev.filter(u => u.id !== userId))
      alert('✅ Usuário removido!')
    } catch (error) {
      console.error('❌ Erro ao excluir usuário:', error)
      alert('❌ Erro: ' + error.message)
    }
  }

  const handleLogout = async () => {
    if (confirm('Sair do painel admin?')) {
      localStorage.removeItem('adminContext')
      await auth.signOut()
      navigate('/admin/login')
    }
  }

  const formatLastAccess = (timestamp) => {
    if (!timestamp) return 'Nunca'
    
    try {
      const date = new Date(timestamp)
      const now = new Date()
      const diffMs = now - date
      const diffMins = Math.floor(diffMs / 60000)
      const diffHours = Math.floor(diffMs / 3600000)
      const diffDays = Math.floor(diffMs / 86400000)

      if (diffMins < 1) return 'Agora'
      if (diffMins < 60) return `${diffMins}min atrás`
      if (diffHours < 24) return `${diffHours}h atrás`
      if (diffDays < 7) return `${diffDays}d atrás`
      
      return date.toLocaleDateString('pt-BR', { 
        day: '2-digit', 
        month: '2-digit',
        year: '2-digit'
      })
    } catch (error) {
      return 'Inválido'
    }
  }

  const filteredUsers = users.filter(u => {
    const matches = u.email?.toLowerCase().includes(searchTerm.toLowerCase())
    if (filter === 'pro') return matches && u.isPro
    if (filter === 'free') return matches && !u.isPro
    return matches
  })

  const stats = {
    total: users.length,
    pro: users.filter(u => u.isPro).length,
    free: users.filter(u => !u.isPro).length
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
    alert('📋 UID copiado!')
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-xl">Carregando...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-4 md:space-y-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white">⚙️ Painel Admin</h1>
            <p className="text-purple-200 text-sm mt-1 truncate">{user?.email}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {activeTab === 'users' && (
              <>
                <button
                  onClick={loadUsers}
                  className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg backdrop-blur-sm border border-white/20 text-sm font-medium"
                >
                  🔄 Atualizar
                </button>
                <button
                  onClick={addUser}
                  className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg backdrop-blur-sm border border-white/20 text-sm font-medium"
                >
                  + Adicionar
                </button>
              </>
            )}
            <button
              onClick={() => navigate('/')}
              className="px-4 py-2 bg-blue-600/80 hover:bg-blue-700 text-white rounded-lg text-sm font-medium"
            >
              🏠 Sistema
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600/80 hover:bg-red-700 text-white rounded-lg text-sm font-medium"
            >
              🚪 Sair
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 bg-white/10 backdrop-blur-lg p-2 rounded-xl border border-white/20">
          <button
            onClick={() => setActiveTab('users')}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
              activeTab === 'users'
                ? 'bg-white text-purple-900'
                : 'text-white hover:bg-white/10'
            }`}
          >
            👥 Usuários
          </button>
          <button
            onClick={() => setActiveTab('notifications')}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
              activeTab === 'notifications'
                ? 'bg-white text-purple-900'
                : 'text-white hover:bg-white/10'
            }`}
          >
            🔔 Notificações
          </button>
          <button
            onClick={() => setActiveTab('tickets')}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors relative ${
              activeTab === 'tickets'
                ? 'bg-white text-purple-900'
                : 'text-white hover:bg-white/10'
            }`}
          >
            🎧 Suporte
            {/* ✅ ADICIONADO: Badge de tickets não lidos */}
            {unreadTicketsCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center border-2 border-purple-900">
                {unreadTicketsCount}
              </span>
            )}
          </button>
        </div>

        {/* Conteúdo baseado na aba ativa */}
        {activeTab === 'users' ? (
          <>
            {/* ✅ Card Controle Global EA */}
            <div className="bg-gradient-to-r from-orange-500/20 to-red-500/20 backdrop-blur-lg p-4 md:p-6 rounded-xl border-2 border-orange-500/50">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="text-4xl">🤖</div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Controle Global do EA</h3>
                    <p className="text-sm text-purple-200">
                      {globalEAEnabled 
                        ? '✅ Expert Advisors estão ATIVOS para todos os usuários' 
                        : '⛔ Expert Advisors estão BLOQUEADOS globalmente'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={toggleGlobalEA}
                  disabled={loadingGlobal}
                  className={`px-6 py-3 rounded-lg font-bold text-white transition-all ${
                    globalEAEnabled
                      ? 'bg-red-600 hover:bg-red-700'
                      : 'bg-green-600 hover:bg-green-700'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {loadingGlobal ? '⏳ Processando...' : globalEAEnabled ? '🔴 DESATIVAR TODOS' : '🟢 ATIVAR TODOS'}
                </button>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
              <div className="bg-white/10 backdrop-blur-lg p-4 md:p-6 rounded-xl border border-white/20">
                <div className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-white">{stats.total}</div>
                  <div className="text-xs md:text-sm text-purple-200 mt-1">Total de Usuários</div>
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-lg p-4 md:p-6 rounded-xl border border-white/20">
                <div className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-white">{stats.pro}</div>
                  <div className="text-xs md:text-sm text-purple-200 mt-1">Usuários PRO 👑</div>
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-lg p-4 md:p-6 rounded-xl border border-white/20">
                <div className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-white">{stats.free}</div>
                  <div className="text-xs md:text-sm text-purple-200 mt-1">Usuários FREE</div>
                </div>
              </div>
            </div>

            {/* Filtros */}
            <div className="bg-white/10 backdrop-blur-lg p-4 md:p-6 rounded-xl border border-white/20">
              <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
                <input
                  type="text"
                  placeholder="Buscar usuário..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-white/50"
                />
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white/50"
                >
                  <option value="all">Todos</option>
                  <option value="pro">PRO</option>
                  <option value="free">Free</option>
                </select>
              </div>
            </div>

            {/* Tabela de Usuários */}
            <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-white/5">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-purple-200 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-purple-200 uppercase tracking-wider">
                        UID
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-purple-200 uppercase tracking-wider">
                        Último Acesso
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-purple-200 uppercase tracking-wider">
                        Plano
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-purple-200 uppercase tracking-wider">
                        EA Status
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-purple-200 uppercase tracking-wider">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {loading ? (
                      <tr>
                        <td colSpan="6" className="px-4 py-8 text-center text-purple-200">
                          ⏳ Carregando...
                        </td>
                      </tr>
                    ) : filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="px-4 py-8 text-center text-purple-200">
                          Nenhum usuário encontrado
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map(u => {
                        const userEAStatus = u.eaEnabled !== undefined ? u.eaEnabled : true
                        return (
                          <tr key={u.id} className="hover:bg-white/5 transition-colors">
                            <td className="px-4 py-3 text-sm text-white">
                              {u.email}
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-purple-300 font-mono">
                                  {u.id.substring(0, 8)}...
                                </span>
                                <button
                                  onClick={() => copyToClipboard(u.id)}
                                  className="text-purple-400 hover:text-purple-300 text-xs"
                                  title="Copiar UID completo"
                                >
                                  📝
                                </button>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span className="text-xs text-purple-300">
                                {formatLastAccess(u.lastAccessAt)}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-center">
                              {u.isPro ? (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-300">
                                  👑 PRO
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-500/20 text-gray-300">
                                  FREE
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-center">
                              <button
                                onClick={() => toggleUserEA(u.id, userEAStatus)}
                                className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                                  userEAStatus
                                    ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                                    : 'bg-red-500/20 text-red-300 border border-red-500/30'
                                }`}
                              >
                                {userEAStatus ? '🟢 ATIVO' : '🔴 BLOQUEADO'}
                              </button>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex justify-center gap-2">
                                <button
                                  onClick={() => togglePro(u.id, u.isPro)}
                                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                                    u.isPro
                                      ? 'bg-gray-600/80 hover:bg-gray-700 text-white'
                                      : 'bg-yellow-600/80 hover:bg-yellow-700 text-white'
                                  }`}
                                >
                                  {u.isPro ? 'Remover PRO' : 'Ativar PRO'}
                                </button>
                                <button
                                  onClick={() => deleteUser(u.id)}
                                  className="px-3 py-1 bg-red-600/80 hover:bg-red-700 text-white rounded-lg text-xs font-medium transition-colors"
                                >
                                  🗑️ Excluir
                                </button>
                              </div>
                            </td>
                          </tr>
                        )
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : activeTab === 'notifications' ? (
          <NotificationManager />
        ) : (
          <AdminTicketsPage user={user} onTicketUpdate={loadUnreadTickets} />
        )}
      </div>
    </div>
  )
}
