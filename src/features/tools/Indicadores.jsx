import { Card } from '../../components/ui/Card'

export const Indicadores = () => {
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          📊 Indicadores Profissionais
        </h2>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Indicadores para MetaTrader 5 e TradingView. Testados e aprovados.
        </p>
      </div>

      {/* Grid com os 2 indicadores */}
      <div className="grid md:grid-cols-2 gap-6">
        
        {/* INDICADOR 1: MT5 - LOTE CERTO */}
        <Card className="p-8 text-center hover:shadow-xl transition-all group">
          <div className="w-24 h-24 bg-gradient-to-r from-emerald-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
            <span className="text-2xl font-bold text-white">MT5</span>
          </div>
          
          <h3 className="text-2xl font-bold text-gray-900 mb-3">
            TRADER_PRO_-_LOTE CERTO
          </h3>
          
          <p className="text-gray-600 mb-6 text-base leading-relaxed">
            Calcula automaticamente o tamanho ideal do lote baseado no seu risco e stop loss.
          </p>
          
          <a
            href="https://drive.google.com/file/d/1L5oI7GEmipmfTtNjI5BKRvYd9TtjoorD/view?usp=drive_link"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-emerald-600 to-green-600 text-white font-bold rounded-xl hover:shadow-2xl hover:scale-105 transition-all shadow-lg"
          >
            📥 Baixar Indicador MT5
          </a>
          
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              <strong>Compatível:</strong> MT5 • Windows/Mac • M1-H4
            </p>
          </div>
        </Card>

        {/* INDICADOR 2: TradingView - SMC */}
        <Card className="p-8 text-center hover:shadow-xl transition-all group">
          <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
            <span className="text-xl font-bold text-white">📈</span>
          </div>
          
          <h3 className="text-2xl font-bold text-gray-900 mb-3">
            Indicador SMC - TRADER PRO
          </h3>
          
          <p className="text-gray-600 mb-4 text-base leading-relaxed">
            Smart Money Concepts para TradingView. Identifica zonas de ordem e estrutura de mercado.
          </p>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6 text-left">
            <p className="text-sm text-blue-800">
              <strong>💡 Instalação:</strong> Baixe o arquivo, copie o código fonte e cole no Pine Editor do TradingView.
            </p>
          </div>
          
          <a
            href="https://drive.google.com/file/d/1HBoSkuxe4sy-HeTcA2AyexvS9OytdyTZ/view?usp=drive_link"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-xl hover:shadow-2xl hover:scale-105 transition-all shadow-lg"
          >
            📥 Baixar Pine Script
          </a>
          
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              <strong>Compatível:</strong> TradingView • Pine Script v5
            </p>
          </div>
        </Card>

      </div>

      {/* Card de Suporte */}
      <Card className="p-6 bg-gradient-to-br from-emerald-50 to-green-50 border-2 border-dashed border-emerald-200">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-green-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-xl font-bold text-white">⚡</span>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Precisa de ajuda?</h3>
          <p className="text-gray-600 mb-4">Problemas para instalar? Abra um ticket!</p>
          <button
            onClick={() => {
              const suporteLink = Array.from(document.querySelectorAll('a[href="/app/support"]'))[0]
              if (suporteLink) {
                suporteLink.click()
                setTimeout(() => {
                  const sidebar = document.querySelector('nav, [id*="sidebar"], aside')
                  if (sidebar) {
                    sidebar.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
                  }
                }, 200)
              } else {
                window.location.href = '/app/support'
              }
            }}
            className="inline-flex items-center px-6 py-2 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 transition-all shadow-md hover:shadow-lg"
          >
            📧 Abrir Ticket Suporte
          </button>
        </div>
      </Card>
    </div>
  )
}
