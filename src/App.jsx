import { BrowserRouter } from "react-router-dom"
import { AuthProvider } from "./features/auth/AuthContext"
import { CustomerRoutes, AdminRoutes } from "./routes"
import { useEffect, useState } from "react"

function App() {
  // Estado para saber qual "modo" o site deve carregar
  const [isAdminDomain, setIsAdminDomain] = useState(false)

  useEffect(() => {
    const hostname = window.location.hostname
    
    // Verifica se é o domínio admin (ou localhost rodando na rota /admin para testes)
    // Se o seu domínio no Firebase é "meudiariotrade-29864.web.app", precisamos tratar ele como principal
    // E "admin.diariotraderpro.com.br" como admin.
    
    const isLocalhost = hostname.includes('localhost') || hostname.includes('127.0.0.1')
    const isProductionAdmin = hostname.startsWith('admin.')
    
    // Lógica simples:
    // 1. Produção: Se começar com "admin.", é admin.
    // 2. Localhost: Se a URL atual começar com /admin, forçamos o modo admin para testar.
    
    if (isProductionAdmin) {
      setIsAdminDomain(true)
    } else if (isLocalhost && window.location.pathname.startsWith('/admin')) {
      setIsAdminDomain(true)
    } else {
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
