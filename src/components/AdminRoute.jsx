import { Navigate } from "react-router-dom"
import { useAuth } from "../features/auth/AuthContext"

export const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth()

  console.log('AdminRoute - Email do usuário:', user?.email)
  console.log('AdminRoute - Loading:', loading)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="text-white">Carregando...</div>
      </div>
    )
  }

  // Apenas o email juniorfray944@gmail.com pode acessar
  if (user?.email !== 'juniorfray944@gmail.com') {
    console.log('Acesso negado! Redirecionando para /')
    return <Navigate to="/" replace />
  }

  console.log('Acesso permitido ao Admin!')
  return children
}
