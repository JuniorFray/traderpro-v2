import { Navigate } from 'react-router-dom'
import { useAuth } from '../features/auth/AuthContextAdmin'

export const AdminPrivateRouteForAdminApp = ({ children }) => {
  const { user, loading, isAuthenticated } = useAuth()

  console.log('?? AdminPrivateRoute - Estado:', { user: user?.email, loading, isAuthenticated })

  if (loading) {
    console.log('? Ainda carregando...')
    return (
      <div className='flex items-center justify-center h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900'>
        <div className='text-white text-lg'>Verificando permiss�es...</div>
      </div>
    )
  }

  if (!isAuthenticated) {
    console.log('? N�o autenticado, redirecionando para /login')
    return <Navigate to='/login' replace />
  }

  if (user?.email !== 'juniorfray944@gmail.com') {
    console.log('? N�o � admin:', user?.email)
    return (
      <div className='flex items-center justify-center h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900'>
        <div className='text-white text-lg'>Acesso negado. Voc� n�o � administrador.</div>
      </div>
    )
  }

  console.log('? Admin autenticado, renderizando children')
  return children
}
