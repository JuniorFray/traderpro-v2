import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../features/auth/AuthContext'
import { Lock, Mail, AlertCircle, Loader2 } from 'lucide-react'

export default function AdminLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  
  const navigate = useNavigate()
  const { signInWithEmail, signInWithGoogle } = useAuth()

  // Login com Email/Senha
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await signInWithEmail(email, password)
      // Sucesso: Vai para o dashboard
      navigate('/admin/dashboard', { replace: true })
    } catch (err) {
      console.error(err)
      setError('Acesso negado ou credenciais inválidas.')
    } finally {
      setLoading(false)
    }
  }

  // Login com Google
  const handleGoogleLogin = async () => {
    setError('')
    setLoading(true)
    try {
      await signInWithGoogle()
      // Sucesso: Vai para o dashboard
      navigate('/admin/dashboard', { replace: true })
    } catch (err) {
      console.error(err)
      setError('Erro no Google. Tente novamente.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0f0a1e] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-[#1a1033] rounded-2xl border border-[#4c1d95]/30 p-8 shadow-2xl shadow-purple-900/20">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[#7c3aed]/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-[#7c3aed]/20">
            <Lock className="w-8 h-8 text-[#a78bfa]" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Admin TraderPro</h1>
          <p className="text-gray-400">Versão Final - Acesso Restrito</p>
        </div>

        {error && (
          <div className="mb-6 bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-center gap-3 text-red-500">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        <div className="space-y-4">
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full bg-white hover:bg-gray-100 text-gray-900 font-bold py-3.5 rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-3 mb-6"
          >
            <span className="text-lg">G</span> Entrar com Google
          </button>

          <div className="relative flex items-center justify-center py-2">
            <div className="absolute w-full border-t border-gray-700"></div>
            <span className="relative bg-[#1a1033] px-4 text-sm text-gray-500">ou use email</span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#24173d] border border-[#4c1d95]/50 rounded-xl px-4 py-3 text-white focus:border-[#8b5cf6] placeholder-gray-600"
                placeholder="admin@traderpro.com"
              />
            </div>
            <div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#24173d] border border-[#4c1d95]/50 rounded-xl px-4 py-3 text-white focus:border-[#8b5cf6] placeholder-gray-600"
                placeholder="Senha"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#7c3aed] hover:bg-[#6d28d9] text-white font-bold py-3.5 rounded-xl transition-all mt-2 shadow-lg shadow-purple-900/40"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Acessar Painel'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
