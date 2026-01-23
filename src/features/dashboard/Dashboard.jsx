// src/features/dashboard/Dashboard.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTrades } from '../../hooks/useTrades';
import { Loading } from '../../components/ui/Loading';
import { MetricCard } from '../../components/ui/MetricCard';
import { AdvancedMetrics } from '../../components/dashboard/AdvancedMetrics';
import { getExchangeRate } from '../../services/currency/exchangeRates';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer,
  CartesianGrid 
} from 'recharts';

export const Dashboard = () => {
  const navigate = useNavigate();
  const { trades, loading } = useTrades();
  const [selectedPeriod, setSelectedPeriod] = useState('all');
  const [selectedCurrency, setSelectedCurrency] = useState('USD');
  const [exchangeRate, setExchangeRate] = useState(5.45);
  const [loadingRate, setLoadingRate] = useState(false);

  // Buscar cotação
  useEffect(() => {
    const fetchRate = async () => {
      try {
        setLoadingRate(true);
        const rate = await getExchangeRate('USD', 'BRL');
        setExchangeRate(rate);
      } catch (error) {
        console.error('Erro ao buscar cotação:', error);
      } finally {
        setLoadingRate(false);
      }
    };
    
    fetchRate();
  }, []);

  // ✅ Calcular métricas considerando moeda original
  const calculateMetricsWithCurrency = (tradesData, period) => {
    let filteredTrades = tradesData;

    // Filtrar por período
    const now = new Date();
    if (period === 'today') {
      const today = now.toISOString().split('T')[0];
      filteredTrades = tradesData.filter(t => t.date === today);
    } else if (period === 'week') {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      filteredTrades = tradesData.filter(t => new Date(t.date) >= weekAgo);
    } else if (period === 'month') {
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      filteredTrades = tradesData.filter(t => new Date(t.date) >= monthAgo);
    }

    if (filteredTrades.length === 0) {
      return {
        totalTrades: 0,
        netProfitUSD: 0,
        netProfitBRL: 0,
        grossProfitUSD: 0,
        grossProfitBRL: 0,
        grossLossUSD: 0,
        grossLossBRL: 0,
        winningTrades: 0,
        losingTrades: 0,
        winRate: 0,
        avgWinUSD: 0,
        avgWinBRL: 0,
        avgLossUSD: 0,
        avgLossBRL: 0,
        maxWinUSD: 0,
        maxWinBRL: 0,
        maxLossUSD: 0,
        maxLossBRL: 0,
        totalCommissionsUSD: 0,
        totalCommissionsBRL: 0,
        totalSwapsUSD: 0,
        totalSwapsBRL: 0,
        profitFactor: 0,
        equityCurve: []
      };
    }

    let netProfitUSD = 0, netProfitBRL = 0;
    let grossProfitUSD = 0, grossProfitBRL = 0;
    let grossLossUSD = 0, grossLossBRL = 0;
    let winningTrades = 0, losingTrades = 0;
    let winsUSD = [], winsBRL = [];
    let lossesUSD = [], lossesBRL = [];
    let maxWinUSD = 0, maxWinBRL = 0;
    let maxLossUSD = 0, maxLossBRL = 0;
    let totalCommissionsUSD = 0, totalCommissionsBRL = 0;
    let totalSwapsUSD = 0, totalSwapsBRL = 0;
    const equityCurve = [];
    let cumulativeEquityUSD = 0, cumulativeEquityBRL = 0;

    filteredTrades
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .forEach(trade => {
        const isUSD = trade.currency === 'USD';
        const pnl = parseFloat(trade.pnl) || 0;
        const commission = Math.abs(parseFloat(trade.commission) || 0);
        const swap = parseFloat(trade.swap) || 0;

        if (isUSD) {
          totalCommissionsUSD += commission;
          totalSwapsUSD += swap;
          cumulativeEquityUSD += pnl;

          if (pnl > 0) {
            grossProfitUSD += pnl;
            winsUSD.push(pnl);
            if (pnl > maxWinUSD) maxWinUSD = pnl;
            winningTrades++;
          } else if (pnl < 0) {
            grossLossUSD += Math.abs(pnl);
            lossesUSD.push(Math.abs(pnl));
            if (Math.abs(pnl) > maxLossUSD) maxLossUSD = Math.abs(pnl);
            losingTrades++;
          }
        } else {
          totalCommissionsBRL += commission;
          totalSwapsBRL += swap;
          cumulativeEquityBRL += pnl;

          if (pnl > 0) {
            grossProfitBRL += pnl;
            winsBRL.push(pnl);
            if (pnl > maxWinBRL) maxWinBRL = pnl;
            winningTrades++;
          } else if (pnl < 0) {
            grossLossBRL += Math.abs(pnl);
            lossesBRL.push(Math.abs(pnl));
            if (Math.abs(pnl) > maxLossBRL) maxLossBRL = Math.abs(pnl);
            losingTrades++;
          }
        }

        // Equity curve (convertido para moeda selecionada)
        const equityConverted = selectedCurrency === 'USD' 
          ? cumulativeEquityUSD + (cumulativeEquityBRL / exchangeRate)
          : (cumulativeEquityUSD * exchangeRate) + cumulativeEquityBRL;

        equityCurve.push({
          date: trade.date,
          equity: equityConverted
        });
      });

    // ✅ CALCULAR NET PROFIT CORRETAMENTE
    netProfitUSD = grossProfitUSD - grossLossUSD;
    netProfitBRL = grossProfitBRL - grossLossBRL;

    const avgWinUSD = winsUSD.length > 0 ? winsUSD.reduce((a, b) => a + b, 0) / winsUSD.length : 0;
    const avgWinBRL = winsBRL.length > 0 ? winsBRL.reduce((a, b) => a + b, 0) / winsBRL.length : 0;
    const avgLossUSD = lossesUSD.length > 0 ? lossesUSD.reduce((a, b) => a + b, 0) / lossesUSD.length : 0;
    const avgLossBRL = lossesBRL.length > 0 ? lossesBRL.reduce((a, b) => a + b, 0) / lossesBRL.length : 0;

    const winRate = filteredTrades.length > 0 ? (winningTrades / filteredTrades.length) * 100 : 0;
    
    const totalGrossProfit = grossProfitUSD + (grossProfitBRL / exchangeRate);
    const totalGrossLoss = grossLossUSD + (grossLossBRL / exchangeRate);
    const profitFactor = totalGrossLoss > 0 ? totalGrossProfit / totalGrossLoss : 0;

    return {
      totalTrades: filteredTrades.length,
      netProfitUSD,
      netProfitBRL,
      grossProfitUSD,
      grossProfitBRL,
      grossLossUSD,
      grossLossBRL,
      winningTrades,
      losingTrades,
      winRate,
      avgWinUSD,
      avgWinBRL,
      avgLossUSD,
      avgLossBRL,
      maxWinUSD,
      maxWinBRL,
      maxLossUSD,
      maxLossBRL,
      totalCommissionsUSD,
      totalCommissionsBRL,
      totalSwapsUSD,
      totalSwapsBRL,
      profitFactor,
      equityCurve
    };
  };

  const metrics = calculateMetricsWithCurrency(trades, selectedPeriod);

  // ✅ Converter valor considerando moeda original
  const convertValue = (usdValue, brlValue) => {
    if (selectedCurrency === 'USD') {
      return usdValue + (brlValue / exchangeRate);
    } else {
      return (usdValue * exchangeRate) + brlValue;
    }
  };

  const formatCurrency = (value) => {
    return value.toLocaleString(selectedCurrency === 'BRL' ? 'pt-BR' : 'en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  const getCurrencySymbol = () => selectedCurrency === 'USD' ? '$' : 'R$';

  const netProfit = convertValue(metrics.netProfitUSD, metrics.netProfitBRL);
  const grossProfit = convertValue(metrics.grossProfitUSD, metrics.grossProfitBRL);
  const grossLoss = convertValue(metrics.grossLossUSD, metrics.grossLossBRL);
  const avgWin = convertValue(metrics.avgWinUSD, metrics.avgWinBRL);
  const avgLoss = convertValue(metrics.avgLossUSD, metrics.avgLossBRL);
  const maxWin = convertValue(metrics.maxWinUSD, metrics.maxWinBRL);
  const maxLoss = convertValue(metrics.maxLossUSD, metrics.maxLossBRL);
  const totalCommissions = convertValue(metrics.totalCommissionsUSD, metrics.totalCommissionsBRL);
  const totalSwaps = convertValue(metrics.totalSwapsUSD, metrics.totalSwapsBRL);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loading />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 pb-32 lg:p-6 lg:pb-6">
      {/* HEADER - Seletor de Período e Moeda */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl lg:text-3xl font-bold text-white">Resultado</h1>
        
        <div className="flex gap-2">
          {/* Seletor de Período */}
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="bg-zinc-800 text-white px-3 lg:px-4 py-2 rounded-xl border border-zinc-700 font-medium text-xs lg:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="today">Hoje</option>
            <option value="week">Última Semana</option>
            <option value="month">Último Mês</option>
            <option value="all">Todos os Períodos</option>
          </select>

          {/* Seletor de Moeda */}
          <div className="flex gap-1 bg-zinc-800 rounded-lg p-1 border border-zinc-700">
            <button
              onClick={() => setSelectedCurrency('BRL')}
              className={`px-3 py-1.5 rounded-lg transition-colors text-xs lg:text-sm font-medium ${
                selectedCurrency === 'BRL'
                  ? 'bg-emerald-500 text-white'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              R$
            </button>
            <button
              onClick={() => setSelectedCurrency('USD')}
              className={`px-3 py-1.5 rounded-lg transition-colors text-xs lg:text-sm font-medium ${
                selectedCurrency === 'USD'
                  ? 'bg-emerald-500 text-white'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              $
            </button>
          </div>
        </div>
      </div>

      {/* Cotação */}
      {!loadingRate && (
        <div className="bg-blue-900/20 border border-blue-500/50 rounded-lg p-3 mb-4">
          <div className="flex items-center gap-2 text-xs lg:text-sm text-blue-300">
            <span>💱</span>
            <span>Cotação atual: 1 USD = R$ {exchangeRate.toFixed(4)}</span>
          </div>
        </div>
      )}

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
          {/* BLOCO 1: GRÁFICO DE EQUITY */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 lg:p-6 mb-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm lg:text-base font-semibold text-zinc-400">
                Evolução do Resultado
              </h2>
              <span className="text-xs text-zinc-500">
                {metrics.equityCurve?.length || 0} operações
              </span>
            </div>

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
                          stopColor={netProfit >= 0 ? "#00E676" : "#FF1744"}
                          stopOpacity={0.3}
                        />
                        <stop 
                          offset="95%" 
                          stopColor={netProfit >= 0 ? "#00E676" : "#FF1744"}
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
                      tickFormatter={(value) => `${getCurrencySymbol()} ${value.toLocaleString(selectedCurrency === 'BRL' ? 'pt-BR' : 'en-US')}`}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#18181B',
                        border: '1px solid #27272A',
                        borderRadius: '8px',
                        fontSize: '12px'
                      }}
                      formatter={(value) => [
                        `${getCurrencySymbol()} ${value.toLocaleString(selectedCurrency === 'BRL' ? 'pt-BR' : 'en-US', { minimumFractionDigits: 2 })}`, 
                        'Resultado'
                      ]}
                      labelFormatter={(label) => `Data: ${label}`}
                    />
                    <Area
                      type="monotone"
                      dataKey="equity"
                      stroke={netProfit >= 0 ? "#00E676" : "#FF1744"}
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

          {/* BLOCO 2: RESULTADO PRINCIPAL */}
          <div className={`rounded-2xl p-6 mb-4 border-2 ${
            netProfit >= 0 
              ? 'bg-gradient-to-br from-emerald-900/30 to-emerald-950/20 border-win/30' 
              : 'bg-gradient-to-br from-red-900/30 to-red-950/20 border-loss/30'
          }`}>
            <div className="text-center">
              <p className="text-zinc-400 text-sm mb-2">Saldo Líquido Total</p>
              <p className={`text-4xl md:text-5xl lg:text-6xl font-black mb-2 ${
                netProfit >= 0 ? 'text-win' : 'text-loss'
              }`}>
                {getCurrencySymbol()} {formatCurrency(Math.abs(netProfit))}
              </p>
              
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

          {/* BLOCO 3: GRID DE MÉTRICAS */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
            <MetricCard
              label="Lucro Bruto"
              value={grossProfit}
              type="currency"
              positive={true}
              currency={selectedCurrency}
            />
            
            <MetricCard
              label="Prejuízo Bruto"
              value={Math.abs(grossLoss)}
              type="currency"
              negative={true}
              currency={selectedCurrency}
            />

            <MetricCard
              label="Média Ganho"
              value={avgWin}
              type="currency"
              icon="📈"
              currency={selectedCurrency}
            />

            <MetricCard
              label="Média Perda"
              value={Math.abs(avgLoss)}
              type="currency"
              icon="📉"
              currency={selectedCurrency}
            />

            <MetricCard
              label="Ops. Vencedoras"
              value={metrics.winningTrades}
              type="number"
              subtext={`${metrics.winRate.toFixed(1)}%`}
              positive={true}
            />

            <MetricCard
              label="Ops. Perdedoras"
              value={metrics.losingTrades}
              type="number"
              subtext={`${(100 - metrics.winRate).toFixed(1)}%`}
              negative={true}
            />

            <MetricCard
              label="Maior Ganho"
              value={maxWin}
              type="currency"
              icon="🎯"
              currency={selectedCurrency}
            />

            <MetricCard
              label="Maior Perda"
              value={Math.abs(maxLoss)}
              type="currency"
              icon="⚠️"
              currency={selectedCurrency}
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
                  {getCurrencySymbol()} {formatCurrency(Math.abs(totalCommissions))}
                </p>
              </div>
              <div>
                <p className="text-zinc-500 text-xs mb-1">Taxas/Swaps</p>
                <p className="text-red-400 font-bold text-sm lg:text-base">
                  {getCurrencySymbol()} {formatCurrency(Math.abs(totalSwaps))}
                </p>
              </div>
              <div>
                <p className="text-zinc-500 text-xs mb-1">Total</p>
                <p className="text-red-500 font-bold text-base lg:text-lg">
                  {getCurrencySymbol()} {formatCurrency(Math.abs(totalCommissions + totalSwaps))}
                </p>
              </div>
            </div>
          </div>

          {/* BLOCO 5: ANÁLISE AVANÇADA */}
          <AdvancedMetrics 
            metrics={{
              ...metrics,
              netProfit,
              grossProfit,
              grossLoss,
              avgWin,
              avgLoss,
              maxWin,
              maxLoss,
              totalCommissions,
              totalSwaps
            }} 
            currency={selectedCurrency}
          />

          {/* AÇÕES RÁPIDAS */}
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
