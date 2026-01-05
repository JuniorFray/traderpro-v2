// src/features/tools/EconomicNews.jsx - VERSÃO FINAL OFICIAL

import { useState, useEffect } from 'react'
import { Card } from '../../components/ui/Card'

export const EconomicNews = () => {
  const [widgetLoaded, setWidgetLoaded] = useState(false)

  useEffect(() => {
    setWidgetLoaded(true)
  }, [])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">📰 Calendário Econômico</h2>
        <p className="text-zinc-400 mb-4">
          Principais eventos econômicos que impactam USD, EUR, GBP e JPY
        </p>
        
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <span className="text-xl">ℹ️</span>
            <div className="text-sm">
              <p className="font-bold text-blue-300 mb-1">Filtros:</p>
              <div className="flex flex-wrap gap-4 text-xs text-zinc-300">
                <span>🌍 Moedas principais</span>
                <span>⭐⭐⭐ 2 e 3 estrelas</span>
                <span>🕐 Horário de Brasília</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Widget Oficial Investing.com */}
      <Card className="overflow-hidden">
        {!widgetLoaded ? (
          <div className="h-[500px] flex items-center justify-center bg-zinc-900 rounded-lg">
            <div className="text-center animate-pulse">
              <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-zinc-400">Carregando calendário...</p>
            </div>
          </div>
        ) : (
          <>
            <div className="p-2">
              <iframe 
                src="https://sslecal2.investing.com?columns=exc_flags,exc_currency,exc_importance,exc_actual,exc_forecast,exc_previous&features=datepicker,timezone,timeselector,filters&countries=110,17,29,25,32,6,37,26,5,22,39,14,48,10,35,7,43,38,4,36,12,72&calType=week&timeZone=12&lang=12" 
                width="100%" 
                height="500" 
                frameBorder="0" 
                allowtransparency="true" 
                marginWidth="0" 
                marginHeight="0"
                className="w-full rounded-lg"
                title="Calendário Econômico Investing.com"
                loading="lazy"
              />
            </div>
            
            {/* Créditos oficiais */}
            <div className="px-4 pb-4 text-center text-xs text-zinc-500">
              <span>
                Calendário Econômico fornecido por{' '}
                <a 
                  href="https://br.investing.com/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 font-semibold"
                >
                  Investing.com Brasil
                </a>
              </span>
            </div>
          </>
        )}
      </Card>

      {/* Legenda */}
      <Card className="bg-zinc-900/50 border-zinc-700">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          📖 Como interpretar
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
          <div>
            <h4 className="font-semibold text-zinc-200 mb-2">⭐ Importância</h4>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-red-400 text-lg">⭐⭐⭐</span>
                <span className="text-white">Alta - Alto impacto</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-orange-400 text-lg">⭐⭐</span>
                <span className="text-zinc-300">Média - Impacto moderado</span>
              </div>
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-zinc-200 mb-2">📊 Colunas</h4>
            <div className="space-y-1 text-xs">
              <div><span className="text-white">Real:</span> Dado publicado</div>
              <div><span className="text-white">Previsão:</span> Expectativa do mercado</div>
              <div><span className="text-white">Anterior:</span> Último resultado</div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
