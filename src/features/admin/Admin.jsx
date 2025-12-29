import { useState, useEffect } from 'react'
import { doc, setDoc, deleteDoc, collection, getDocs } from 'firebase/firestore'
import { db } from '../../services/firebase'
import { Card } from '../../components/ui'
import { useAuth } from '../auth/AuthContext'
import { useNavigate } from 'react-router-dom'

export const Admin = () => {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    try {
      setLoading(true)
      const usersRef = collection(db, 'artifacts/trade-journal-public/adminUsers')
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

  const addUser = async () => {
    const email = prompt('Email do usuario:')
    if (!email) return

    const userId = prompt('User ID (UID do Firebase):')
    if (!userId) return

    try {
      const userRef = doc(db, 'artifacts/trade-journal-public/adminUsers', userId)
      await setDoc(userRef, {
        email,
        isPro: false,
        addedAt: new Date().toISOString()
      })

      await loadUsers()
      alert('Usuario adicionado!')
    } catch (error) {
      alert('Erro: ' + error.message)
    }
  }

  const togglePro = async (userId, currentStatus) => {
    try {
      const adminRef = doc(db, 'artifacts/trade-journal-public/adminUsers', userId)
      await setDoc(adminRef, {
        isPro: !currentStatus,
        updatedAt: new Date().toISOString()
      }, { merge: true })

      const userRef = doc(db, 'artifacts/trade-journal-public/users', userId)
      await setDoc(userRef, {
        isPro: !currentStatus,
        proUpdatedAt: new Date().toISOString()
      }, { merge: true })

      setUsers(prev => prev.map(u =>
        u.id === userId ? { ...u, isPro: !currentStatus } : u
      ))

      alert('Status atualizado!')
    } catch (error) {
      alert('Erro: ' + error.message)
    }
  }

  const deleteUser = async (userId) => {
    if (!confirm('Excluir usuario?')) return

    try {
      await deleteDoc(doc(db, 'artifacts/trade-journal-public/adminUsers', userId))
      setUsers(prev => prev.filter(u => u.id !== userId))
      alert('Usuario removido!')
    } catch (error) {
      alert('Erro: ' + error.message)
    }
  }

  const handleLogout = async () => {
    if (confirm('Sair do painel admin?')) {
      await signOut()
      navigate('/login')
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">🔧 Painel Admin</h1>
            <p className="text-purple-200">Gerenciamento TraderPro - {user?.email}</p>
          </div>
          <div className="flex gap-2">
            <button onClick={loadUsers} className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg backdrop-blur-sm border border-white/20">
              🔄
            </button>
            <button onClick={addUser} className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg backdrop-blur-sm border border-white/20">
              + Adicionar
            </button>
            <button onClick={() => navigate('/')} className="px-4 py-2 bg-blue-600/80 hover:bg-blue-700 text-white rounded-lg">
              🏠 Sistema
            </button>
            <button onClick={handleLogout} className="px-4 py-2 bg-red-600/80 hover:bg-red-700 text-white rounded-lg">
              🚪 Sair
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white/10 backdrop-blur-lg p-6 rounded-xl border border-white/20">
            <div className="text-center">
              <div className="text-4xl font-bold text-white">{stats.total}</div>
              <div className="text-sm text-purple-200 mt-1">Total de Usuários</div>
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-lg p-6 rounded-xl border border-white/20">
            <div className="text-center">
              <div className="text-4xl font-bold text-white">{stats.pro}</div>
              <div className="text-sm text-purple-200 mt-1">Usuários PRO 👑</div>
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-lg p-6 rounded-xl border border-white/20">
            <div className="text-center">
              <div className="text-4xl font-bold text-white">{stats.free}</div>
              <div className="text-sm text-purple-200 mt-1">Usuários FREE</div>
            </div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-lg p-6 rounded-xl border border-white/20">
          <div className="flex gap-4">
            <input
              type="text"
              placeholder="Buscar usuário..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-purple-200 focus:outline-none focus:border-white/40"
            />
            <button onClick={() => setFilter('all')} className={`px-4 py-2 rounded-lg ${filter === 'all' ? 'bg-white text-purple-900 font-semibold' : 'bg-white/10 text-white border border-white/20'}`}>Todos</button>
            <button onClick={() => setFilter('pro')} className={`px-4 py-2 rounded-lg ${filter === 'pro' ? 'bg-white text-purple-900 font-semibold' : 'bg-white/10 text-white border border-white/20'}`}>PRO</button>
            <button onClick={() => setFilter('free')} className={`px-4 py-2 rounded-lg ${filter === 'free' ? 'bg-white text-purple-900 font-semibold' : 'bg-white/10 text-white border border-white/20'}`}>FREE</button>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/20">
                <th className="text-left py-3 px-4 text-sm text-purple-200">Email</th>
                <th className="text-center py-3 px-4 text-sm text-purple-200">Status</th>
                <th className="text-center py-3 px-4 text-sm text-purple-200">Ações</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="3" className="text-center py-8 text-purple-200">Carregando...</td></tr>
              ) : filteredUsers.length === 0 ? (
                <tr><td colSpan="3" className="text-center py-8 text-purple-200">Nenhum usuário encontrado</td></tr>
              ) : (
                filteredUsers.map((u) => (
                  <tr key={u.id} className="border-b border-white/10 hover:bg-white/5">
                    <td className="py-3 px-4 text-sm text-white">{u.email}</td>
                    <td className="py-3 px-4 text-center">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${u.isPro ? 'bg-green-500/30 text-green-200 border border-green-400/50' : 'bg-white/10 text-purple-200 border border-white/20'}`}>
                        {u.isPro ? '👑 PRO' : 'FREE'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex gap-2 justify-center">
                        <button
                          onClick={() => togglePro(u.id, u.isPro)}
                          className={`px-3 py-1 rounded text-xs font-semibold ${u.isPro ? 'bg-yellow-500/30 text-yellow-200 border border-yellow-400/50' : 'bg-green-500/30 text-green-200 border border-green-400/50'}`}
                        >
                          {u.isPro ? '⬇️ Remover PRO' : '⬆️ Ativar PRO'}
                        </button>
                        <button
                          onClick={() => deleteUser(u.id)}
                          className="px-3 py-1 bg-red-500/30 text-red-200 border border-red-400/50 rounded text-xs font-semibold"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
