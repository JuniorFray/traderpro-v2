import { useState } from "react"
import { Link } from "react-router-dom"
import { sendPasswordResetEmail } from "firebase/auth"
import { auth } from "../../services/firebase"

export const ForgotPassword = () => {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")

  const handleResetPassword = async (e) => {
    e.preventDefault()
    setError("")
    setSuccess(false)

    if (!email) {
      setError("Digite seu email")
      return
    }

    try {
      setLoading(true)
      await sendPasswordResetEmail(auth, email)
      setSuccess(true)
      setEmail("")
    } catch (error) {
      console.error("Erro ao enviar email:", error)
      
      if (error.code === 'auth/user-not-found') {
        setError("Email não encontrado. Verifique e tente novamente.")
      } else if (error.code === 'auth/invalid-email') {
        setError("Email inválido.")
      } else {
        setError("Erro ao enviar email. Tente novamente.")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="bg-zinc-950 border border-zinc-800 p-8 rounded-3xl shadow-2xl w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <svg className="w-12 h-12 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
          </div>
          
          <h1 className="text-3xl font-bold text-white mb-2">
            Recuperar Senha
          </h1>
          <p className="text-zinc-400 text-sm">Enviaremos um link para redefinir sua senha</p>
        </div>

        {success && (
          <div className="mb-4 p-4 bg-emerald-900/30 border border-emerald-800 rounded-xl text-emerald-400 text-sm">
            <p className="font-semibold mb-1">✅ Email enviado!</p>
            <p>Verifique sua caixa de entrada e siga as instruções para redefinir sua senha.</p>
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-red-900/30 border border-red-800 rounded-xl text-red-400 text-sm text-center">
            {error}
          </div>
        )}

        {!success && (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <input
              type="email"
              placeholder="Seu E-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              className="w-full px-4 py-3 bg-transparent border border-zinc-800 rounded-xl text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500 transition-colors disabled:opacity-50"
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-black font-bold py-3 px-4 rounded-xl transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "ENVIANDO..." : "ENVIAR LINK DE RECUPERAÇÃO"}
            </button>
          </form>
        )}

        <div className="text-center mt-6">
          <Link to="/login" className="text-zinc-600 hover:text-zinc-400 text-xs">
            ← Voltar para o login
          </Link>
        </div>
      </div>
    </div>
  )
}
