import { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { calculatePeriodTax } from '../../utils/taxes/taxCalculator';
import { useAuth } from '../auth/AuthContext';

export const ForexDashboard = ({ trades = [] }) => {
  const { user } = useAuth();
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
    previousLoss: 0,
    compensatedAmount: 0,
    newAccumulatedLoss: 0
  });

  useEffect(() => {
    const loadStats = async () => {
  const forexTrades = trades.filter(t => t.market === 'forex');
  
  console.log('🔍 ForexDashboard - Total trades:', forexTrades.length);
  console.log('🔍 ForexDashboard - userId:', user?.uid);
  
  if (forexTrades.length === 0) {
    return;
  }

  const currentPeriod = new Date().toISOString().split('T')[0].slice(0, 7);
  console.log('🔍 ForexDashboard - Período:', currentPeriod);
  
  const taxInfo = await calculatePeriodTax(forexTrades, 'forex', currentPeriod, user?.uid);
  
  console.log('🔍 ForexDashboard - taxInfo:', taxInfo);


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
        avgPnl: (taxInfo.consolidatedPnL || 0) / forexTrades.length,
        winRate: (winning.length / forexTrades.length) * 100,
        bestTrade,
        worstTrade,
        isNegativeMonth: taxInfo.consolidatedPnL < 0,
        previousLoss: taxInfo.previousLoss || 0,
        compensatedAmount: taxInfo.compensatedAmount || 0,
        newAccumulatedLoss: taxInfo.newAccumulatedLoss || 0
      });
    };

    loadStats();
  }, [trades, user]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <span className="text-4xl">🌍</span>
        <div>
          <h1 className="text-3xl font-bold text-white">Forex Internacional</h1>
          <p className="text-zinc-400">Operações em mercados internacionais</p>
        </div>
      </div>

      {stats.compensatedAmount > 0 && (
        <Card className="bg-purple-900/20 border-purple-500/50">
          <div className="flex items-start gap-3">
            <span className="text-2xl">💰</span>
            <div>
              <p className="text-purple-400 font-bold mb-1">Prejuízo Compensado!</p>
              <p className="text-zinc-300 text-sm">
                Prejuízo anterior de <strong>R$ {Math.abs(stats.previousLoss).toFixed(2)}</strong> foi usado para compensar o lucro deste mês.
                <br />
                <strong>Compensado:</strong> R$ {stats.compensatedAmount.toFixed(2)}
                <br />
                <strong>Base tributável:</strong> R$ {(stats.consolidatedPnL + stats.previousLoss).toFixed(2)}
                <br />
                <span className="text-purple-300">Você economizou R$ {(stats.compensatedAmount * 0.15).toFixed(2)} em impostos! 🎉</span>
              </p>
            </div>
          </div>
        </Card>
      )}

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
                <br />
                {stats.previousLoss < 0 && (
                  <>
                    Prejuízo acumulado total: <strong>R$ {Math.abs(stats.newAccumulatedLoss).toFixed(2)}</strong>
                    <br />
                  </>
                )}
                <span className="text-blue-300">Poderá ser compensado em meses futuros com lucro.</span>
              </p>
            </div>
          </div>
        </Card>
      )}

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
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <div className="text-center">
            <p className="text-zinc-400 text-sm mb-2">Lucro Bruto</p>
            <p className={`text-3xl font-bold ${stats.consolidatedPnL >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              R$ {stats.consolidatedPnL.toFixed(2)}
            </p>
            <p className="text-xs text-zinc-500 mt-1">Soma de todos os trades</p>
          </div>
        </Card>

        {stats.compensatedAmount > 0 && (
          <Card>
            <div className="text-center">
              <p className="text-zinc-400 text-sm mb-2">Prejuízo Compensado</p>
              <p className="text-3xl font-bold text-purple-400">
                - R$ {stats.compensatedAmount.toFixed(2)}
              </p>
              <p className="text-xs text-zinc-500 mt-1">Abatido do mês anterior</p>
            </div>
          </Card>
        )}

        <Card>
          <div className="text-center">
            <p className="text-zinc-400 text-sm mb-2">Imposto DARF 8523</p>
            <p className="text-3xl font-bold text-red-400">
              - R$ {stats.totalTax.toFixed(2)}
            </p>
            <p className="text-xs text-zinc-500 mt-1">15% sobre lucro {stats.compensatedAmount > 0 ? 'líquido' : 'bruto'}</p>
          </div>
        </Card>

        <Card>
          <div className="text-center">
            <p className="text-zinc-400 text-sm mb-2">Lucro Final</p>
            <p className={`text-3xl font-bold ${(stats.consolidatedPnL - stats.totalTax) >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              R$ {(stats.consolidatedPnL - stats.totalTax).toFixed(2)}
            </p>
            <p className="text-xs text-zinc-500 mt-1">Após impostos</p>
          </div>
        </Card>
      </div>

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

      <Card className="bg-amber-900/20 border-amber-500/50">
        <div className="flex items-start gap-3">
          <span className="text-2xl">⚠️</span>
          <div>
            <p className="text-amber-400 font-bold mb-1">Lembrete Fiscal</p>
            <p className="text-zinc-300 text-sm">
              Forex tem alíquota de <strong>15%</strong> sobre o lucro consolidado mensal.
              <br />
              Pagamento via DARF 8523 até o último dia útil do mês seguinte.
              <br />
              <span className="text-amber-300">Se o mês fechar negativo, não há imposto a pagar.</span>
              <br />
              <strong>✅ Compensação automática:</strong> Prejuízos de meses anteriores são abatidos automaticamente.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};
