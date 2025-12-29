import { Routes, Route, Navigate } from "react-router-dom"
import { useAuth } from "./features/auth/AuthContext"
import { MainLayout } from "./components/layout/MainLayout"
import { Login } from "./features/auth/Login"
import { Register } from "./features/auth/Register"
import { ForgotPassword } from "./features/auth/ForgotPassword"
import { Dashboard } from "./features/dashboard/Dashboard"
import { TradesPage } from "./features/trades/TradesPage"
import { Calendar } from "./features/calendar/Calendar"
import { Analytics } from "./features/analytics/Analytics"
import { Charts } from "./features/charts/Charts"
import { Reports } from "./features/reports/Reports"
import { Settings } from "./features/settings/Settings"
import { Tools } from "./features/tools/Tools"
import { Admin } from "./features/admin/Admin"
import { ProRoute } from "./components/ProRoute"

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth()
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="text-white">Carregando...</div>
      </div>
    )
  }
  
  return isAuthenticated ? children : <Navigate to="/login" />
}

const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="text-white">Verificando permissões...</div>
      </div>
    )
  }

  if (user?.email !== 'juniorfray944@gmail.com') {
    return <Navigate to="/" replace />
  }

  return children
}

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Rotas Públicas */}
      <Route path="/login" element={<Login />} />
      <Route path="/cadastro" element={<Register />} />
      <Route path="/recuperar-senha" element={<ForgotPassword />} />

      {/* Rotas do sistema principal */}
      <Route
        path="/"
        element={
          <PrivateRoute>
            <MainLayout />
          </PrivateRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="trades" element={<TradesPage />} />
        <Route path="calendar" element={<Calendar />} />
        <Route path="analytics" element={<ProRoute><Analytics /></ProRoute>} />
        <Route path="charts" element={<ProRoute><Charts /></ProRoute>} />
        <Route path="reports" element={<Reports />} />
        <Route path="settings" element={<Settings />} />
        <Route path="tools" element={<Tools />} />
      </Route>

      {/* Rota Admin - FORA do MainLayout */}
      <Route 
        path="/admin" 
        element={
          <PrivateRoute>
            <AdminRoute>
              <Admin />
            </AdminRoute>
          </PrivateRoute>
        } 
      />

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  )
}
