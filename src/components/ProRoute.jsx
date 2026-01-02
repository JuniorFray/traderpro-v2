import { Navigate } from "react-router-dom"
import { useAuth } from "../features/auth/AuthContext"

export const ProRoute = ({ children }) => {
  const { isPro, loading } = useAuth()
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="text-white">Carregando...</div>
      </div>
    )
  }
  
  if (!isPro) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-background px-4">
        <div className="text-6xl mb-4">👑</div>
        <h1 className="text-3xl font-bold text-white mb-2">Recurso PRO</h1>
        <p className="text-zinc-400 text-center mb-6">
          Esta funcionalidade está disponível apenas para usuários PRO
        </p>
        <button
          onClick={() => window.location.href = '/'}
          className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
        >
          Voltar ao Dashboard
        </button>
      </div>
    )
  }
  
  return children
}
