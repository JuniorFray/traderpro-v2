import { useState, useEffect } from 'react'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '../../services/firebase'
import { 
  createNotification,
  updateNotification, 
  deleteNotification, 
  getAllNotifications 
} from '../../services/notifications'
import { Input } from '../../components/ui/Input'
import { Select } from '../../components/ui/Select'
import { Button } from '../../components/ui/Button'

export const NotificationManager = () => {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [userSearch, setUserSearch] = useState('')
  const [foundUser, setFoundUser] = useState(null)
  const [allUsers, setAllUsers] = useState([])

  const [formData, setFormData] = useState({
    title: '',
    message: '',
    type: 'global',
    category: 'news',
    style: 'info',
    targetUserId: '',
    actionButton: {
      text: '',
      url: ''
    },
    scheduledFor: ''
  })

  useEffect(() => {
    loadNotifications()
    loadAllUsers()
  }, [])

  const loadAllUsers = async () => {
    try {
      const usersRef = collection(db, 'artifacts/trade-journal-public/adminUsers')
      const snapshot = await getDocs(usersRef)
      const users = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      setAllUsers(users)
    } catch (error) {
      console.error('Erro ao carregar usuários:', error)
    }
  }

  const handleSearchUser = () => {
    const user = allUsers.find(u => 
      u.email?.toLowerCase().includes(userSearch.toLowerCase())
    )
    if (user) {
      setFoundUser(user)
      setFormData({ ...formData, targetUserId: user.id })
    } else {
      alert('Usuário não encontrado!')
      setFoundUser(null)
    }
  }

  const loadNotifications = async () => {
    try {
      setLoading(true)
      const data = await getAllNotifications()
      setNotifications(data)
    } catch (error) {
      console.error('Erro ao carregar notificações:', error)
      alert('Erro ao carregar notificações')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      setLoading(true)
      
      if (editingId) {
        await updateNotification(editingId, formData)
        alert('Notificação atualizada!')
      } else {
        await createNotification(formData)
        alert('Notificação criada!')
      }
      
      resetForm()
      await loadNotifications()
    } catch (error) {
      console.error('Erro:', error)
      alert('Erro ao salvar notificação: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (notification) => {
    setFormData({
      title: notification.title,
      message: notification.message,
      type: notification.type,
      category: notification.category,
      style: notification.style,
      targetUserId: notification.targetUserId || '',
      actionButton: notification.actionButton || { text: '', url: '' },
      scheduledFor: notification.scheduledFor || ''
    })
    setEditingId(notification.id)
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (!confirm('Excluir esta notificação?')) return
    
    try {
      setLoading(true)
      await deleteNotification(id)
      alert('Notificação excluída!')
      await loadNotifications()
    } catch (error) {
      console.error('Erro:', error)
      alert('Erro ao excluir')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      title: '',
      message: '',
      type: 'global',
      category: 'news',
      style: 'info',
      targetUserId: '',
      actionButton: { text: '', url: '' },
      scheduledFor: ''
    })
    setEditingId(null)
    setShowForm(false)
    setUserSearch('')
    setFoundUser(null)
  }

  const getStyleBadge = (style) => {
    const styles = {
      info: 'bg-blue-500/20 text-blue-300',
      success: 'bg-green-500/20 text-green-300',
      warning: 'bg-yellow-500/20 text-yellow-300',
      error: 'bg-red-500/20 text-red-300'
    }
    return styles[style] || styles.info
  }

  const getCategoryIcon = (category) => {
    const icons = {
      news: '🎉',
      warning: '⚠️',
      promotion: '🎁',
      tip: '💡',
      system: '🔧'
    }
    return icons[category] || '📢'
  }

  return (
    <div className="space-y-6">
      
      {/* Header com botão */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">
          🔔 Gerenciar Notificações
        </h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors"
        >
          {showForm ? '❌ Cancelar' : '+ Nova Notificação'}
        </button>
      </div>

      {/* Formulário */}
      {showForm && (
        <div className="bg-white/10 backdrop-blur-lg p-6 rounded-xl border border-white/20">
          <h3 className="text-xl font-bold text-white mb-4">
            {editingId ? '✏️ Editar Notificação' : '➕ Nova Notificação'}
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            
            <Input
              label="Título da Notificação"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Ex: Nova funcionalidade disponível!"
              required
            />

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Mensagem
              </label>
              <textarea
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="Descreva a notificação em detalhes..."
                required
                rows={4}
                className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="Tipo de Notificação"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                options={[
                  { value: 'global', label: '🌍 Global (Todos)' },
                  { value: 'individual', label: '👤 Individual' },
                  { value: 'pro', label: '👑 Apenas PRO' },
                  { value: 'free', label: '🆓 Apenas Free' }
                ]}
              />

              <Select
                label="Categoria"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                options={[
                  { value: 'news', label: '🎉 Novidades' },
                  { value: 'warning', label: '⚠️ Avisos' },
                  { value: 'promotion', label: '🎁 Promoções' },
                  { value: 'tip', label: '💡 Dicas' },
                  { value: 'system', label: '🔧 Sistema' }
                ]}
              />

              <Select
                label="Estilo Visual"
                value={formData.style}
                onChange={(e) => setFormData({ ...formData, style: e.target.value })}
                options={[
                  { value: 'info', label: '🔵 Info' },
                  { value: 'success', label: '🟢 Sucesso' },
                  { value: 'warning', label: '🟡 Aviso' },
                  { value: 'error', label: '🔴 Erro' }
                ]}
              />

              <Input
                label="Agendar Para (opcional)"
                type="datetime-local"
                value={formData.scheduledFor}
                onChange={(e) => setFormData({ ...formData, scheduledFor: e.target.value })}
              />
            </div>

            {formData.type === 'individual' && (
              <div className="border border-zinc-700 rounded-xl p-4 space-y-3">
                <h4 className="text-sm font-medium text-zinc-400">
                  🔍 Buscar Destinatário
                </h4>
                
                <div className="flex gap-2">
                  <Input
                    label="Email do Usuário"
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    placeholder="Digite o email para buscar..."
                    className="flex-1"
                  />
                  <button
                    type="button"
                    onClick={handleSearchUser}
                    className="mt-6 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors"
                  >
                    Buscar
                  </button>
                </div>

                {foundUser && (
                  <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
                    <div className="text-sm text-green-300 mb-1">✅ Usuário Encontrado:</div>
                    <div className="text-white font-medium">{foundUser.email}</div>
                    <div className="text-xs text-zinc-400 font-mono mt-1">UID: {foundUser.id}</div>
                    {foundUser.isPro && (
                      <span className="inline-block mt-2 text-xs bg-yellow-500/20 text-yellow-300 px-2 py-0.5 rounded-full">
                        👑 PRO
                      </span>
                    )}
                  </div>
                )}

                <Input
                  label="User ID (Preenchido automaticamente)"
                  value={formData.targetUserId}
                  onChange={(e) => setFormData({ ...formData, targetUserId: e.target.value })}
                  placeholder="Busque o usuário acima ou cole o UID aqui"
                  required
                  disabled={!!foundUser}
                />
              </div>
            )}

            <div className="border border-zinc-700 rounded-xl p-4 space-y-3">
              <h4 className="text-sm font-medium text-zinc-400">
                🔘 Botão de Ação (opcional)
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Texto do Botão"
                  value={formData.actionButton.text}
                  onChange={(e) => setFormData({
                    ...formData,
                    actionButton: { ...formData.actionButton, text: e.target.value }
                  })}
                  placeholder="Ex: Ver Novidades"
                />

                <Input
                  label="URL do Botão"
                  value={formData.actionButton.url}
                  onChange={(e) => setFormData({
                    ...formData,
                    actionButton: { ...formData.actionButton, url: e.target.value }
                  })}
                  placeholder="Ex: /dashboard"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-700 text-white rounded-xl font-medium transition-colors"
              >
                {loading ? '⏳ Salvando...' : editingId ? '✅ Atualizar' : '✅ Criar'}
              </button>
              
              <button
                type="button"
                onClick={resetForm}
                className="px-6 py-3 bg-zinc-700 hover:bg-zinc-600 text-white rounded-xl font-medium transition-colors"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Lista de Notificações */}
      <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 overflow-hidden">
        <div className="p-4 border-b border-white/10">
          <h3 className="text-lg font-bold text-white">
            📋 Notificações Criadas ({notifications.length})
          </h3>
        </div>

        <div className="divide-y divide-white/5">
          {loading && notifications.length === 0 ? (
            <div className="p-8 text-center text-purple-200">
              Carregando...
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-8 text-center text-purple-200">
              Nenhuma notificação criada ainda
            </div>
          ) : (
            notifications.map(notif => (
              <div key={notif.id} className="p-4 hover:bg-white/5 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-2xl">{getCategoryIcon(notif.category)}</span>
                      <h4 className="text-white font-semibold">{notif.title}</h4>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStyleBadge(notif.style)}`}>
                        {notif.style}
                      </span>
                      {!notif.isActive && (
                        <span className="px-2 py-0.5 bg-zinc-600/50 text-zinc-300 rounded-full text-xs">
                          Desativada
                        </span>
                      )}
                    </div>

                    <p className="text-sm text-zinc-300">{notif.message}</p>

                    <div className="flex flex-wrap gap-2 text-xs text-zinc-400">
                      <span className="bg-zinc-800/50 px-2 py-1 rounded">
                        Tipo: {notif.type}
                      </span>
                      <span className="bg-zinc-800/50 px-2 py-1 rounded">
                        Visualizações: {notif.stats?.views || 0}
                      </span>
                      {notif.scheduledFor && (
                        <span className="bg-blue-500/20 text-blue-300 px-2 py-1 rounded">
                          ⏰ Agendada
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(notif)}
                      className="px-3 py-1 bg-blue-600/80 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDelete(notif.id)}
                      className="px-3 py-1 bg-red-600/80 hover:bg-red-700 text-white rounded-lg text-sm transition-colors"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
