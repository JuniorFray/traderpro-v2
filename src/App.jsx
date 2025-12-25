import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { useState, useEffect } from "react"
import { Button, Card, Loading } from "./components/ui"
import { Icons } from "./components/icons"
import { auth } from "./services/firebase"

function App() {
  const [firebaseStatus, setFirebaseStatus] = useState("checking")

  useEffect(() => {
    // Testar conexão Firebase
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setFirebaseStatus("connected")
    })
    
    return () => unsubscribe()
  }, [])

  if (firebaseStatus === "checking") {
    return <Loading fullscreen />
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={
          <div className="min-h-screen bg-bg p-8">
            <div className="max-w-4xl mx-auto space-y-8">
              {/* Header */}
              <div className="text-center mb-12">
                <div className="w-20 h-20 bg-gradient-to-br from-win to-green-600 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                  <span className="text-black font-black text-3xl">TP</span>
                </div>
                <h1 className="text-4xl font-black text-white mb-4">
                  TraderPro <span className="text-win">v2.0</span>
                </h1>
                <p className="text-zinc-400">Passos 1, 2 e 3 Concluídos!</p>
              </div>

              {/* Status */}
              <Card>
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <Icons.Settings size={20} className="text-win" />
                  Status do Sistema
                </h2>
                <div className="space-y-2">
                  <p className="text-zinc-300 text-sm flex items-center gap-2">
                    <span className="w-2 h-2 bg-win rounded-full animate-pulse"></span>
                    ✅ Vite + React
                  </p>
                  <p className="text-zinc-300 text-sm flex items-center gap-2">
                    <span className="w-2 h-2 bg-win rounded-full animate-pulse"></span>
                    ✅ TailwindCSS
                  </p>
                  <p className="text-zinc-300 text-sm flex items-center gap-2">
                    <span className="w-2 h-2 bg-win rounded-full animate-pulse"></span>
                    ✅ Componentes UI
                  </p>
                  <p className="text-zinc-300 text-sm flex items-center gap-2">
                    <span className="w-2 h-2 bg-win rounded-full animate-pulse"></span>
                    ✅ Firebase Conectado
                  </p>
                </div>
              </Card>

              {/* Próximos Passos */}
              <Card>
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <Icons.Chart size={20} className="text-accent" />
                  Próximos Passos
                </h2>
                <div className="space-y-3">
                  <div className="p-3 bg-white/5 rounded-lg">
                    <p className="text-zinc-300 text-sm font-bold">Passo 4: Sistema de Login</p>
                    <p className="text-zinc-500 text-xs mt-1">AuthContext + tela de login</p>
                  </div>
                  <div className="p-3 bg-white/5 rounded-lg opacity-50">
                    <p className="text-zinc-300 text-sm font-bold">Passo 5: Sistema de Trades</p>
                    <p className="text-zinc-500 text-xs mt-1">CRUD completo + calendário</p>
                  </div>
                  <div className="p-3 bg-white/5 rounded-lg opacity-50">
                    <p className="text-zinc-300 text-sm font-bold">Passo 6: Dashboard e Gráficos</p>
                    <p className="text-zinc-500 text-xs mt-1">Métricas + charts</p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        } />
      </Routes>
    </Router>
  )
}

export default App
