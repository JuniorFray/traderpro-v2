import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { useState } from "react"
import { Button, Input, Card, Modal } from "./components/ui"
import { Icons } from "./components/icons"

function App() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [inputValue, setInputValue] = useState("")

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
                <p className="text-zinc-400">Testando Componentes UI</p>
              </div>

              {/* Botões */}
              <Card>
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <Icons.Settings size={20} className="text-accent" />
                  Botões
                </h2>
                <div className="flex flex-wrap gap-3">
                  <Button variant="primary">Primary</Button>
                  <Button variant="secondary">Secondary</Button>
                  <Button variant="success">Success</Button>
                  <Button variant="danger">Danger</Button>
                  <Button variant="ghost">Ghost</Button>
                </div>
              </Card>

              {/* Inputs */}
              <Card>
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <Icons.Edit size={20} className="text-win" />
                  Inputs
                </h2>
                <div className="space-y-4">
                  <Input 
                    label="Nome do Ativo"
                    placeholder="Ex: WINFUT"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                  />
                  <Input 
                    label="Resultado"
                    type="number"
                    placeholder="0.00"
                    error="Valor inválido"
                  />
                </div>
              </Card>

              {/* Modal */}
              <Card>
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <Icons.Eye size={20} className="text-lock" />
                  Modal
                </h2>
                <Button onClick={() => setIsModalOpen(true)}>
                  Abrir Modal
                </Button>
              </Card>

              {/* Ícones */}
              <Card>
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <Icons.Chart size={20} className="text-accent" />
                  Ícones
                </h2>
                <div className="flex flex-wrap gap-4 text-zinc-400">
                  <Icons.Chart size={24} />
                  <Icons.Plus size={24} />
                  <Icons.Trash size={24} />
                  <Icons.Edit size={24} />
                  <Icons.Settings size={24} />
                  <Icons.Crown size={24} />
                  <Icons.LogOut size={24} />
                  <Icons.Download size={24} />
                  <Icons.Calendar size={24} />
                  <Icons.Eye size={24} />
                  <Icons.EyeOff size={24} />
                </div>
              </Card>

              {/* Status */}
              <div className="text-center space-y-2 mt-12">
                <p className="text-zinc-500 text-sm">✅ Componentes UI funcionando</p>
                <p className="text-zinc-500 text-sm">✅ Ícones carregados</p>
                <p className="text-zinc-500 text-sm">✅ Estilos aplicados</p>
              </div>
            </div>

            {/* Modal Component */}
            <Modal 
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
              title="Modal de Teste"
            >
              <div className="space-y-4">
                <p className="text-zinc-300 text-sm">
                  Este é um exemplo de modal funcionando perfeitamente! 🎉
                </p>
                <Input 
                  label="Digite algo"
                  placeholder="Teste aqui..."
                />
                <div className="flex gap-2">
                  <Button 
                    variant="success" 
                    className="flex-1"
                    onClick={() => setIsModalOpen(false)}
                  >
                    Confirmar
                  </Button>
                  <Button 
                    variant="secondary" 
                    className="flex-1"
                    onClick={() => setIsModalOpen(false)}
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            </Modal>
          </div>
        } />
      </Routes>
    </Router>
  )
}

export default App
