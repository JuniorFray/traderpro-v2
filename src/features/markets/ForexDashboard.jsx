import { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { getCurrencySymbol } from '../../constants/markets';

export const ForexDashboard = ({ trades = [] }) => {
  const [stats, setStats] = useState({
    totalTrades: 0,
    winningTrades: 0,
    losingTrades: 0,
    totalPnl: 0,
    totalTax: 0,
    avgPnl: 0,
    winRate: 0,
    bestTrade: 0,
    worstTrade: 0,
    currentQuarter: ''
  });

  useEffect(() => {
    const forexTrades = trades.filter(t => t.market === 'forex');
    
    if (forexTrades.length === 0) {
      return;
    }

    const winning = forexTrades.filter(t => t.pnl > 0);
    const losing = forexTrades.filter(t => t.pnl < 0);
    const totalPnl = forexTrades.reduce((sum, t) => sum + parseFloat(t.pnl || 0), 0);
    const totalTax = forexTrades.reduce((sum, t) => sum + (t.taxes?.amount || 0), 0);
    
    const pnls = forexTrades.map(t => parseFloat(t.pnl || 0));
    const bestTrade = Math.max(...pnls);
    const worstTrade = Math.min(...pnls);

    // Determinar trimestre atual
    const now = new Date();
    const quarter = Math.floor(now.getMonth() / 3) + 1;
    const currentQuarter = `Q${quarter}/${now.getFullYear()}`;

    setStats({
      totalTrades: forexTrades.length,
      winningTrades: winning.length,
      losingTrades: losing.length,
      totalPnl,
      totalTax,
      avgPnl: totalPnl / forexTrades.length,
      winRate: (winning.length / forexTrades.length) * 100,
      bestTrade,
      worstTrade,
      currentQuarter
    });
  }, [trades]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <span className="text-4xl">💱</span>
        <div>
          <h1 className="text-3xl font-bold text-white">Forex</h1>
          <p className="text-zinc-400">Mercado de câmbio internacional</p>
        </div>
      </div>

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
              $ {stats.avgPnl.toFixed(2)}
            </p>
          </div>
        </Card>

        <Card>
          <div className="text-center">
            <p className="text-zinc-400 text-sm mb-1">Imposto (15%)</p>
            <p className="text-2xl font-bold text-red-400">
              $ {stats.totalTax.toFixed(2)}
            </p>
          </div>
        </Card>
      </div>

      {/* Lucro x Imposto */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <div className="text-center">
            <p className="text-zinc-400 text-sm mb-2">Lucro Bruto ({stats.currentQuarter})</p>
            <p className={`text-3xl font-bold ${stats.totalPnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              $ {stats.totalPnl.toFixed(2)}
            </p>
          </div>
        </Card>

        <Card>
          <div className="text-center">
            <p className="text-zinc-400 text-sm mb-2">Imposto DARF 8523</p>
            <p className="text-3xl font-bold text-red-400">
              - $ {stats.totalTax.toFixed(2)}
            </p>
          </div>
        </Card>

        <Card>
          <div className="text-center">
            <p className="text-zinc-400 text-sm mb-2">Lucro Líquido</p>
            <p className={`text-3xl font-bold ${(stats.totalPnl - stats.totalTax) >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              $ {(stats.totalPnl - stats.totalTax).toFixed(2)}
            </p>
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
                $ {stats.bestTrade.toFixed(2)}
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
                $ {stats.worstTrade.toFixed(2)}
              </p>
            </div>
            <div className="text-red-400 text-4xl">↓</div>
          </div>
        </Card>
      </div>

      {/* Alerta Fiscal */}
      <Card className="bg-blue-900/20 border-blue-500/50">
        <div className="flex items-start gap-3">
          <span className="text-2xl">ℹ️</span>
          <div>
            <p className="text-blue-400 font-bold mb-1">Informação Fiscal - Forex</p>
            <p className="text-zinc-300 text-sm">
              Forex tem tributação <strong>trimestral</strong> de <strong>15%</strong> sobre ganho de capital.
              Pagamento via DARF 8523 até o último dia útil do mês seguinte ao fechamento do trimestre.
            </p>
            <p className="text-zinc-400 text-xs mt-2">
              Trimestre atual: <strong className="text-white">{stats.currentQuarter}</strong>
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};
