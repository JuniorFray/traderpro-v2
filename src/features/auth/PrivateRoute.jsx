import { Navigate } from "react-router-dom"
import { useAuth } from "./AuthContext"
import { Loading } from "../../components/ui/Loading"

export const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth()

  if (loading) {
    return <Loading fullscreen />
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return children
}
