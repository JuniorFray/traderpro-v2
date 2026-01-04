// src/features/dashboard/Dashboard.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTrades } from '../../hooks/useTrades';
import { calculateMetrics } from '../../utils/metrics';
import { Loading } from '../../components/ui/Loading';
import { MetricCard } from '../../components/ui/MetricCard';
import { AdvancedMetrics } from '../../components/dashboard/AdvancedMetrics';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer,
  CartesianGrid 
} from 'recharts';

// Função auxiliar para formatar moeda
const formatCurrency = (value) => {
  return value.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};

export const Dashboard = () => {
  const navigate = useNavigate();
  const { trades, loading } = useTrades();
  const [selectedPeriod, setSelectedPeriod] = useState('all');
  const metrics = calculateMetrics(trades, selectedPeriod);

  // Log para debug
  useEffect(() => {
    console.log('Dashboard metrics:', metrics);
  }, [metrics]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loading />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 pb-32 lg:p-6 lg:pb-6">
      {/* HEADER - Seletor de Período */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl lg:text-3xl font-bold text-white">Resultado</h1>
        <select
          value={selectedPeriod}
          onChange={(e) => setSelectedPeriod(e.target.value)}
          className="bg-zinc-800 text-white px-4 py-2 rounded-xl border border-zinc-700 font-medium text-sm lg:text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="today">Hoje</option>
          <option value="week">Última Semana</option>
          <option value="month">Último Mês</option>
          <option value="all">Todos os Períodos</option>
        </select>
      </div>

      {/* Verificar se há trades */}
      {metrics.totalTrades === 0 ? (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 text-center">
          <p className="text-zinc-400 mb-4">Nenhuma operação registrada neste período</p>
          <button
            onClick={() => navigate('/app/trades')}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-colors"
          >
            Adicionar Primeiro Trade
          </button>
        </div>
      ) : (
        <>
          {/* BLOCO 1: GRÁFICO DE EQUITY - Destaque Principal */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 lg:p-6 mb-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm lg:text-base font-semibold text-zinc-400">
                Evolução do Resultado
              </h2>
              <span className="text-xs text-zinc-500">
                {metrics.equityCurve?.length || 0} operações
              </span>
            </div>

            {/* Gráfico - altura ajustada para mobile/desktop */}
            <div className="h-[200px] lg:h-[280px] -mx-2">
              {metrics.equityCurve && metrics.equityCurve.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart 
                    data={metrics.equityCurve}
                    margin={{ top: 5, right: 5, left: 0, bottom: 5 }}
                  >
                    <defs>
                      <linearGradient id="equityGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop 
                          offset="5%" 
                          stopColor={metrics.netProfit >= 0 ? "#00E676" : "#FF1744"}
                          stopOpacity={0.3}
                        />
                        <stop 
                          offset="95%" 
                          stopColor={metrics.netProfit >= 0 ? "#00E676" : "#FF1744"}
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid 
                      strokeDasharray="3 3" 
                      stroke="#27272A" 
                      vertical={false}
                    />
                    <XAxis 
                      dataKey="date" 
                      stroke="#52525B"
                      fontSize={10}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis 
                      stroke="#52525B"
                      fontSize={10}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => `R$ ${value.toLocaleString('pt-BR')}`}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#18181B',
                        border: '1px solid #27272A',
                        borderRadius: '8px',
                        fontSize: '12px'
                      }}
                      formatter={(value) => [
                        `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 
                        'Resultado'
                      ]}
                      labelFormatter={(label) => `Data: ${label}`}
                    />
                    <Area
                      type="monotone"
                      dataKey="equity"
                      stroke={metrics.netProfit >= 0 ? "#00E676" : "#FF1744"}
                      strokeWidth={2}
                      fill="url(#equityGradient)"
                      animationDuration={500}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-zinc-500">
                  Sem dados para exibir
                </div>
              )}
            </div>
          </div>

          {/* BLOCO 2: RESULTADO PRINCIPAL - Card Destacado */}
          <div className={`rounded-2xl p-6 mb-4 border-2 ${
            metrics.netProfit >= 0 
              ? 'bg-gradient-to-br from-emerald-900/30 to-emerald-950/20 border-win/30' 
              : 'bg-gradient-to-br from-red-900/30 to-red-950/20 border-loss/30'
          }`}>
            <div className="text-center">
              <p className="text-zinc-400 text-sm mb-2">Saldo Líquido Total</p>
              <p className={`text-4xl md:text-5xl lg:text-6xl font-black mb-2 ${
                metrics.netProfit >= 0 ? 'text-win' : 'text-loss'
              }`}>
                R$ {formatCurrency(Math.abs(metrics.netProfit))}
              </p>
              
              {/* Métricas rápidas em linha */}
              <div className="flex items-center justify-center gap-4 lg:gap-6 mt-4 pt-4 border-t border-white/10">
                <div>
                  <p className="text-zinc-500 text-xs mb-1">Taxa de Acerto</p>
                  <p className="text-white font-bold text-base lg:text-lg">
                    {metrics.winRate.toFixed(1)}%
                  </p>
                </div>
                <div className="h-8 w-px bg-white/10"></div>
                <div>
                  <p className="text-zinc-500 text-xs mb-1">Trades</p>
                  <p className="text-white font-bold text-base lg:text-lg">
                    {metrics.totalTrades}
                  </p>
                </div>
                <div className="h-8 w-px bg-white/10"></div>
                <div>
                  <p className="text-zinc-500 text-xs mb-1">Payoff</p>
                  <p className="text-white font-bold text-base lg:text-lg">
                    {metrics.profitFactor === Infinity ? '∞' : metrics.profitFactor?.toFixed(2) || '0.00'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* BLOCO 3: GRID DE MÉTRICAS - Estilo Profit Mobile */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
            {/* Lucro Bruto */}
            <MetricCard
              label="Lucro Bruto"
              value={metrics.grossProfit}
              type="currency"
              positive={true}
            />
            
            {/* Prejuízo Bruto */}
            <MetricCard
              label="Prejuízo Bruto"
              value={Math.abs(metrics.grossLoss)}
              type="currency"
              negative={true}
            />

            {/* Média Ganho */}
            <MetricCard
              label="Média Ganho"
              value={metrics.avgWin}
              type="currency"
              icon="📈"
            />

            {/* Média Perda */}
            <MetricCard
              label="Média Perda"
              value={Math.abs(metrics.avgLoss)}
              type="currency"
              icon="📉"
            />

            {/* Operações Vencedoras */}
            <MetricCard
              label="Ops. Vencedoras"
              value={metrics.winningTrades}
              type="number"
              subtext={`${metrics.winRate.toFixed(1)}%`}
              positive={true}
            />

            {/* Operações Perdedoras */}
            <MetricCard
              label="Ops. Perdedoras"
              value={metrics.losingTrades}
              type="number"
              subtext={`${(100 - metrics.winRate).toFixed(1)}%`}
              negative={true}
            />

            {/* Maior Ganho */}
            <MetricCard
              label="Maior Ganho"
              value={metrics.maxWin}
              type="currency"
              icon="🎯"
            />

            {/* Maior Perda */}
            <MetricCard
              label="Maior Perda"
              value={Math.abs(metrics.maxLoss)}
              type="currency"
              icon="⚠️"
            />
          </div>

          {/* BLOCO 4: CUSTOS OPERACIONAIS */}
          <div className="bg-red-900/10 border border-red-900/30 rounded-2xl p-4 lg:p-5 mb-4">
            <h3 className="text-red-400 font-semibold mb-3 flex items-center gap-2">
              <span>💰</span> Custos Operacionais
            </h3>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <p className="text-zinc-500 text-xs mb-1">Comissões</p>
                <p className="text-red-400 font-bold text-sm lg:text-base">
                  R$ {formatCurrency(Math.abs(metrics.totalCommissions))}
                </p>
              </div>
              <div>
                <p className="text-zinc-500 text-xs mb-1">Taxas/Swaps</p>
                <p className="text-red-400 font-bold text-sm lg:text-base">
                  R$ {formatCurrency(Math.abs(metrics.totalSwaps))}
                </p>
              </div>
              <div>
                <p className="text-zinc-500 text-xs mb-1">Total</p>
                <p className="text-red-500 font-bold text-base lg:text-lg">
                  R$ {formatCurrency(Math.abs(metrics.totalCommissions + metrics.totalSwaps))}
                </p>
              </div>
            </div>
          </div>

          {/* BLOCO 5: ANÁLISE AVANÇADA (Collapsible) */}
          <AdvancedMetrics metrics={metrics} />

          {/* AÇÕES RÁPIDAS - Desktop apenas */}
          <div className="hidden lg:flex gap-3 mt-6">
            <button
              onClick={() => navigate('/app/trades')}
              className="flex-1 px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl font-semibold transition-colors border border-zinc-700"
            >
              📊 Ver Todos os Trades
            </button>
            <button
              onClick={() => navigate('/app/trades')}
              className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-colors"
            >
              ➕ Adicionar Novo Trade
            </button>
          </div>
        </>
      )}
    </div>
  );
};
