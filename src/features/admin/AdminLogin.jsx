import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  signInWithRedirect,
  GoogleAuthProvider,
  onAuthStateChanged
} from 'firebase/auth'
import { auth } from '../../services/firebase'

export const AdminLogin = () => {
  const [loading, setLoading] = useState(true) // ← Inicia como true
  const [error, setError] = useState('')
  const navigate = useNavigate()

  // ✅ SOLUÇÃO: Detectar login automaticamente
  useEffect(() => {
    console.log('🔍 AdminLogin: Iniciando verificação de autenticação...')
    
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log('👤 onAuthStateChanged disparado. User:', user?.email || 'null')
      
      if (user) {
        console.log('✅ Usuário autenticado:', user.email)
        console.log('🆔 UID:', user.uid)
        
        // Verificar se é admin
        if (user.email === 'juniorfray944@gmail.com') {
          console.log('✅ Admin verificado! Redirecionando para /admin...')
          localStorage.setItem('adminContext', 'true')
          navigate('/admin', { replace: true })
        } else {
          console.log('❌ NÃO é admin. Email:', user.email)
          setError('❌ Você não tem permissão de administrador')
          await auth.signOut()
          setLoading(false)
        }
      } else {
        console.log('ℹ️ Nenhum usuário autenticado')
        setLoading(false)
      }
    })
    
    // Cleanup
    return () => unsubscribe()
  }, [navigate])

  const handleGoogleLogin = async () => {
    try {
      setLoading(true)
      setError('')
      
      console.log('🚀 Iniciando login com Google via redirect...')
      
      const provider = new GoogleAuthProvider()
      await signInWithRedirect(auth, provider)
      
      // O usuário será redirecionado para o Google
      // Quando voltar, onAuthStateChanged detectará automaticamente
      console.log('🔄 Redirecionando para Google...')
    } catch (err) {
      console.error('💥 Erro no login:', err)
      setError(`Erro ao iniciar login: ${err.message}`)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-8 shadow-2xl">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <span className="text-3xl">🔐</span>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Painel Admin</h1>
            <p className="text-purple-200">Área restrita - Acesso administrativo</p>
          </div>

          {error && (
            <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-3 text-red-200 text-sm mb-6">
              {error}
            </div>
          )}

          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full py-3 bg-white hover:bg-gray-100 disabled:bg-white/50 text-gray-900 font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl disabled:cursor-not-allowed flex items-center justify-center gap-3"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
                <span>Processando...</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span>Entrar com Google</span>
              </>
            )}
          </button>

          <div className="mt-6 text-center">
            <a
              href="https://diariotraderpro.com.br"
              className="text-purple-200 hover:text-white text-sm transition-colors"
            >
              ← Voltar ao Sistema Principal
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

