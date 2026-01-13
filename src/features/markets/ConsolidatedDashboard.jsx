import { useState, useEffect } from 'react';
import { useAuth } from '../auth/AuthContext';
import { Card } from '../../components/ui/Card';
import { MARKETS, getCurrencySymbol } from '../../constants/markets';
import { calculateTaxSummary } from '../../utils/taxes/taxCalculator';

export const ConsolidatedDashboard = ({ trades = [] }) => {
  const { isPro } = useAuth();
  const [selectedCurrency, setSelectedCurrency] = useState('BRL');
  const [summary, setSummary] = useState({});

  useEffect(() => {
    if (trades.length > 0) {
      const taxSummary = calculateTaxSummary(trades);
      setSummary(taxSummary);
    }
  }, [trades]);

  const getTotalPnl = () => {
    return Object.values(summary).reduce((total, market) => total + market.totalPnl, 0);
  };

  const getTotalTax = () => {
    return Object.values(summary).reduce((total, market) => total + market.totalTax, 0);
  };

  const getNetProfit = () => {
    return getTotalPnl() - getTotalTax();
  };

  return (
    <div className="space-y-6">
      {/* Header com Toggle de Moeda */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white">Dashboard Consolidado</h1>
        
        <div className="flex gap-2 bg-zinc-800 rounded-lg p-1">
          <button
            onClick={() => setSelectedCurrency('BRL')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              selectedCurrency === 'BRL'
                ? 'bg-emerald-500 text-white'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            R$ BRL
          </button>
          <button
            onClick={() => setSelectedCurrency('USD')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              selectedCurrency === 'USD'
                ? 'bg-emerald-500 text-white'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            $ USD
          </button>
        </div>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <div className="text-center">
            <p className="text-zinc-400 text-sm mb-2">Lucro Bruto</p>
            <p className="text-3xl font-bold text-white">
              {getCurrencySymbol(selectedCurrency)} {getTotalPnl().toFixed(2)}
            </p>
            <p className="text-xs text-zinc-500 mt-1">{trades.length} trades</p>
          </div>
        </Card>

        <Card>
          <div className="text-center">
            <p className="text-zinc-400 text-sm mb-2">Impostos</p>
            <p className="text-3xl font-bold text-red-400">
              {getCurrencySymbol(selectedCurrency)} {getTotalTax().toFixed(2)}
            </p>
            <p className="text-xs text-zinc-500 mt-1">
              {((getTotalTax() / getTotalPnl()) * 100 || 0).toFixed(1)}% do lucro
            </p>
          </div>
        </Card>

        <Card>
          <div className="text-center">
            <p className="text-zinc-400 text-sm mb-2">Lucro Líquido</p>
            <p className={`text-3xl font-bold ${getNetProfit() >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {getCurrencySymbol(selectedCurrency)} {getNetProfit().toFixed(2)}
            </p>
            <p className="text-xs text-zinc-500 mt-1">Após impostos</p>
          </div>
        </Card>
      </div>

      {/* Performance por Mercado */}
      <Card>
        <h2 className="text-xl font-bold text-white mb-4">📊 Performance por Mercado</h2>
        
        <div className="space-y-3">
          {MARKETS.map(market => {
            const data = summary[market.value];
            if (!data || data.trades === 0) return null;

            const winRate = ((data.winningTrades / data.trades) * 100).toFixed(1);

            return (
              <div key={market.value} className="bg-zinc-800 rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{market.icon}</span>
                    <span className="text-white font-medium">{market.label}</span>
                  </div>
                  <span className="text-zinc-400 text-sm">{data.trades} trades</span>
                </div>

                <div className="grid grid-cols-3 gap-4 mt-3">
                  <div>
                    <p className="text-xs text-zinc-500">Lucro</p>
                    <p className={`text-lg font-bold ${data.totalPnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {getCurrencySymbol(market.currency)} {data.totalPnl.toFixed(2)}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-zinc-500">Imposto</p>
                    <p className="text-lg font-bold text-red-400">
                      {getCurrencySymbol(market.currency)} {data.totalTax.toFixed(2)}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-zinc-500">Win Rate</p>
                    <p className="text-lg font-bold text-white">{winRate}%</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
};
