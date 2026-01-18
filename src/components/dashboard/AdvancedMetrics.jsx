// src/components/dashboard/AdvancedMetrics.jsx
import { useState } from 'react';
import { MetricCard } from '../ui/MetricCard';

export const AdvancedMetrics = ({ metrics, currency = 'BRL' }) => {
  const [isOpen, setIsOpen] = useState(false);

  // ✅ Calcular valores que podem estar faltando
  const consecutiveWins = metrics.consecutiveWins || 0;
  const consecutiveLosses = metrics.consecutiveLosses || 0;
  const maxDrawdown = metrics.maxDrawdown || 0;
  const expectancy = metrics.expectancy || 0;
  const sharpeRatio = metrics.sharpeRatio || 0;
  const profitFactor = metrics.profitFactor || 0;

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
              value={consecutiveWins}
              type="number"
              icon="🔥"
              currency={currency}
            />
            <MetricCard
              label="Sequência Derrotas"
              value={consecutiveLosses}
              type="number"
              icon="❄️"
              currency={currency}
            />
            <MetricCard
              label="Drawdown Máx."
              value={Math.abs(maxDrawdown)}
              type="currency"
              negative={true}
              currency={currency}
            />
            <MetricCard
              label="Fator de Lucro"
              value={profitFactor === Infinity ? '∞' : profitFactor?.toFixed(2) || '0.00'}
              type="number"
              currency={currency}
            />
            <MetricCard
              label="Expectativa"
              value={expectancy}
              type="currency"
              positive={expectancy > 0}
              negative={expectancy < 0}
              currency={currency}
            />
            <MetricCard
              label="Sharpe Ratio"
              value={sharpeRatio ? sharpeRatio.toFixed(2) : 'N/A'}
              type="number"
              currency={currency}
            />
          </div>
        </div>
      )}
    </div>
  );
};
