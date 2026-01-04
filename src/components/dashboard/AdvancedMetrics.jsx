// src/components/dashboard/AdvancedMetrics.jsx
import { useState } from 'react';
import { MetricCard } from '../ui/MetricCard';

export const AdvancedMetrics = ({ metrics }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-4 flex items-center justify-between hover:bg-zinc-800/50 transition-colors"
      >
        <h3 className="text-white font-semibold flex items-center gap-2">
          <span>📊</span> Análise Avançada
        </h3>
        <span className={`text-zinc-400 transform transition-transform duration-200 ${
          isOpen ? 'rotate-180' : ''
        }`}>
          ▼
        </span>
      </button>

      {isOpen && (
        <div className="px-4 pb-4 pt-2 border-t border-zinc-800">
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
            <MetricCard
              label="Sequência Vitórias"
              value={metrics.consecutiveWins}
              type="number"
              icon="🔥"
            />
            <MetricCard
              label="Sequência Derrotas"
              value={metrics.consecutiveLosses}
              type="number"
              icon="❄️"
            />
            <MetricCard
              label="Drawdown Máx."
              value={Math.abs(metrics.maxDrawdown)}
              type="currency"
              negative={true}
            />
            <MetricCard
              label="Fator de Lucro"
              value={metrics.profitFactor === Infinity ? '∞' : metrics.profitFactor?.toFixed(2) || '0.00'}
              type="number"
            />
            <MetricCard
              label="Expectativa"
              value={metrics.expectancy}
              type="currency"
              positive={metrics.expectancy > 0}
              negative={metrics.expectancy < 0}
            />
            <MetricCard
              label="Sharpe Ratio"
              value={metrics.sharpeRatio?.toFixed(2) || 'N/A'}
              type="number"
            />
          </div>
        </div>
      )}
    </div>
  );
};
