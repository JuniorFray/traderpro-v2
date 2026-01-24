import { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { calculatePeriodTax } from '../../utils/taxes/taxCalculator';

export const OptionsDashboard = ({ trades = [] }) => {
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
    isNegativeMonth: false,
    salesVolume: 0,
    isExempt: false
  });

  useEffect(() => {
    const optionsTrades = trades.filter(t => t.market === 'b3options');
    
    if (optionsTrades.length === 0) {
      return;
    }

    // ✅ NOVO: Calcular imposto consolidado mensal
    const currentPeriod = new Date().toISOString().split('T')[0].slice(0, 7); // "2026-01"
    const taxInfo = calculatePeriodTax(optionsTrades, 'b3options', currentPeriod);

    const winning = optionsTrades.filter(t => t.pnl > 0);
    const losing = optionsTrades.filter(t => t.pnl < 0);
    
    // ✅ Calcular volume de vendas (exitPrice × quantity)
    const salesVolume = optionsTrades.reduce((sum, t) => {
      const exitPrice = parseFloat(t.exitPrice || 0);
      const quantity = parseFloat(t.quantity || 0);
      return sum + (exitPrice * quantity);
    }, 0);

    // ✅ Verificar isenção (vendas < R$ 20.000)
    const isExempt = salesVolume < 20000;
    
    const pnls = optionsTrades.map(t => parseFloat(t.pnl || 0));
    const bestTrade = Math.max(...pnls);
    const worstTrade = Math.min(...pnls);

    setStats({
      totalTrades: optionsTrades.length,
      winningTrades: winning.length,
      losingTrades: losing.length,
      consolidatedPnL: taxInfo.consolidatedPnL || 0,
      totalTax: isExempt ? 0 : (taxInfo.taxAmount || 0),
      avgPnl: taxInfo.consolidatedPnL / optionsTrades.length,
      winRate: (winning.length / optionsTrades.length) * 100,
      bestTrade,
      worstTrade,
      isNegativeMonth: taxInfo.consolidatedPnL < 0,
      salesVolume,
      isExempt
    });
  }, [trades]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <span className="text-4xl">🎯</span>
        <div>
          <h1 className="text-3xl font-bold text-white">B3 Opções</h1>
          <p className="text-zinc-400">Calls, Puts e estratégias</p>
        </div>
      </div>

      {/* ✅ NOVO: Alerta de isenção */}
      {stats.isExempt && stats.consolidatedPnL > 0 && (
        <Card className="bg-green-900/20 border-green-500/50">
          <div className="flex items-start gap-3">
            <span className="text-2xl">🎉</span>
            <div>
              <p className="text-green-400 font-bold mb-1">Isento de Imposto!</p>
              <p className="text-zinc-300 text-sm">
                Volume de vendas: <strong>R$ {stats.salesVolume.toFixed(2)}</strong>
                <br />
                Como suas vendas ficaram <strong>abaixo de R$ 20.000</strong> no mês, você está <strong>ISENTO</strong> de pagar imposto!
                <br />
                <span className="text-green-300">Lucro líquido = Lucro bruto (sem dedução de IR)</span>
              </p>
            </div>
          </div>
        </Card>
      )}

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
            <p className="text-zinc-400 text-sm mb-1">Imposto (15%)</p>
            <p className="text-2xl font-bold text-red-400">
              R$ {stats.totalTax.toFixed(2)}
            </p>
            {stats.isExempt && <p className="text-xs text-green-400 mt-1">Isento</p>}
          </div>
        </Card>
      </div>

      {/* Volume de Vendas (para isenção) */}
      <Card className={stats.isExempt ? 'bg-green-900/10 border-green-500/30' : 'bg-amber-900/10 border-amber-500/30'}>
        <div className="text-center">
          <p className="text-zinc-400 text-sm mb-2">Volume de Vendas no Mês</p>
          <p className="text-3xl font-bold text-white mb-2">
            R$ {stats.salesVolume.toFixed(2)}
          </p>
          <div className="flex items-center justify-center gap-2">
            <div className="flex-1 bg-zinc-700 rounded-full h-2 overflow-hidden">
              <div 
                className={`h-full ${stats.isExempt ? 'bg-green-500' : 'bg-amber-500'}`}
                style={{ width: `${Math.min((stats.salesVolume / 20000) * 100, 100)}%` }}
              />
            </div>
            <span className="text-xs text-zinc-400">
              {((stats.salesVolume / 20000) * 100).toFixed(0)}% de R$ 20k
            </span>
          </div>
          <p className="text-xs text-zinc-500 mt-2">
            {stats.isExempt 
              ? `Faltam R$ ${(20000 - stats.salesVolume).toFixed(2)} para perder isenção`
              : `Você ultrapassou o limite de isenção em R$ ${(stats.salesVolume - 20000).toFixed(2)}`
            }
          </p>
        </div>
      </Card>

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
            <p className="text-zinc-400 text-sm mb-2">Imposto DARF 3317</p>
            <p className="text-3xl font-bold text-red-400">
              - R$ {stats.totalTax.toFixed(2)}
            </p>
            <p className="text-xs text-zinc-500 mt-1">
              {stats.isExempt ? 'Isento (vendas < R$ 20k)' : '15% sobre lucro'}
            </p>
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
              Opções B3 têm alíquota de <strong>15%</strong> sobre o lucro consolidado mensal.
              <br />
              <strong>ISENÇÃO:</strong> Se o volume de <strong>vendas</strong> no mês for inferior a <strong>R$ 20.000</strong>, você está isento.
              <br />
              Pagamento via DARF 3317 até o último dia útil do mês seguinte.
              <br />
              <span className="text-amber-300">Se o mês fechar negativo, não há imposto a pagar.</span>
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};
