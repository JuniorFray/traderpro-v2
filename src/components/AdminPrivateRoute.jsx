import { Navigate } from "react-router-dom"
import { useAuth } from "../features/auth/AuthContextAdmin"

export const AdminPrivateRoute = ({ children }) => {
  const { user, loading, isAuthenticated } = useAuth()

  console.log('🛡️ AdminPrivateRoute - Estado:', { 
    user: user?.email || 'null', 
    loading, 
    isAuthenticated 
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#0f0a1e]">
        <div className="text-white">Verificando credenciais...</div>
      </div>
    )
  }

  if (!isAuthenticated) {
    console.log('❌ Não autenticado, redirecionando para /admin/login')
    return <Navigate to="/admin/login" replace />
  }

  console.log('✅ Autenticado! Renderizando componente protegido')
  return children
}
