import { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { calculatePeriodTax } from '../../utils/taxes/taxCalculator';

export const DayTradeDashboard = ({ trades = [] }) => {
  const [stats, setStats] = useState({
    totalTrades: 0,
    winningTrades: 0,
    losingTrades: 0,
    consolidatedPnL: 0,
    totalTax: 0,
    avgPnl: 0,
    winRate: 0,
    bestTrade: 0,
    worstTrade: 0,
    isNegativeMonth: false
  });

  useEffect(() => {
    const dayTrades = trades.filter(t => t.market === 'b3daytrade');
    
    if (dayTrades.length === 0) {
      return;
    }

    // ✅ NOVO: Calcular imposto consolidado do período
    const currentPeriod = new Date().toISOString().split('T')[0].slice(0, 7); // "2026-01"
    const taxInfo = calculatePeriodTax(dayTrades, 'b3daytrade', currentPeriod);

    const winning = dayTrades.filter(t => t.pnl > 0);
    const losing = dayTrades.filter(t => t.pnl < 0);
    
    const pnls = dayTrades.map(t => parseFloat(t.pnl || 0));
    const bestTrade = Math.max(...pnls);
    const worstTrade = Math.min(...pnls);

    setStats({
      totalTrades: dayTrades.length,
      winningTrades: winning.length,
      losingTrades: losing.length,
      consolidatedPnL: taxInfo.consolidatedPnL || 0,
      totalTax: taxInfo.taxAmount || 0,
      avgPnl: taxInfo.consolidatedPnL / dayTrades.length,
      winRate: (winning.length / dayTrades.length) * 100,
      bestTrade,
      worstTrade,
      isNegativeMonth: taxInfo.consolidatedPnL < 0
    });
  }, [trades]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <span className="text-4xl">📊</span>
        <div>
          <h1 className="text-3xl font-bold text-white">B3 Day Trade</h1>
          <p className="text-zinc-400">Operações intraday na B3</p>
        </div>
      </div>

      {/* ✅ NOVO: Alerta quando o mês for negativo */}
      {stats.isNegativeMonth && (
        <Card className="bg-blue-900/20 border-blue-500/50">
          <div className="flex items-start gap-3">
            <span className="text-2xl">📘</span>
            <div>
              <p className="text-blue-400 font-bold mb-1">Mês Negativo - Sem Imposto</p>
              <p className="text-zinc-300 text-sm">
                Prejuízo de <strong>R$ {Math.abs(stats.consolidatedPnL).toFixed(2)}</strong> registrado.
                <br />
                Você <strong>não paga imposto</strong> este mês. 
                O prejuízo poderá ser compensado em meses futuros com lucro.
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Métricas Principais */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <div className="text-center">
            <p className="text-zinc-400 text-sm mb-1">Total Trades</p>
            <p className="text-2xl font-bold text-white">{stats.totalTrades}</p>
          </div>
        </Card>

        <Card>
          <div className="text-center">
            <p className="text-zinc-400 text-sm mb-1">Win Rate</p>
            <p className="text-2xl font-bold text-emerald-400">
              {stats.winRate.toFixed(1)}%
            </p>
          </div>
        </Card>

        <Card>
          <div className="text-center">
            <p className="text-zinc-400 text-sm mb-1">Lucro Médio</p>
            <p className={`text-2xl font-bold ${stats.avgPnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              R$ {stats.avgPnl.toFixed(2)}
            </p>
          </div>
        </Card>

        <Card>
          <div className="text-center">
            <p className="text-zinc-400 text-sm mb-1">Imposto (20%)</p>
            <p className="text-2xl font-bold text-red-400">
              R$ {stats.totalTax.toFixed(2)}
            </p>
          </div>
        </Card>
      </div>

      {/* Lucro x Imposto */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <div className="text-center">
            <p className="text-zinc-400 text-sm mb-2">Lucro Consolidado</p>
            <p className={`text-3xl font-bold ${stats.consolidatedPnL >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              R$ {stats.consolidatedPnL.toFixed(2)}
            </p>
            <p className="text-xs text-zinc-500 mt-1">Soma de todos os trades</p>
          </div>
        </Card>

        <Card>
          <div className="text-center">
            <p className="text-zinc-400 text-sm mb-2">Imposto DARF 6015</p>
            <p className="text-3xl font-bold text-red-400">
              - R$ {stats.totalTax.toFixed(2)}
            </p>
            <p className="text-xs text-zinc-500 mt-1">20% sobre lucro</p>
          </div>
        </Card>

        <Card>
          <div className="text-center">
            <p className="text-zinc-400 text-sm mb-2">Lucro Líquido</p>
            <p className={`text-3xl font-bold ${(stats.consolidatedPnL - stats.totalTax) >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              R$ {(stats.consolidatedPnL - stats.totalTax).toFixed(2)}
            </p>
            <p className="text-xs text-zinc-500 mt-1">Após impostos</p>
          </div>
        </Card>
      </div>

      {/* Melhor e Pior Trade */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-zinc-400 text-sm mb-1">🏆 Melhor Trade</p>
              <p className="text-2xl font-bold text-emerald-400">
                R$ {stats.bestTrade.toFixed(2)}
              </p>
            </div>
            <div className="text-emerald-400 text-4xl">↑</div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-zinc-400 text-sm mb-1">💔 Pior Trade</p>
              <p className="text-2xl font-bold text-red-400">
                R$ {stats.worstTrade.toFixed(2)}
              </p>
            </div>
            <div className="text-red-400 text-4xl">↓</div>
          </div>
        </Card>
      </div>

      {/* Alerta Fiscal */}
      <Card className="bg-amber-900/20 border-amber-500/50">
        <div className="flex items-start gap-3">
          <span className="text-2xl">⚠️</span>
          <div>
            <p className="text-amber-400 font-bold mb-1">Lembrete Fiscal</p>
            <p className="text-zinc-300 text-sm">
              Day Trade tem alíquota de <strong>20%</strong> sobre o lucro consolidado mensal.
              <br />
              Pagamento via DARF 6015 até o último dia útil do mês seguinte.
              <br />
              <span className="text-amber-300">Se o mês fechar negativo, não há imposto a pagar.</span>
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};
