import { Routes, Route, Navigate } from "react-router-dom"
import { useAuth } from "./features/auth/AuthContext"
import { MainLayout } from "./components/layout/MainLayout"
import { Login } from "./features/auth/Login"
import { Dashboard } from "./features/dashboard/Dashboard"
import { TradesPage } from "./features/trades/TradesPage"
import { Calendar } from "./features/calendar/Calendar"
import { Analytics } from "./features/analytics/Analytics"
import { Charts } from "./features/charts/Charts"
import { Reports } from "./features/reports/Reports"
import { Settings } from "./features/settings/Settings"
import { Tools } from "./features/tools/Tools"
import { Admin } from "./features/admin/Admin"
import { AdminRoute } from "./components/AdminRoute"

const PrivateRoute = ({ children }) => {
  const { isAuthenticated } = useAuth()
  return isAuthenticated ? children : <Navigate to="/login" />
}

export const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

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
        <Route path="analytics" element={<Analytics />} />
        <Route path="charts" element={<Charts />} />
        <Route path="reports" element={<Reports />} />
        <Route path="settings" element={<Settings />} />
        <Route path="tools" element={<Tools />} />
      </Route>

      {/* Rota Admin Separada */}
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
