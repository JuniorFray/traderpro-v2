import { Navigate } from 'react-router-dom'
import { useAuth } from '../features/auth/AuthContextAdmin'

export const AdminPrivateRouteForAdminApp = ({ children }) => {
  const { user, loading, isAuthenticated } = useAuth()

  console.log('?? AdminPrivateRoute - Estado:', { user: user?.email, loading, isAuthenticated })

  if (loading) {
    console.log('? Ainda carregando...')
    return (
      <div className='flex items-center justify-center h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900'>
        <div className='text-white text-lg'>Verificando permissões...</div>
      </div>
    )
  }

  if (!isAuthenticated) {
    console.log('? Não autenticado, redirecionando para /login')
    return <Navigate to='/login' replace />
  }

  if (user?.email !== 'juniorfray944@gmail.com') {
    console.log('? Não é admin:', user?.email)
    return (
      <div className='flex items-center justify-center h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900'>
        <div className='text-white text-lg'>Acesso negado. Você não é administrador.</div>
      </div>
    )
  }

  console.log('? Admin autenticado, renderizando children')
  return children
}
