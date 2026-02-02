// src/services/taxRecalculator.js
// Serviço para recalcular todo o histórico fiscal baseado nos trades atuais

import { collection, getDocs, writeBatch, doc, deleteDoc } from 'firebase/firestore';
import { db } from './firebase';
import { calculatePeriodTax } from '../utils/taxes/taxCalculator';
import { TAX_RULES } from '../utils/taxes/taxRules'; // ✅ CORRIGIDO: caminho relativo

/**
 * 🎯 Normalizar nome do mercado para garantir consistência
 */
const normalizeMarket = (market) => {
  const marketMap = {
    'b3_day_trade': 'b3daytrade',
    'b3daytrade': 'b3daytrade',
    'b3_swing': 'b3swing',
    'b3swing': 'b3swing',
    'forex': 'forex',
    'b3_options': 'b3options',
    'b3options': 'b3options'
  };
  
  return marketMap[market?.toLowerCase()] || market;
};

/**
 * 🎯 Gerar ID único consistente
 */
const generateTaxDocId = (period, market) => {
  const normalizedMarket = normalizeMarket(market);
  return `${period}_${normalizedMarket}`;
};

/**
 * Recalcula TODO o histórico fiscal de um usuário
 * @param {string} userId - ID do usuário
 * @returns {Promise<{success: boolean, message: string, stats: object}>}
 */
export const recalculateAllTaxHistory = async (userId) => {
  try {
    console.log('🔄 Iniciando recálculo completo do histórico fiscal...');

    // 1️⃣ Buscar todos os trades do usuário
    const tradesRef = collection(db, 'artifacts/trade-journal-public/users', userId, 'trades');
    const tradesSnapshot = await getDocs(tradesRef);

    const trades = tradesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    console.log(`📊 ${trades.length} trades encontrados`);

    // 2️⃣ LIMPAR TODO histórico fiscal antigo (incluindo duplicatas)
    const taxHistoryRef = collection(db, 'artifacts/trade-journal-public/users', userId, 'taxHistory');
    const taxHistorySnapshot = await getDocs(taxHistoryRef);

    console.log(`🗑️ Removendo ${taxHistorySnapshot.size} registros antigos (incluindo duplicatas)...`);

    // Deletar em lotes
    const deletePromises = taxHistorySnapshot.docs.map(docSnapshot => 
      deleteDoc(docSnapshot.ref)
    );
    
    await Promise.all(deletePromises);

    if (trades.length === 0) {
      return {
        success: true,
        message: 'Histórico limpo. Nenhum trade para processar.',
        stats: { trades: 0, periods: 0, deleted: taxHistorySnapshot.size }
      };
    }

    // 3️⃣ Agrupar trades por período e mercado (com normalização)
    const tradesByPeriodAndMarket = {};

    trades.forEach(trade => {
      const tradeDate = new Date(trade.date);
      const period = `${tradeDate.getFullYear()}-${String(tradeDate.getMonth() + 1).padStart(2, '0')}`;
      const market = normalizeMarket(trade.market);

      const key = `${period}_${market}`;

      if (!tradesByPeriodAndMarket[key]) {
        tradesByPeriodAndMarket[key] = {
          period,
          market,
          trades: []
        };
      }

      tradesByPeriodAndMarket[key].trades.push(trade);
    });

    console.log(`📅 ${Object.keys(tradesByPeriodAndMarket).length} períodos únicos identificados`);

    // 4️⃣ Recalcular impostos para cada período/mercado
    const batch = writeBatch(db);
    let batchCount = 0;
    const maxBatchSize = 500;

    for (const [key, data] of Object.entries(tradesByPeriodAndMarket)) {
      const taxInfo = await calculatePeriodTax(data.trades, data.market, data.period, userId);

      if (taxInfo) {
        const docId = generateTaxDocId(data.period, data.market);
        const docRef = doc(taxHistoryRef, docId);
        
        batch.set(docRef, {
          period: data.period,
          market: data.market,
          ...taxInfo,
          recalculatedAt: new Date().toISOString()
        });

        batchCount++;

        if (batchCount >= maxBatchSize) {
          await batch.commit();
          batchCount = 0;
        }
      }
    }

    if (batchCount > 0) {
      await batch.commit();
    }

    console.log(`✅ ${Object.keys(tradesByPeriodAndMarket).length} registros fiscais criados`);

    return {
      success: true,
      message: `Histórico fiscal recalculado com sucesso!`,
      stats: {
        trades: trades.length,
        periods: Object.keys(tradesByPeriodAndMarket).length,
        deleted: taxHistorySnapshot.size
      }
    };

  } catch (error) {
    console.error('❌ Erro ao recalcular histórico fiscal:', error);
    return {
      success: false,
      message: error.message,
      stats: null
    };
  }
};

/**
 * Recalcula histórico fiscal de períodos específicos (para atualizações pontuais)
 * @param {string} userId - ID do usuário
 * @param {Array<string>} periods - Array de períodos no formato "YYYY-MM"
 * @param {Array<string>} markets - Array de mercados
 * @returns {Promise<{success: boolean, message: string}>}
 */
export const recalculateSpecificPeriods = async (userId, periods, markets) => {
  try {
    console.log('🔄 Recalculando períodos específicos:', periods, markets);

    const tradesRef = collection(db, 'artifacts/trade-journal-public/users', userId, 'trades');
    const tradesSnapshot = await getDocs(tradesRef);

    const trades = tradesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    const taxHistoryRef = collection(db, 'artifacts/trade-journal-public/users', userId, 'taxHistory');

    // 🎯 NORMALIZAR mercados
    const normalizedMarkets = markets.map(m => normalizeMarket(m));

    // 🎯 Deletar documentos antigos ANTES de criar novos (evita duplicatas)
    const deletePromises = [];
    for (const period of periods) {
      for (const market of normalizedMarkets) {
        const docId = generateTaxDocId(period, market);
        const docRef = doc(taxHistoryRef, docId);
        deletePromises.push(deleteDoc(docRef).catch(() => {})); // Ignora erro se não existir
      }
    }
    await Promise.all(deletePromises);

    // 🎯 Criar novos documentos
    const batch = writeBatch(db);
    let hasData = false;

    for (const period of periods) {
      for (const market of normalizedMarkets) {
        // Filtrar trades do período/mercado
        const periodTrades = trades.filter(trade => {
          const tradeDate = new Date(trade.date);
          const tradePeriod = `${tradeDate.getFullYear()}-${String(tradeDate.getMonth() + 1).padStart(2, '0')}`;
          const tradeMarket = normalizeMarket(trade.market);
          return tradePeriod === period && tradeMarket === market;
        });

        if (periodTrades.length > 0) {
          const taxInfo = await calculatePeriodTax(periodTrades, market, period, userId);

          if (taxInfo) {
            const docId = generateTaxDocId(period, market);
            const docRef = doc(taxHistoryRef, docId);
            
            batch.set(docRef, {
              period,
              market,
              ...taxInfo,
              recalculatedAt: new Date().toISOString()
            });

            hasData = true;
          }
        }
      }
    }

    if (hasData) {
      await batch.commit();
    }

    return {
      success: true,
      message: 'Períodos recalculados com sucesso'
    };

  } catch (error) {
    console.error('❌ Erro ao recalcular períodos:', error);
    return {
      success: false,
      message: error.message
    };
  }
};
