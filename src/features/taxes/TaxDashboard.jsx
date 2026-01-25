// src/features/taxes/TaxDashboard.jsx
// Dashboard Fiscal Completo - Histórico e Compensações

import { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { useAuth } from '../auth/AuthContext';
import { getUserNotifications } from '../../services/notifications';
import { getUserTaxHistory, getTotalUncompensatedLoss } from '../../services/taxHistory';
import { calculatePeriodTax } from '../../utils/taxes/taxCalculator';
import { TAX_RULES } from '../../utils/taxes/taxRules';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../services/firebase';

export const TaxDashboard = () => {
  const { user } = useAuth();
  const [trades, setTrades] = useState([]);
  const [taxHistory, setTaxHistory] = useState([]);
  const [selectedMarket, setSelectedMarket] = useState('all');
  const [simulator, setSimulator] = useState({});
  const [loading, setLoading] = useState(true);

  // ✅ NOVO: Buscar trades do Firestore
  useEffect(() => {
    const loadTrades = async () => {
      if (!user?.uid) return;

      try {
        const tradesRef = collection(db, 'artifacts/trade-journal-public/users', user.uid, 'trades');
        const snapshot = await getDocs(tradesRef);
        
        const tradesData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        setTrades(tradesData);
      } catch (error) {
        console.error('Erro ao buscar trades:', error);
      }
    };

    loadTrades();
  }, [user]);

  // Carregar histórico fiscal
  useEffect(() => {

    const loadTaxHistory = async () => {
      if (!user?.uid) return;

      setLoading(true);

      try {
        const options = selectedMarket !== 'all' ? { market: selectedMarket } : {};
        const { success, data } = await getUserTaxHistory(user.uid, options);

        if (success) {
          setTaxHistory(data);
        }
      } catch (error) {
        console.error('Erro ao carregar histórico fiscal:', error);
      } finally {
        setLoading(false);
      }
    };

    loadTaxHistory();
  }, [user, selectedMarket]);

  // Simulador "E se fechar agora?"
  useEffect(() => {
    const simulateCurrentMonth = async () => {
      if (!user?.uid || trades.length === 0) return;

      const currentPeriod = new Date().toISOString().split('T')[0].slice(0, 7);
      const markets = ['b3daytrade', 'b3swing', 'forex', 'b3options'];
      const simResults = {};

      for (const market of markets) {
        const taxInfo = await calculatePeriodTax(trades, market, currentPeriod, user.uid);
        if (taxInfo && taxInfo.trades > 0) {
          simResults[market] = taxInfo;
        }
      }

      setSimulator(simResults);
    };

    simulateCurrentMonth();
  }, [trades, user]);

  // Calcular totais
  const totals = {
    taxPaid: taxHistory.reduce((sum, item) => sum + (item.taxAmount || 0), 0),
    totalProfit: taxHistory.reduce((sum, item) => sum + (item.consolidatedPnL || 0), 0),
    totalCompensated: taxHistory.reduce((sum, item) => sum + (item.compensatedAmount || 0), 0),
    activeLosses: taxHistory
      .filter(item => item.accumulatedLoss < 0)
      .reduce((sum, item) => sum + Math.abs(item.accumulatedLoss), 0)
  };

  const simulatedTax = Object.values(simulator).reduce((sum, item) => sum + (item.taxAmount || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <span className="text-4xl">📊</span>
        <div>
          <h1 className="text-3xl font-bold text-white">Central de Impostos</h1>
          <p className="text-zinc-400">Histórico fiscal e compensação de prejuízos</p>
        </div>
      </div>

      {/* Resumo Geral */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-red-900/20 to-red-800/10 border-red-500/30">
          <div className="text-center">
            <p className="text-zinc-400 text-sm mb-2">💸 Total Pago em Impostos</p>
            <p className="text-3xl font-bold text-red-400">
              R$ {totals.taxPaid.toFixed(2)}
            </p>
            <p className="text-xs text-zinc-500 mt-1">Histórico completo</p>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-900/20 to-emerald-800/10 border-emerald-500/30">
          <div className="text-center">
            <p className="text-zinc-400 text-sm mb-2">💰 Lucro Total Consolidado</p>
            <p className="text-3xl font-bold text-emerald-400">
              R$ {totals.totalProfit.toFixed(2)}
            </p>
            <p className="text-xs text-zinc-500 mt-1">Base tributável histórica</p>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-purple-900/20 to-purple-800/10 border-purple-500/30">
          <div className="text-center">
            <p className="text-zinc-400 text-sm mb-2">🎯 Total Compensado</p>
            <p className="text-3xl font-bold text-purple-400">
              R$ {totals.totalCompensated.toFixed(2)}
            </p>
            <p className="text-xs text-zinc-500 mt-1">Prejuízos já utilizados</p>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-blue-900/20 to-blue-800/10 border-blue-500/30">
          <div className="text-center">
            <p className="text-zinc-400 text-sm mb-2">📘 Prejuízos Ativos</p>
            <p className="text-3xl font-bold text-blue-400">
              R$ {totals.activeLosses.toFixed(2)}
            </p>
            <p className="text-xs text-zinc-500 mt-1">Disponível para compensar</p>
          </div>
        </Card>
      </div>

      {/* ✅ SIMULADOR "E se fechar agora?" */}
      {Object.keys(simulator).length > 0 && (
        <Card className="bg-amber-900/20 border-amber-500/50">
          <div className="flex items-start gap-3 mb-4">
            <span className="text-3xl">🔮</span>
            <div>
              <h2 className="text-xl font-bold text-amber-400">Simulador: E se fechar o mês agora?</h2>
              <p className="text-zinc-400 text-sm">Projeção de impostos com base nos trades atuais</p>
            </div>
          </div>

          <div className="space-y-3">
            {Object.entries(simulator).map(([market, data]) => {
              const rule = TAX_RULES[market];
              return (
                <div key={market} className="bg-zinc-800/50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="font-bold text-white">{rule.name}</p>
                      <p className="text-xs text-zinc-400">{data.trades} operações este mês</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-zinc-400">Imposto projetado:</p>
                      <p className={`text-xl font-bold ${data.taxAmount > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                        {data.taxAmount > 0 ? 'R$ ' + data.taxAmount.toFixed(2) : 'Isento'}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <p className="text-zinc-500">Lucro Bruto</p>
                      <p className={`font-bold ${data.consolidatedPnL >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        R$ {data.consolidatedPnL.toFixed(2)}
                      </p>
                    </div>
                    {data.compensatedAmount > 0 && (
                      <div>
                        <p className="text-zinc-500">Compensado</p>
                        <p className="font-bold text-purple-400">
                          - R$ {data.compensatedAmount.toFixed(2)}
                        </p>
                      </div>
                    )}
                    <div>
                      <p className="text-zinc-500">Base Tributável</p>
                      <p className="font-bold text-zinc-300">
                        R$ {data.taxableAmount.toFixed(2)}
                      </p>
                    </div>
                  </div>

                  {data.isExempt && (
                    <div className="mt-2 text-xs bg-blue-900/30 text-blue-300 px-2 py-1 rounded">
                      ✓ {data.exemptReason}
                    </div>
                  )}
                </div>
              );
            })}

            <div className="bg-zinc-900/50 rounded-lg p-3 border border-amber-500/30">
              <div className="flex items-center justify-between">
                <p className="font-bold text-amber-400">TOTAL A PAGAR (se fechar agora)</p>
                <p className="text-2xl font-bold text-amber-400">R$ {simulatedTax.toFixed(2)}</p>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Filtros */}
      <div className="flex items-center gap-3">
        <label className="text-zinc-400 text-sm font-bold">Filtrar por mercado:</label>
        <select
          value={selectedMarket}
          onChange={(e) => setSelectedMarket(e.target.value)}
          className="bg-zinc-800 text-white px-4 py-2 rounded-lg border border-zinc-700 focus:outline-none focus:border-blue-500"
        >
          <option value="all">Todos os mercados</option>
          <option value="b3daytrade">B3 Day Trade</option>
          <option value="b3swing">B3 Swing Trade</option>
          <option value="forex">Forex Internacional</option>
          <option value="b3options">Opções B3</option>
        </select>
      </div>

      {/* Histórico Fiscal */}
      <Card>
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          📜 Histórico Fiscal
          {loading && <span className="text-sm text-zinc-400">(carregando...)</span>}
        </h2>

        {taxHistory.length === 0 && !loading && (
          <div className="text-center py-8">
            <p className="text-zinc-500 text-lg mb-2">📭 Nenhum histórico fiscal encontrado</p>
            <p className="text-zinc-600 text-sm">Os impostos serão calculados automaticamente quando você adicionar trades.</p>
          </div>
        )}

        {taxHistory.length > 0 && (
          <div className="space-y-3">
            {taxHistory.map((item) => {
              const rule = TAX_RULES[item.market];
              const hasCompensation = (item.compensatedFrom || []).length > 0;

              return (
                <div
                  key={item.id}
                  className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700 hover:border-zinc-600 transition"
                >
                  {/* Header */}
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="font-bold text-white">{rule?.name || item.market}</p>
                      <p className="text-xs text-zinc-500">
                        Período: {item.period} • DARF {rule?.darfCode}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-zinc-400">Imposto pago:</p>
                      <p className={`text-xl font-bold ${item.taxAmount > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                        {item.taxAmount > 0 ? 'R$ ' + item.taxAmount.toFixed(2) : 'Isento'}
                      </p>
                    </div>
                  </div>

                  {/* Métricas */}
                  <div className="grid grid-cols-4 gap-3 text-sm">
                    <div>
                      <p className="text-zinc-500 text-xs">Lucro Consolidado</p>
                      <p className={`font-bold ${item.consolidatedPnL >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        R$ {item.consolidatedPnL?.toFixed(2) || '0.00'}
                      </p>
                    </div>

                    {item.previousLoss < 0 && (
                      <div>
                        <p className="text-zinc-500 text-xs">Prejuízo Anterior</p>
                        <p className="font-bold text-blue-400">
                          R$ {Math.abs(item.previousLoss).toFixed(2)}
                        </p>
                      </div>
                    )}

                    {item.compensatedAmount > 0 && (
                      <div>
                        <p className="text-zinc-500 text-xs">Compensado</p>
                        <p className="font-bold text-purple-400">
                          R$ {item.compensatedAmount.toFixed(2)}
                        </p>
                      </div>
                    )}

                    <div>
                      <p className="text-zinc-500 text-xs">Base Tributável</p>
                      <p className="font-bold text-zinc-300">
                        R$ {item.taxableAmount?.toFixed(2) || '0.00'}
                      </p>
                    </div>
                  </div>

                  {/* Alerta de compensação usada */}
                  {hasCompensation && (
                    <div className="mt-3 bg-purple-900/20 border border-purple-500/30 rounded p-2 text-xs text-purple-300">
                      <p className="font-bold mb-1">💰 Compensações realizadas a partir deste prejuízo:</p>
                      {item.compensatedFrom.map((comp, idx) => (
                        <p key={idx} className="text-zinc-400">
                          • {comp.period}: R$ {comp.amount.toFixed(2)}
                        </p>
                      ))}
                    </div>
                  )}

                  {/* Prejuízo acumulado ativo */}
                  {item.accumulatedLoss < 0 && (
                    <div className="mt-3 bg-blue-900/20 border border-blue-500/30 rounded p-2 text-xs text-blue-300">
                      <p>
                        📘 Prejuízo de <strong>R$ {Math.abs(item.accumulatedLoss).toFixed(2)}</strong> disponível para compensação futura
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Alerta Educativo */}
      <Card className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 border-blue-500/50">
        <div className="flex items-start gap-3">
          <span className="text-3xl">💡</span>
          <div>
            <p className="text-blue-400 font-bold mb-2">Como funciona a compensação de prejuízos?</p>
            <div className="text-zinc-300 text-sm space-y-2">
              <p>
                <strong>✅ Automático:</strong> O TraderPro calcula e compensa prejuízos automaticamente.
              </p>
              <p>
                <strong>📅 Por mercado:</strong> Prejuízos de Day Trade só compensam Day Trade. Forex só compensa Forex, etc.
              </p>
              <p>
                <strong>⏳ Sem prazo:</strong> Prejuízos podem ser compensados indefinidamente em meses futuros.
              </p>
              <p>
                <strong>💰 Exemplo:</strong> Se você teve prejuízo de R$ 5.000 em janeiro e lucro de R$ 8.000 em fevereiro, 
                pagará imposto apenas sobre R$ 3.000 (8.000 - 5.000).
              </p>
              <p className="text-blue-400">
                <strong>🎉 Economia:</strong> Você já economizou <strong>R$ {(totals.totalCompensated * 0.15).toFixed(2)}</strong> em impostos 
                através da compensação automática!
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
