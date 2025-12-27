import { Routes, Route, Navigate } from "react-router-dom"
import { useAuth } from "./features/auth/AuthContext"
import { MainLayout } from "./components/layout/MainLayout"
import { Login } from "./features/auth/Login"
import { Dashboard } from "./features/dashboard/Dashboard"
import { TradesPage } from "./features/trades/TradesPage"
import { Calendar } from "./features/calendar/Calendar"
import { Analytics } from "./features/analytics/Analytics"
import { Settings } from "./features/settings/Settings"

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
        <Route path="settings" element={<Settings />} />
      </Route>

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  )
}
