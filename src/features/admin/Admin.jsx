import { useState, useEffect } from 'react'
import { doc, setDoc, getDoc, deleteDoc, collection, getDocs } from 'firebase/firestore'
import { db } from '../../services/firebase'
import { Card } from '../../components/ui'

export const Admin = () => {
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
      // Atualiza na lista admin
      const adminRef = doc(db, 'artifacts/trade-journal-public/adminUsers', userId)
      await setDoc(adminRef, {
        isPro: !currentStatus,
        updatedAt: new Date().toISOString()
      }, { merge: true })
      
      // Atualiza no perfil do usuario
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
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">🔧 Painel Admin</h1>
            <p className="text-zinc-400">Gerenciamento TraderPro</p>
          </div>
          <div className="flex gap-2">
            <button onClick={loadUsers} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg">
              🔄
            </button>
            <button onClick={addUser} className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg">
              + Adicionar
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-gradient-to-br from-blue-900 to-blue-800">
            <div className="text-center">
              <div className="text-4xl font-bold text-white">{stats.total}</div>
              <div className="text-sm text-blue-200 mt-1">Total</div>
            </div>
          </Card>
          <Card className="bg-gradient-to-br from-green-900 to-green-800">
            <div className="text-center">
              <div className="text-4xl font-bold text-white">{stats.pro}</div>
              <div className="text-sm text-green-200 mt-1">PRO 👑</div>
            </div>
          </Card>
          <Card className="bg-gradient-to-br from-zinc-800 to-zinc-900">
            <div className="text-center">
              <div className="text-4xl font-bold text-white">{stats.free}</div>
              <div className="text-sm text-zinc-400 mt-1">FREE</div>
            </div>
          </Card>
        </div>

        <Card>
          <div className="flex gap-4">
            <input
              type="text"
              placeholder="Buscar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
            />
            <button onClick={() => setFilter('all')} className={`px-4 py-2 rounded-lg ${filter === 'all' ? 'bg-purple-600 text-white' : 'bg-zinc-800 text-zinc-400'}`}>Todos</button>
            <button onClick={() => setFilter('pro')} className={`px-4 py-2 rounded-lg ${filter === 'pro' ? 'bg-green-600 text-white' : 'bg-zinc-800 text-zinc-400'}`}>PRO</button>
            <button onClick={() => setFilter('free')} className={`px-4 py-2 rounded-lg ${filter === 'free' ? 'bg-zinc-600 text-white' : 'bg-zinc-800 text-zinc-400'}`}>FREE</button>
          </div>
        </Card>

        <Card>
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="text-left py-3 px-4 text-sm text-zinc-400">Email</th>
                <th className="text-center py-3 px-4 text-sm text-zinc-400">Status</th>
                <th className="text-center py-3 px-4 text-sm text-zinc-400">Acoes</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="3" className="text-center py-8 text-zinc-500">Carregando...</td></tr>
              ) : filteredUsers.length === 0 ? (
                <tr><td colSpan="3" className="text-center py-8 text-zinc-500">Nenhum usuario</td></tr>
              ) : (
                filteredUsers.map((u) => (
                  <tr key={u.id} className="border-b border-zinc-900 hover:bg-zinc-900/50">
                    <td className="py-3 px-4 text-sm text-white">{u.email}</td>
                    <td className="py-3 px-4 text-center">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${u.isPro ? 'bg-green-900/30 text-green-400 border border-green-700' : 'bg-zinc-800 text-zinc-400 border border-zinc-700'}`}>
                        {u.isPro ? '👑 PRO' : 'FREE'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex gap-2 justify-center">
                        <button
                          onClick={() => togglePro(u.id, u.isPro)}
                          className={`px-3 py-1 rounded text-xs font-semibold ${u.isPro ? 'bg-yellow-900/30 text-yellow-400 border border-yellow-800' : 'bg-green-900/30 text-green-400 border border-green-800'}`}
                        >
                          {u.isPro ? '⬇️' : '⬆️'}
                        </button>
                        <button
                          onClick={() => deleteUser(u.id)}
                          className="px-3 py-1 bg-red-900/30 text-red-400 border border-red-800 rounded text-xs font-semibold"
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
        </Card>
      </div>
    </div>
  )
}
