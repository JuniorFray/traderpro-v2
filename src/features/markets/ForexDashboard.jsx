import { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { calculatePeriodTax } from '../../utils/taxes/taxCalculator';

export const ForexDashboard = ({ trades = [] }) => {
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
    currentYear: '',
    isNegativeYear: false
  });

  useEffect(() => {
    const forexTrades = trades.filter(t => t.market === 'forex');
    
    if (forexTrades.length === 0) {
      return;
    }

    // ✅ NOVO: Calcular imposto consolidado ANUAL
    const currentYear = new Date().getFullYear();
    const currentPeriod = `${currentYear}-01-01`; // Ano completo
    const taxInfo = calculatePeriodTax(forexTrades, 'forex', currentPeriod);

    const winning = forexTrades.filter(t => t.pnl > 0);
    const losing = forexTrades.filter(t => t.pnl < 0);
    
    const pnls = forexTrades.map(t => parseFloat(t.pnl || 0));
    const bestTrade = Math.max(...pnls);
    const worstTrade = Math.min(...pnls);

    setStats({
      totalTrades: forexTrades.length,
      winningTrades: winning.length,
      losingTrades: losing.length,
      consolidatedPnL: taxInfo.consolidatedPnL || 0,
      totalTax: taxInfo.taxAmount || 0,
      avgPnl: taxInfo.consolidatedPnL / forexTrades.length,
      winRate: (winning.length / forexTrades.length) * 100,
      bestTrade,
      worstTrade,
      currentYear: currentYear.toString(),
      isNegativeYear: taxInfo.consolidatedPnL < 0
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

      {/* ✅ NOVO: Alerta sobre mudança da lei */}
      <Card className="bg-purple-900/20 border-purple-500/50">
        <div className="flex items-start gap-3">
          <span className="text-2xl">📜</span>
          <div>
            <p className="text-purple-400 font-bold mb-1">Lei 14.754/2023 - Mudança Importante</p>
            <p className="text-zinc-300 text-sm">
              Desde <strong>2024</strong>, Forex passou de tributação <strong className="line-through">trimestral</strong> para <strong>ANUAL</strong>.
              <br />
              Imposto de <strong>15%</strong> calculado sobre o resultado do ano inteiro.
              <br />
              Declaração e pagamento até <strong>30 de abril</strong> do ano seguinte via DARF 0190.
            </p>
          </div>
        </div>
      </Card>

      {/* ✅ NOVO: Alerta quando o ano for negativo */}
      {stats.isNegativeYear && (
        <Card className="bg-blue-900/20 border-blue-500/50">
          <div className="flex items-start gap-3">
            <span className="text-2xl">📘</span>
            <div>
              <p className="text-blue-400 font-bold mb-1">Ano Negativo - Sem Imposto</p>
              <p className="text-zinc-300 text-sm">
                Prejuízo de <strong>$ {Math.abs(stats.consolidatedPnL).toFixed(2)}</strong> acumulado no ano.
                <br />
                Você <strong>não paga imposto</strong> neste ano. 
                O prejuízo poderá ser compensado em anos futuros com lucro.
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
            <p className="text-zinc-400 text-sm mb-2">Lucro Consolidado {stats.currentYear}</p>
            <p className={`text-3xl font-bold ${stats.consolidatedPnL >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              $ {stats.consolidatedPnL.toFixed(2)}
            </p>
            <p className="text-xs text-zinc-500 mt-1">Soma de todos os trades</p>
          </div>
        </Card>

        <Card>
          <div className="text-center">
            <p className="text-zinc-400 text-sm mb-2">Imposto DARF 0190</p>
            <p className="text-3xl font-bold text-red-400">
              - $ {stats.totalTax.toFixed(2)}
            </p>
            <p className="text-xs text-zinc-500 mt-1">15% sobre lucro anual</p>
          </div>
        </Card>

        <Card>
          <div className="text-center">
            <p className="text-zinc-400 text-sm mb-2">Lucro Líquido</p>
            <p className={`text-3xl font-bold ${(stats.consolidatedPnL - stats.totalTax) >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              $ {(stats.consolidatedPnL - stats.totalTax).toFixed(2)}
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

      {/* Alerta Fiscal Atualizado */}
      <Card className="bg-amber-900/20 border-amber-500/50">
        <div className="flex items-start gap-3">
          <span className="text-2xl">⚠️</span>
          <div>
            <p className="text-amber-400 font-bold mb-1">Lembrete Fiscal</p>
            <p className="text-zinc-300 text-sm">
              Forex tem alíquota de <strong>15%</strong> sobre o resultado consolidado <strong>ANUAL</strong>.
              <br />
              Pagamento via DARF 0190 até <strong>30 de abril de {parseInt(stats.currentYear) + 1}</strong>.
              <br />
              <span className="text-amber-300">Se o ano fechar negativo, não há imposto a pagar.</span>
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};
