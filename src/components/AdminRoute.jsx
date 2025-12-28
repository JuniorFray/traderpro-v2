import { Navigate } from "react-router-dom"
import { useAuth } from "../features/auth/AuthContext"

export const AdminRoute = ({ children }) => {
  const { user } = useAuth()
  
  // Apenas o email juniorfray944@gmail.com pode acessar
  if (user?.email !== 'juniorfray944@gmail.com') {
    return <Navigate to="/" replace />
  }
  
  return children
}
