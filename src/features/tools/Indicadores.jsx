import { Card } from '../../components/ui/Card'

export const Indicadores = () => {
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          📊 Indicadores MT5
        </h2>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Indicador profissional para MetaTrader 5. Testado e aprovado.
        </p>
      </div>

      <div className="max-w-2xl mx-auto">
        <Card className="p-8 text-center hover:shadow-xl transition-all group">
          <div className="w-24 h-24 bg-gradient-to-r from-emerald-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
            <span className="text-2xl font-bold text-white">MT5</span>
          </div>
          
          <h3 className="text-2xl font-bold text-gray-900 mb-3">
            TRADER_PRO_-_LOTE CERTO
          </h3>
          
          <p className="text-gray-600 mb-6 text-lg leading-relaxed">
            Calcula automaticamente o tamanho ideal do lote baseado no seu risco e stop loss.
          </p>
          
          <a
            href="https://drive.google.com/file/d/1L5oI7GEmipmfTtNjI5BKRvYd9TtjoorD/view?usp=drive_link"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-emerald-600 to-green-600 text-white font-bold text-lg rounded-xl hover:shadow-2xl hover:scale-105 transition-all shadow-lg"
          >
            📥 Baixar Indicador MT5
            <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10l-5.5 5.5m0 0L12 21l5.5-5.5m-5.5 5.5V8a2 2 0 012-2h4" />
            </svg>
          </a>
          
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              <strong>Compatível com:</strong> MT5 • Windows/Mac • M1-H4
            </p>
          </div>
        </Card>
      </div>

      <Card className="p-6 bg-gradient-to-br from-emerald-50 to-green-50 border-2 border-dashed border-emerald-200">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-green-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-xl font-bold text-white">⚡</span>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Precisa de ajuda?</h3>
          <p className="text-gray-600 mb-4">Problemas para instalar? Abra um ticket!</p>
          <button
            onClick={() => {
              // CLIQUE DIRETO na aba Suporte (encontrada no console)
              const suporteLink = Array.from(document.querySelectorAll('a[href="/app/support"]'))[0]
              if (suporteLink) {
                suporteLink.click()
                // Scroll suave para sidebar
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
