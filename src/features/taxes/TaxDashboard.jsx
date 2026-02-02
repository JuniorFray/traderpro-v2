// src/features/taxes/TaxDashboard.jsx
// Dashboard Fiscal Completo - Histórico e Compensações

import { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { useAuth } from '../auth/AuthContext';
import { getUserTaxHistory } from '../../services/taxHistory';
import { recalculateAllTaxHistory } from '../../services/taxRecalculator';
import { calculatePeriodTax } from '../../utils/taxes/taxCalculator';
import { TAX_RULES } from '../../utils/taxes/taxRules';
import { collection, getDocs, deleteDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';

export const TaxDashboard = () => {
  const { user } = useAuth();
  const [trades, setTrades] = useState([]);
  const [taxHistory, setTaxHistory] = useState([]);
  const [selectedMarket, setSelectedMarket] = useState('all');
  const [simulator, setSimulator] = useState({});
  const [loading, setLoading] = useState(true);
  const [recalculating, setRecalculating] = useState(false);

  // 🎯 Detectar moeda baseada no mercado
  const getCurrencyByMarket = (market) => {
    return market === 'forex' ? 'USD' : 'BRL';
  };

  // 🎯 Formatar valor com símbolo correto
  const formatCurrencyByMarket = (value, market) => {
    const currency = getCurrencyByMarket(market);
    const symbol = currency === 'USD' ? '$' : 'R$';
    const numValue = parseFloat(value) || 0;
    
    return `${symbol} ${numValue.toFixed(2)}`;
  };

  // 🚨 NOVA FUNÇÃO: Limpeza de emergência
  const handleEmergencyCleanup = async () => {
    if (!window.confirm('⚠️ LIMPEZA DE EMERGÊNCIA\n\nIsso vai:\n1. Deletar TODOS os registros fiscais\n2. Listar IDs duplicados no console\n3. Você poderá recalcular depois\n\nContinuar?')) {
      return;
    }

    setLoading(true);

    try {
      console.log('🚨 Iniciando limpeza de emergência...');
      
      // Buscar TODOS os documentos
      const taxRef = collection(db, 'artifacts/trade-journal-public/users', user.uid, 'taxHistory');
      const snapshot = await getDocs(taxRef);

      console.log(`📋 Total de documentos encontrados: ${snapshot.size}`);
      
      // Listar todos os IDs
      const docIds = [];
      snapshot.docs.forEach(doc => {
        console.log(`📄 ID: ${doc.id}`, doc.data());
        docIds.push(doc.id);
      });

      // Deletar TODOS
      const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deletePromises);

      console.log('✅ Todos os documentos deletados:', docIds);
      
      // Recarregar
      setTaxHistory([]);
      await loadTaxHistory();

      alert(`✅ Limpeza concluída!\n\n${snapshot.size} documentos removidos.\n\nIDs encontrados:\n${docIds.join('\n')}\n\nAgora clique em "Recalcular Histórico" para recriar.`);
      
    } catch (error) {
      console.error('❌ Erro na limpeza:', error);
      alert('❌ Erro: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // 🎯 NOVA FUNÇÃO: Recalcular histórico fiscal completo
  const handleRecalculate = async () => {
    if (!window.confirm('🔄 Deseja RECALCULAR todo o histórico fiscal?\n\nIsso vai:\n✓ Limpar registros antigos\n✓ Recalcular com base nos trades atuais\n✓ Corrigir inconsistências\n\nContinuar?')) {
      return;
    }

    setRecalculating(true);

    try {
      const result = await recalculateAllTaxHistory(user.uid);

      if (result.success) {
        alert(`✅ ${result.message}\n\n📊 Estatísticas:\n• ${result.stats.trades} trades processados\n• ${result.stats.periods} períodos recalculados\n• ${result.stats.deleted} registros antigos removidos`);
        
        // Recarregar histórico
        await loadTaxHistory();
      } else {
        alert('❌ Erro ao recalcular: ' + result.message);
      }
    } catch (error) {
      console.error('Erro ao recalcular histórico fiscal', error);
      alert('❌ Erro ao recalcular: ' + error.message);
    } finally {
      setRecalculating(false);
    }
  };

  // Buscar trades do Firestore
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
      console.error('Erro ao buscar trades', error);
    }
  };

  // Carregar histórico fiscal
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
      console.error('Erro ao carregar histórico fiscal', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTrades();
  }, [user]);

  useEffect(() => {
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

  // 🎯 Calcular totais separados por moeda
  const totals = {
    taxPaidUSD: taxHistory.filter(item => item.market === 'forex').reduce((sum, item) => sum + (item.taxAmount || 0), 0),
    taxPaidBRL: taxHistory.filter(item => item.market !== 'forex').reduce((sum, item) => sum + (item.taxAmount || 0), 0),
    
    totalProfitUSD: taxHistory.filter(item => item.market === 'forex').reduce((sum, item) => sum + (item.consolidatedPnL || 0), 0),
    totalProfitBRL: taxHistory.filter(item => item.market !== 'forex').reduce((sum, item) => sum + (item.consolidatedPnL || 0), 0),
    
    totalCompensatedUSD: taxHistory.filter(item => item.market === 'forex').reduce((sum, item) => sum + (item.compensatedAmount || 0), 0),
    totalCompensatedBRL: taxHistory.filter(item => item.market !== 'forex').reduce((sum, item) => sum + (item.compensatedAmount || 0), 0),
    
    activeLossesUSD: taxHistory
      .filter(item => item.market === 'forex' && item.accumulatedLoss < 0)
      .reduce((sum, item) => sum + Math.abs(item.accumulatedLoss), 0),
    activeLossesBRL: taxHistory
      .filter(item => item.market !== 'forex' && item.accumulatedLoss < 0)
      .reduce((sum, item) => sum + Math.abs(item.accumulatedLoss), 0)
  };

  const simulatedTaxUSD = Object.entries(simulator)
    .filter(([market]) => market === 'forex')
    .reduce((sum, [, item]) => sum + (item.taxAmount || 0), 0);
  
  const simulatedTaxBRL = Object.entries(simulator)
    .filter(([market]) => market !== 'forex')
    .reduce((sum, [, item]) => sum + (item.taxAmount || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-4xl">📊</span>
          <div>
            <h1 className="text-3xl font-bold text-white">Central de Impostos</h1>
            <p className="text-zinc-400">Histórico fiscal e compensação de prejuízos</p>
          </div>
        </div>

        {/* 🎯 BOTÕES DE AÇÃO */}
        <div className="flex gap-2">
          <button
            onClick={handleEmergencyCleanup}
            disabled={loading}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              loading
                ? 'bg-zinc-700 text-zinc-400 cursor-not-allowed'
                : 'bg-red-600/80 hover:bg-red-700 text-white'
            }`}
          >
            {loading ? '⏳ Processando...' : '🚨 Limpar Tudo'}
          </button>
          
          <button
            onClick={handleRecalculate}
            disabled={recalculating}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              recalculating
                ? 'bg-zinc-700 text-zinc-400 cursor-not-allowed'
                : 'bg-blue-600/80 hover:bg-blue-700 text-white'
            }`}
          >
            {recalculating ? '⏳ Recalculando...' : '🔄 Recalcular'}
          </button>
        </div>
      </div>

      {/* 🎯 Resumo Geral - Separado por moeda */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* FOREX (USD) */}
        <Card className="bg-gradient-to-br from-blue-900/20 to-blue-800/10 border-blue-500/30">
          <div className="text-center">
            <p className="text-zinc-400 text-sm mb-2">💸 Forex Internacional (USD)</p>
            <div className="space-y-2">
              <div>
                <p className="text-xs text-zinc-500">Total Pago em Impostos</p>
                <p className="text-2xl font-bold text-red-400">
                  $ {totals.taxPaidUSD.toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-xs text-zinc-500">Lucro Total Consolidado</p>
                <p className="text-2xl font-bold text-emerald-400">
                  $ {totals.totalProfitUSD.toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-xs text-zinc-500">Prejuízos Ativos</p>
                <p className="text-2xl font-bold text-blue-400">
                  $ {totals.activeLossesUSD.toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* B3 (BRL) */}
        <Card className="bg-gradient-to-br from-emerald-900/20 to-emerald-800/10 border-emerald-500/30">
          <div className="text-center">
            <p className="text-zinc-400 text-sm mb-2">🇧🇷 Mercado B3 (BRL)</p>
            <div className="space-y-2">
              <div>
                <p className="text-xs text-zinc-500">Total Pago em Impostos</p>
                <p className="text-2xl font-bold text-red-400">
                  R$ {totals.taxPaidBRL.toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-xs text-zinc-500">Lucro Total Consolidado</p>
                <p className="text-2xl font-bold text-emerald-400">
                  R$ {totals.totalProfitBRL.toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-xs text-zinc-500">Prejuízos Ativos</p>
                <p className="text-2xl font-bold text-blue-400">
                  R$ {totals.activeLossesBRL.toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* 🎯 SIMULADOR "E se fechar agora?" */}
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
              const currency = getCurrencyByMarket(market);
              const symbol = currency === 'USD' ? '$' : 'R$';
              
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
                        {data.taxAmount > 0 ? `${symbol} ${data.taxAmount.toFixed(2)}` : 'Isento'}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <p className="text-zinc-500">Lucro Bruto</p>
                      <p className={`font-bold ${data.consolidatedPnL > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {symbol} {data.consolidatedPnL.toFixed(2)}
                      </p>
                    </div>
                    {data.compensatedAmount > 0 && (
                      <div>
                        <p className="text-zinc-500">Compensado</p>
                        <p className="font-bold text-purple-400">
                          - {symbol} {data.compensatedAmount.toFixed(2)}
                        </p>
                      </div>
                    )}
                    <div>
                      <p className="text-zinc-500">Base Tributável</p>
                      <p className="font-bold text-zinc-300">
                        {symbol} {data.taxableAmount.toFixed(2)}
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

            {/* Total separado por moeda */}
            <div className="space-y-2 mt-4">
              {simulatedTaxUSD > 0 && (
                <div className="bg-zinc-900/50 rounded-lg p-3 border border-amber-500/30">
                  <div className="flex items-center justify-between">
                    <p className="font-bold text-amber-400">TOTAL A PAGAR - Forex (se fechar agora)</p>
                    <p className="text-2xl font-bold text-amber-400">$ {simulatedTaxUSD.toFixed(2)}</p>
                  </div>
                </div>
              )}
              
              {simulatedTaxBRL > 0 && (
                <div className="bg-zinc-900/50 rounded-lg p-3 border border-amber-500/30">
                  <div className="flex items-center justify-between">
                    <p className="font-bold text-amber-400">TOTAL A PAGAR - B3 (se fechar agora)</p>
                    <p className="text-2xl font-bold text-amber-400">R$ {simulatedTaxBRL.toFixed(2)}</p>
                  </div>
                </div>
              )}
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

      {/* 🎯 Histórico Fiscal */}
      <Card>
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          📜 Histórico Fiscal
          {loading && <span className="text-sm text-zinc-400">(carregando...)</span>}
        </h2>

        {taxHistory.length === 0 && !loading && (
          <div className="text-center py-8">
            <p className="text-zinc-500 text-lg mb-2">📋 Nenhum histórico fiscal encontrado</p>
            <p className="text-zinc-600 text-sm">Os impostos serão calculados automaticamente quando você adicionar trades.</p>
          </div>
        )}

        {taxHistory.length > 0 && (
          <div className="space-y-3">
            {taxHistory.map(item => {
              const rule = TAX_RULES[item.market];
              const hasCompensation = (item.compensatedFrom || []).length > 0;
              const symbol = getCurrencyByMarket(item.market) === 'USD' ? '$' : 'R$';

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
                        {item.taxAmount > 0 ? `${symbol} ${item.taxAmount.toFixed(2)}` : 'Isento'}
                      </p>
                    </div>
                  </div>

                  {/* Métricas */}
                  <div className="grid grid-cols-4 gap-3 text-sm">
                    <div>
                      <p className="text-zinc-500 text-xs">Lucro Consolidado</p>
                      <p className={`font-bold ${item.consolidatedPnL > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {symbol} {item.consolidatedPnL?.toFixed(2) || '0.00'}
                      </p>
                    </div>
                    
                    {hasCompensation && (
                      <div>
                        <p className="text-zinc-500 text-xs">Compensado</p>
                        <p className="font-bold text-purple-400">
                          - {symbol} {item.compensatedAmount?.toFixed(2) || '0.00'}
                        </p>
                      </div>
                    )}
                    
                    <div>
                      <p className="text-zinc-500 text-xs">Base Tributável</p>
                      <p className="font-bold text-zinc-300">
                        {symbol} {item.taxableAmount?.toFixed(2) || '0.00'}
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-zinc-500 text-xs">Trades</p>
                      <p className="font-bold text-zinc-300">{item.trades || 0}</p>
                    </div>
                  </div>

                  {/* Alertas */}
                  {item.accumulatedLoss < 0 && (
                    <div className="mt-3 bg-blue-900/30 text-blue-300 px-3 py-2 rounded text-xs">
                      📘 Prejuízo de {symbol} {Math.abs(item.accumulatedLoss).toFixed(2)} disponível para compensação futura
                    </div>
                  )}

                  {hasCompensation && (
                    <div className="mt-3 bg-purple-900/30 text-purple-300 px-3 py-2 rounded text-xs">
                      💰 Prejuízo anterior compensado - Economia de {symbol} {(item.compensatedAmount * (rule?.rate || 0.15)).toFixed(2)} em impostos!
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Info sobre Compensação */}
      <Card className="bg-blue-900/10 border-blue-500/30">
        <div className="flex gap-3">
          <span className="text-2xl">💡</span>
          <div className="text-sm text-zinc-400 space-y-2">
            <p className="font-bold text-blue-300">Como funciona a compensação de prejuízos?</p>
            <ul className="list-disc list-inside space-y-1">
              <li>✅ Automático: O TraderPro calcula e compensa prejuízos automaticamente.</li>
              <li>📅 Por mercado: Prejuízos de Day Trade só compensam Day Trade. Forex só compensa Forex, etc.</li>
              <li>⏳ Sem prazo: Prejuízos podem ser compensados indefinidamente em meses futuros.</li>
              <li>💰 Exemplo: Se você teve prejuízo de R$ 5.000 em janeiro e lucro de R$ 8.000 em fevereiro, pagará imposto apenas sobre R$ 3.000 (8.000 - 5.000).</li>
              <li>🎉 Economia: Você já economizou {formatCurrencyByMarket(totals.totalCompensatedBRL, 'b3daytrade')} (B3) e {formatCurrencyByMarket(totals.totalCompensatedUSD, 'forex')} (Forex) em impostos através da compensação automática!</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
};
