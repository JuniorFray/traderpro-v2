import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './features/auth/AuthContext'
import { MainLayout } from './components/layout/MainLayout'
import { Login } from './features/auth/Login'
import { Register } from './features/auth/Register'
import { ForgotPassword } from './features/auth/ForgotPassword'
import { Dashboard } from './features/dashboard/Dashboard'
import { TradesPage } from './features/trades/TradesPage'
import { Calendar } from './features/calendar/Calendar'
import { Analytics } from './features/analytics/Analytics'
import { Charts } from './features/charts/Charts'
import { Reports } from './features/reports/Reports'
import { Settings } from './features/settings/Settings'
import { Tools } from './features/tools/Tools'
import { Admin } from './features/admin/Admin'
import { ProRoute } from './components/ProRoute'
import { AdminPrivateRoute } from './components/AdminPrivateRoute'
import { LandingWrapper } from './pages/LandingWrapper'
import AdminLogin from './pages/admin/AdminLogin'

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth()
  if (loading) return <div className="flex items-center justify-center h-screen bg-black text-white">Carregando...</div>
  return isAuthenticated ? children : <Navigate to="/login" />
}

export const CustomerRoutes = () => {
  return (
    <Routes>
      {/* Landing Page Pública */}
      <Route path="/" element={<LandingWrapper />} />
      
      {/* Auth */}
      <Route path="/login" element={<Login />} />
      <Route path="/cadastro" element={<Register />} />
      <Route path="/recuperar-senha" element={<ForgotPassword />} />
      
      {/* Sistema Principal (após login) */}
      <Route path="/app" element={<PrivateRoute><MainLayout /></PrivateRoute>}>
        <Route index element={<Dashboard />} />
        <Route path="trades" element={<TradesPage />} />
        <Route path="calendar" element={<Calendar />} />
        <Route path="analytics" element={<ProRoute><Analytics /></ProRoute>} />
        <Route path="charts" element={<ProRoute><Charts /></ProRoute>} />
        <Route path="reports" element={<Reports />} />
        <Route path="settings" element={<Settings />} />
        <Route path="tools" element={<Tools />} />
      </Route>
      
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export const AdminRoutes = () => {
  return (
    <Routes>
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route 
        path="/admin/*" 
        element={
          <AdminPrivateRoute>
            <Admin />
          </AdminPrivateRoute>
        } 
      />
      <Route path="*" element={<Navigate to="/admin/login" replace />} />
    </Routes>
  )
}
