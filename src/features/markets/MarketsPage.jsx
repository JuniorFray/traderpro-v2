import { useState } from 'react'
import { useTrades } from '../../hooks/useTrades'
import { Card } from '../../components/ui/Card'
import { DayTradeDashboard } from './DayTradeDashboard'
import { ForexDashboard } from './ForexDashboard'
import { SwingTradeDashboard } from './SwingTradeDashboard'
import { OptionsDashboard } from './OptionsDashboard'
import { ConsolidatedDashboard } from './ConsolidatedDashboard'

export const MarketsPage = () => {
  const { trades, loading } = useTrades()
  const [activeMarket, setActiveMarket] = useState('consolidated')

  const marketTabs = [
    { id: 'consolidated', label: 'Consolidado', icon: '📊' },
    { id: 'daytrade', label: 'Day Trade', icon: '⚡' },
    { id: 'swing', label: 'Swing Trade', icon: '📈' },
    { id: 'forex', label: 'Forex', icon: '💱' },
    { id: 'options', label: 'Opções', icon: '🎯' }
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-zinc-400">Carregando dados...</div>
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="px-1">
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1 sm:mb-2">Mercados</h1>
        <p className="text-sm sm:text-base text-zinc-400">Análise detalhada por tipo de mercado</p>
      </div>

      {/* Tabs de Mercados - Responsivo com scroll */}
      <div className="overflow-x-auto scrollbar-hide -mx-4 sm:mx-0">
        <div className="flex gap-2 bg-zinc-900 p-2 rounded-xl border border-zinc-800 min-w-max px-4 sm:px-2">
          {marketTabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveMarket(tab.id)}
              className={`
                flex items-center gap-1.5 sm:gap-2
                px-3 sm:px-6 py-2.5 sm:py-3 
                rounded-lg font-medium 
                transition-all duration-200
                whitespace-nowrap
                text-sm sm:text-base
                ${
                  activeMarket === tab.id
                    ? 'bg-primary text-black shadow-lg scale-105'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                }
              `}
            >
              <span className="text-lg sm:text-xl">{tab.icon}</span>
              <span className="font-medium">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Conteúdo dos Dashboards */}
      <div className="animate-fadeIn">
        {activeMarket === 'consolidated' && <ConsolidatedDashboard trades={trades} />}
        {activeMarket === 'daytrade' && <DayTradeDashboard trades={trades} />}
        {activeMarket === 'swing' && <SwingTradeDashboard trades={trades} />}
        {activeMarket === 'forex' && <ForexDashboard trades={trades} />}
        {activeMarket === 'options' && <OptionsDashboard trades={trades} />}
      </div>
    </div>
  )
}
