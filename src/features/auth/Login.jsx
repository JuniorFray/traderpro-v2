import { useAuth } from "./AuthContext"
import { useNavigate } from "react-router-dom"
import { useEffect, useState } from "react"

export const Login = () => {
  const { signInWithGoogle, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/")
    }
  }, [isAuthenticated, navigate])

  const handleGoogleLogin = async () => {
    try {
      await signInWithGoogle()
    } catch (error) {
      console.error("Erro no login:", error)
      alert("Erro ao fazer login. Tente novamente.")
    }
  }

  const handleEmailLogin = (e) => {
    e.preventDefault()
    alert("Login com email/senha em desenvolvimento.\nPor enquanto, use o Google!")
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="bg-zinc-950 border border-zinc-800 p-8 rounded-3xl shadow-2xl w-full max-w-md">
        <div className="text-center mb-8">
          {/* Ícone verde com gráfico */}
          <div className="w-20 h-20 bg-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <svg className="w-12 h-12 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
            </svg>
          </div>
          
          <h1 className="text-3xl font-bold text-white mb-2">
            Trader<span className="text-emerald-500">Pro</span>
          </h1>
          <p className="text-zinc-400 text-sm">Diário de Trade Profissional</p>
        </div>

        {/* Formulário Email/Senha */}
        <form onSubmit={handleEmailLogin} className="space-y-4 mb-4">
          <input
            type="email"
            placeholder="Seu E-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 bg-transparent border border-zinc-800 rounded-xl text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500 transition-colors"
          />
          
          <input
            type="password"
            placeholder="Sua Senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 bg-transparent border border-zinc-800 rounded-xl text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500 transition-colors"
          />

          <button
            type="submit"
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-black font-bold py-3 px-4 rounded-xl transition-all transform hover:scale-[1.02]"
          >
            ENTRAR
          </button>
        </form>

        {/* Botão Google */}
        <button
          onClick={handleGoogleLogin}
          className="w-full bg-white hover:bg-gray-100 text-gray-800 font-semibold py-3 px-4 rounded-xl flex items-center justify-center gap-3 transition-all transform hover:scale-[1.02]"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          ENTRAR COM GOOGLE
        </button>

        <div className="text-center mt-6">
          <p className="text-zinc-600 text-xs">
            Não tem conta?{" "}
            <button type="button" className="text-zinc-400 hover:text-white underline">
              Cadastre-se
            </button>
          </p>
          <p className="text-zinc-600 text-xs mt-2 hover:text-zinc-400 cursor-pointer">
            Esqueceu a senha
          </p>
        </div>
      </div>
    </div>
  )
}
