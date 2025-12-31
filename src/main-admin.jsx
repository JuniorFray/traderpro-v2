import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './features/auth/AuthContextAdmin'
import { AdminLogin } from './features/admin/AdminLogin'
import { Admin } from './features/admin/Admin'
import { AdminPrivateRouteForAdminApp } from './components/AdminPrivateRouteForAdminApp'
import './styles/globals.css'

function AdminApp() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path='/login' element={<AdminLogin />} />
          <Route 
            path='/' 
            element={
              <AdminPrivateRouteForAdminApp>
                <Admin />
              </AdminPrivateRouteForAdminApp>
            } 
          />
          <Route path='*' element={<Navigate to='/' replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AdminApp />
  </React.StrictMode>,
)
