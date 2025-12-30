import { Navigate } from "react-router-dom"
import { useAuth } from "../features/auth/AuthContext"

export const AdminPrivateRoute = ({ children }) => {
  const { user, loading, isAuthenticated } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900">
        <div className="text-white text-lg">Verificando permissões...</div>
      </div>
    )
  }

  // Se não está autenticado, vai para login do admin
  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />
  }

  // Se está autenticado mas não é admin, bloqueia
  if (user?.email !== 'juniorfray944@gmail.com') {
    return <Navigate to="/" replace />
  }

  return children
}
