import { useState } from 'react'
import { useTrades } from '../../hooks/useTrades'
import { Card } from '../../components/ui/Card'
import { TradeFilters } from '../../components/filters/TradeFilters'
import { formatCurrency } from '../../utils/metrics'
import { LineChart, Line, AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

export const Charts = () => {
  const { trades, loading } = useTrades()
  const [filters, setFilters] = useState({ 
    startDate: '', 
    endDate: '', 
    symbol: '', 
    strategy: '', 
    result: 'all' 
  })

  if (loading) return <div className="text-center p-8 text-zinc-400">Carregando...</div>

  // Aplicar filtros
  const filteredTrades = trades.filter(trade => {
    const tradePnl = parseFloat(trade.pnl) || 0
    if (filters.startDate && trade.date < filters.startDate) return false
    if (filters.endDate && trade.date > filters.endDate) return false
    if (filters.symbol && !(trade.asset || trade.symbol || '').toLowerCase().includes(filters.symbol.toLowerCase())) return false
    if (filters.strategy && !(trade.strategy || '').toLowerCase().includes(filters.strategy.toLowerCase())) return false
    if (filters.result === 'win' && tradePnl <= 0) return false
    if (filters.result === 'loss' && tradePnl >= 0) return false
    return true
  })

  // Ordenar trades por data
  const sortedTrades = [...filteredTrades].sort((a, b) => new Date(a.date) - new Date(b.date))

  // Calcular Equity Curve (Curva de Capital)
  let cumulativePnL = 0
  const equityCurve = sortedTrades.map(trade => {
    const tradePnl = parseFloat(trade.pnl) || 0
    cumulativePnL += tradePnl
    return {
      date: new Date(trade.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
      equity: cumulativePnL,
      pnl: tradePnl
    }
  })

  // Calcular Drawdown
  let peak = 0
  const drawdownData = equityCurve.map(point => {
    if (point.equity > peak) peak = point.equity
    const drawdown = peak - point.equity
    const drawdownPercent = peak !== 0 ? (drawdown / peak) * 100 : 0
    return {
      date: point.date,
      drawdown: -drawdown,
      drawdownPercent: -drawdownPercent
    }
  })

  // Agrupar P&L por mes e ordenar
  const monthlyPnL = filteredTrades.reduce((acc, trade) => {
    const tradePnl = parseFloat(trade.pnl) || 0
    const date = new Date(trade.date)
    const year = date.getFullYear()
    const month = date.getMonth()
    const key = `${year}-${String(month + 1).padStart(2, '0')}`
    const monthYear = date.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })
    
    if (!acc[key]) acc[key] = { monthYear, pnl: 0, sortKey: date.getTime() }
    acc[key].pnl += tradePnl
    return acc
  }, {})

  const monthlyData = Object.values(monthlyPnL)
    .sort((a, b) => a.sortKey - b.sortKey)
    .map(({ monthYear, pnl }) => ({ month: monthYear, pnl }))

  // Dados para grafico de pizza (Win/Loss)
  const wins = filteredTrades.filter(t => parseFloat(t.pnl) > 0).length
  const losses = filteredTrades.filter(t => parseFloat(t.pnl) < 0).length
  
  const pieData = [
    { name: 'Vitorias', value: wins, color: '#10b981' },
    { name: 'Derrotas', value: losses, color: '#ef4444' }
  ]

  // Estatisticas
  const maxDrawdown = drawdownData.length > 0 ? Math.min(...drawdownData.map(d => d.drawdown)) : 0
  const maxDrawdownPercent = drawdownData.length > 0 ? Math.min(...drawdownData.map(d => d.drawdownPercent)) : 0
  const currentEquity = equityCurve.length > 0 ? equityCurve[equityCurve.length - 1]?.equity : 0

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-zinc-800 border border-zinc-700 p-3 rounded-lg shadow-xl">
          <p className="text-zinc-400 text-sm">{payload[0].payload.date || payload[0].payload.month}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-white font-bold">
              {entry.name}: {formatCurrency(entry.value)}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  const CustomPieTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const total = wins + losses
      const percent = ((payload[0].value / total) * 100).toFixed(1)
      return (
        <div className="bg-zinc-800 border border-zinc-700 p-3 rounded-lg shadow-xl">
          <p className="text-white font-bold">{payload[0].name}</p>
          <p className="text-zinc-300">{payload[0].value} trades ({percent}%)</p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="space-y-4 lg:space-y-6">
      <div>
        <h2 className="text-xl lg:text-2xl font-bold text-white">Graficos Avancados</h2>
        <p className="text-sm lg:text-base text-zinc-400">
          Visualize sua evolucao e drawdown ({filteredTrades.length} trades)
        </p>
      </div>

      <TradeFilters onFilterChange={setFilters} />

      {filteredTrades.length === 0 ? (
        <Card>
          <div className="text-center py-8 text-zinc-500">
            Nenhum trade encontrado com os filtros aplicados
          </div>
        </Card>
      ) : (
        <>
          {/* Estatisticas Rapidas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <div className="text-zinc-400 text-sm mb-1">Capital Atual</div>
              <div className={`text-2xl font-bold ${currentEquity >= 0 ? 'text-win' : 'text-loss'}`}>
                {formatCurrency(currentEquity)}
              </div>
            </Card>
            <Card>
              <div className="text-zinc-400 text-sm mb-1">Max Drawdown ($)</div>
              <div className="text-2xl font-bold text-loss">
                {formatCurrency(maxDrawdown)}
              </div>
            </Card>
            <Card>
              <div className="text-zinc-400 text-sm mb-1">Max Drawdown (%)</div>
              <div className="text-2xl font-bold text-loss">
                {maxDrawdownPercent.toFixed(2)}%
              </div>
            </Card>
          </div>

          {/* Grafico de Pizza - Distribuicao Win/Loss */}
          <Card>
            <h3 className="text-lg font-bold text-white mb-4">Distribuicao de Resultados</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomPieTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-zinc-800 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 bg-win rounded"></div>
                    <span className="text-white font-medium">Vitorias</span>
                  </div>
                  <span className="text-win font-bold text-xl">{wins}</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-zinc-800 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 bg-loss rounded"></div>
                    <span className="text-white font-medium">Derrotas</span>
                  </div>
                  <span className="text-loss font-bold text-xl">{losses}</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-zinc-700 rounded-lg">
                  <span className="text-white font-medium">Win Rate</span>
                  <span className="text-white font-bold text-xl">
                    {((wins / (wins + losses)) * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          </Card>

          {/* Equity Curve */}
          <Card>
            <h3 className="text-lg font-bold text-white mb-4">📈 Curva de Capital (Equity Curve)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={equityCurve}>
                <defs>
                  <linearGradient id="colorEquity" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                <XAxis dataKey="date" stroke="#71717a" tick={{ fontSize: 12 }} interval="preserveStartEnd" />
                <YAxis stroke="#71717a" tick={{ fontSize: 12 }} tickFormatter={(value) => `$ ${value.toFixed(0)}`} />
                <Tooltip content={<CustomTooltip />} />
                <Area 
                  type="monotone" 
                  dataKey="equity" 
                  stroke="#10b981" 
                  strokeWidth={2} 
                  fill="url(#colorEquity)" 
                  name="Capital"
                />
              </AreaChart>
            </ResponsiveContainer>
          </Card>

          {/* Drawdown */}
          <Card>
            <h3 className="text-lg font-bold text-white mb-4">📉 Drawdown</h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={drawdownData}>
                <defs>
                  <linearGradient id="colorDrawdown" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                <XAxis dataKey="date" stroke="#71717a" tick={{ fontSize: 12 }} interval="preserveStartEnd" />
                <YAxis stroke="#71717a" tick={{ fontSize: 12 }} tickFormatter={(value) => `$ ${value.toFixed(0)}`} />
                <Tooltip content={<CustomTooltip />} />
                <Area 
                  type="monotone" 
                  dataKey="drawdown" 
                  stroke="#ef4444" 
                  strokeWidth={2} 
                  fill="url(#colorDrawdown)" 
                  name="Drawdown"
                />
              </AreaChart>
            </ResponsiveContainer>
          </Card>

          {/* P&L Mensal */}
          <Card>
            <h3 className="text-lg font-bold text-white mb-4">📊 P&L Mensal</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                <XAxis dataKey="month" stroke="#71717a" tick={{ fontSize: 12 }} />
                <YAxis stroke="#71717a" tick={{ fontSize: 12 }} tickFormatter={(value) => `$ ${value.toFixed(0)}`} />
                <Tooltip content={<CustomTooltip />} />
                <Line 
                  type="monotone" 
                  dataKey="pnl" 
                  stroke="#3b82f6" 
                  strokeWidth={2} 
                  dot={{ fill: '#3b82f6', r: 4 }}
                  name="P&L"
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </>
      )}
    </div>
  )
}

