import { Navigate } from "react-router-dom"
import { useAuth } from "../features/auth/AuthContext"
import { auth } from "../services/firebase"
import { useEffect } from "react"

export const AdminPrivateRoute = ({ children }) => {
  const { user, loading, isAuthenticated } = useAuth()

  // Se o usuário logado NÃO for o admin, força logout imediato
  useEffect(() => {
    if (!loading && user && user.email !== "juniorfray944@gmail.com") {
      console.warn("Usuário não autorizado no Admin. Deslogando...")
      auth.signOut()
    }
  }, [user, loading])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#0f0a1e]">
        <div className="text-white">Verificando credenciais...</div>
      </div>
    )
  }

  // Se não estiver logado
  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />
  }

  // Se estiver logado com email errado (bloqueio visual extra)
  if (user?.email !== "juniorfray944@gmail.com") {
    return <Navigate to="/admin/login" replace />
  }

  return children
}
