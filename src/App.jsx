import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={
          <div className="min-h-screen bg-bg flex items-center justify-center">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-win to-green-600 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                <span className="text-black font-black text-3xl">TP</span>
              </div>
              <h1 className="text-4xl font-black text-white mb-4">
                TraderPro <span className="text-win">v2.0</span>
              </h1>
              <p className="text-zinc-400 text-lg">
                Sistema inicializado com sucesso! 🚀
              </p>
              <div className="mt-8 space-y-2">
                <p className="text-zinc-500 text-sm">✅ Vite configurado</p>
                <p className="text-zinc-500 text-sm">✅ React funcionando</p>
                <p className="text-zinc-500 text-sm">✅ TailwindCSS ativo</p>
                <p className="text-zinc-500 text-sm">✅ Firebase pronto</p>
              </div>
            </div>
          </div>
        } />
      </Routes>
    </Router>
  )
}

export default App
