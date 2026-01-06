import { useState } from 'react'
import { Card } from '../../components/ui/Card'
import { SimulatorTab } from './SimulatorTab'
import { EconomicNews } from './EconomicNews'
import { Indicadores } from './Indicadores' // ← NOVA IMPORTAÇÃO

export const Tools = () => {
  const [activeTab, setActiveTab] = useState('simulator')

  const tabs = [
    { id: 'simulator', label: 'Simulador TraderPro Global', icon: '📊' },
    { id: 'news', label: 'Notícias Econômicas', icon: '📰' },
{ id: 'indicadores', label: 'Indicadores', icon: '📊' },

  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white">🛠️ Ferramentas</h2>
        <p className="text-zinc-400">Simuladores e utilitários para o seu trading</p>
      </div>

      {/* Abas */}
      <Card className="bg-zinc-900">
        <div className="flex gap-2 overflow-x-auto">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-all
                ${activeTab === tab.id 
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg' 
                  : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white'
                }
              `}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </Card>

      {/* Conteúdo da aba */}
      <div className="mt-4">
        {activeTab === 'simulator' && <SimulatorTab />}
        {activeTab === 'news' && <EconomicNews />}
        {activeTab === 'indicadores' && <Indicadores />} {/* ← NOVO CONTEÚDO */}
      </div>
    </div>
  )
}
