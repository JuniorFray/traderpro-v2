import { BrowserRouter } from "react-router-dom"
import { AuthProvider } from "./features/auth/AuthContext"
import { CustomerRoutes, AdminRoutes } from "./routes"
import { useEffect, useState } from "react"

function App() {
  const [isAdminDomain, setIsAdminDomain] = useState(false)

  useEffect(() => {
    const hostname = window.location.hostname

    console.log('🌐 Hostname detectado:', hostname)

    // ✅ CORREÇÃO: Detectar TODOS os domínios admin
    const isProductionAdmin = 
      hostname.startsWith('admin.') ||                    // admin.diariotraderpro.com.br
      hostname.includes('meudiariotrade-admin')           // meudiariotrade-admin.web.app

    const isLocalhost = hostname.includes('localhost') || hostname.includes('127.0.0.1')
    const isLocalAdmin = isLocalhost && window.location.pathname.startsWith('/admin')

    if (isProductionAdmin || isLocalAdmin) {
      console.log('✅ Modo ADMIN ativado')
      setIsAdminDomain(true)
    } else {
      console.log('✅ Modo CLIENTE ativado')
      setIsAdminDomain(false)
    }

  }, [])

  return (
    <BrowserRouter>
      <AuthProvider>
        {isAdminDomain ? <AdminRoutes /> : <CustomerRoutes />}
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
