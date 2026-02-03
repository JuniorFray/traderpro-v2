// src/services/taxHistory.js
// Serviço de Histórico Fiscal - Compensação de Prejuízos

import { db } from './firebase';
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs,
  setDoc, 
  query, 
  where,
  orderBy,
  serverTimestamp 
} from 'firebase/firestore';

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
 * 🎯 CORRIGIDO: Buscar prejuízo acumulado de um mercado até determinado período
 */
// src/services/taxHistory.js
export const getAccumulatedLoss = async (userId, market, period) => {
  try {
    const normalizedMarket = normalizeMarket(market);
    
    const taxHistoryRef = collection(
      db, 
      'artifacts/trade-journal-public/users', 
      userId, 
      'taxHistory'
    );

    const q = query(
      taxHistoryRef,
      where('market', '==', normalizedMarket)
    );

    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      console.log(`🔍 Nenhum histórico anterior encontrado para ${normalizedMarket}`);
      return 0;
    }

    // ✅ CORRIGIDO: Filtrar e ORDENAR CORRETAMENTE
    const previousRecords = snapshot.docs
      .map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      .filter(record => record.period < period)  // Somente períodos anteriores
      .sort((a, b) => b.period.localeCompare(a.period));  // ✅ ORDEM DECRESCENTE (mais recente primeiro)

    if (previousRecords.length === 0) {
      console.log(`📊 ${normalizedMarket} - Primeiro período, sem prejuízo anterior`);
      return 0;
    }

    console.log(`🔍 Períodos anteriores encontrados para ${normalizedMarket}:`, 
      previousRecords.map(r => r.period));

    // Pegar o mais recente (primeiro da lista após ordenação)
    const lastRecord = previousRecords[0];
    
    console.log(`📊 ${normalizedMarket} - Último registro:`, {
      period: lastRecord.period,
      accumulatedLoss: lastRecord.accumulatedLoss,
      consolidatedPnL: lastRecord.consolidatedPnL
    });

    const accumulatedLoss = lastRecord.accumulatedLoss || 0;

    if (accumulatedLoss < 0) {
      console.log(`💰 ${normalizedMarket} - Prejuízo acumulado: ${accumulatedLoss}`);
      return accumulatedLoss;
    } else {
      console.log(`✅ ${normalizedMarket} - Sem prejuízo acumulado (zerado no período anterior)`);
      return 0;
    }

  } catch (error) {
    console.error('❌ Erro ao buscar prejuízo acumulado:', error);
    return 0;
  }
};

/**
 * Salvar histórico fiscal do período
 */
export const saveTaxHistory = async (userId, taxData) => {
  try {
    const normalizedMarket = normalizeMarket(taxData.market);
    const periodId = `${taxData.period}_${normalizedMarket}`;
    
    const taxHistoryRef = doc(
      db,
      'artifacts/trade-journal-public/users',
      userId,
      'taxHistory',
      periodId
    );

    console.log(`💾 Salvando histórico fiscal: ${periodId}`, {
      consolidatedPnL: taxData.consolidatedPnL,
      previousLoss: taxData.previousLoss,
      compensatedAmount: taxData.compensatedAmount,
      accumulatedLoss: taxData.accumulatedLoss,
      taxableAmount: taxData.taxableAmount
    });

    await setDoc(taxHistoryRef, {
      ...taxData,
      market: normalizedMarket,
      userId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    return { success: true };
  } catch (error) {
    console.error('❌ Erro ao salvar histórico fiscal:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Buscar histórico fiscal completo de um usuário
 */
export const getUserTaxHistory = async (userId, options = {}) => {
  try {
    const taxHistoryRef = collection(
      db,
      'artifacts/trade-journal-public/users',
      userId,
      'taxHistory'
    );

    let q;

    // Filtrar por mercado se especificado
    if (options.market) {
      const normalizedMarket = normalizeMarket(options.market);
      q = query(taxHistoryRef, where('market', '==', normalizedMarket));
    } else {
      q = query(taxHistoryRef);
    }

    const snapshot = await getDocs(q);

    const history = snapshot.docs
      .map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      .sort((a, b) => b.period.localeCompare(a.period)); // Ordenar por período decrescente

    return { success: true, data: history };
  } catch (error) {
    console.error('Erro ao buscar histórico fiscal:', error);
    return { success: false, error: error.message, data: [] };
  }
};

/**
 * Registrar compensação de prejuízo
 */
export const recordCompensation = async (userId, compensationData) => {
  try {
    const { fromPeriod, toPeriod, market, amount } = compensationData;
    
    const normalizedMarket = normalizeMarket(market);
    const fromPeriodId = `${fromPeriod}_${normalizedMarket}`;
    
    const fromRef = doc(
      db,
      'artifacts/trade-journal-public/users',
      userId,
      'taxHistory',
      fromPeriodId
    );

    const fromDoc = await getDoc(fromRef);
    
    if (fromDoc.exists()) {
      const data = fromDoc.data();
      const compensatedFrom = data.compensatedFrom || [];
      
      compensatedFrom.push({
        period: toPeriod,
        amount,
        date: new Date().toISOString()
      });

      console.log(`📝 Registrando compensação: ${amount} de ${fromPeriod} para ${toPeriod}`);

      await setDoc(fromRef, {
        ...data,
        compensatedFrom,
        updatedAt: serverTimestamp()
      });
    }

    return { success: true };
  } catch (error) {
    console.error('❌ Erro ao registrar compensação:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Calcular total de prejuízos não compensados
 */
export const getTotalUncompensatedLoss = async (userId, market) => {
  try {
    const normalizedMarket = normalizeMarket(market);
    const { success, data } = await getUserTaxHistory(userId, { market: normalizedMarket });

    if (!success) return 0;

    // Somar prejuízos que ainda não foram totalmente compensados
    let totalLoss = 0;

    data.forEach(record => {
      if (record.accumulatedLoss && record.accumulatedLoss < 0) {
        // Calcular quanto já foi compensado
        const compensated = (record.compensatedFrom || [])
          .reduce((sum, comp) => sum + comp.amount, 0);

        // Prejuízo restante
        const remaining = Math.abs(record.accumulatedLoss) - compensated;
        
        if (remaining > 0) {
          totalLoss += remaining;
        }
      }
    });

    return totalLoss;
  } catch (error) {
    console.error('Erro ao calcular prejuízo não compensado:', error);
    return 0;
  }
};
