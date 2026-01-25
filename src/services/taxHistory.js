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
 * Buscar prejuízo acumulado de um mercado até determinado período
 */
export const getAccumulatedLoss = async (userId, market, period) => {
  try {
    const taxHistoryRef = collection(
      db, 
      'artifacts/trade-journal-public/users', 
      userId, 
      'taxHistory'
    );

    // Buscar histórico do mesmo mercado antes do período atual
    const q = query(
      taxHistoryRef,
      where('market', '==', market),
      where('period', '<', period),
      orderBy('period', 'desc')
    );

    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return 0; // Sem prejuízo acumulado
    }

    // Pegar o mais recente
    const lastRecord = snapshot.docs[0].data();
    
    // Se tem prejuízo acumulado negativo, retornar
    if (lastRecord.accumulatedLoss < 0) {
      return lastRecord.accumulatedLoss;
    }

    return 0;
  } catch (error) {
    console.error('Erro ao buscar prejuízo acumulado:', error);
    return 0;
  }
};

/**
 * Salvar histórico fiscal do período
 */
export const saveTaxHistory = async (userId, taxData) => {
  try {
    const periodId = `${taxData.period}-${taxData.market}`;
    const taxHistoryRef = doc(
      db,
      'artifacts/trade-journal-public/users',
      userId,
      'taxHistory',
      periodId
    );

    await setDoc(taxHistoryRef, {
      ...taxData,
      userId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    return { success: true };
  } catch (error) {
    console.error('Erro ao salvar histórico fiscal:', error);
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

    let q = query(taxHistoryRef, orderBy('period', 'desc'));

    // Filtrar por mercado se especificado
    if (options.market) {
      q = query(taxHistoryRef, where('market', '==', options.market), orderBy('period', 'desc'));
    }

    const snapshot = await getDocs(q);

    const history = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

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

    // Atualizar o período onde o prejuízo foi usado
    const fromPeriodId = `${fromPeriod}-${market}`;
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

      await setDoc(fromRef, {
        ...data,
        compensatedFrom,
        updatedAt: serverTimestamp()
      });
    }

    return { success: true };
  } catch (error) {
    console.error('Erro ao registrar compensação:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Calcular total de prejuízos não compensados
 */
export const getTotalUncompensatedLoss = async (userId, market) => {
  try {
    const { success, data } = await getUserTaxHistory(userId, { market });

    if (!success) return 0;

    // Somar prejuízos que ainda não foram totalmente compensados
    let totalLoss = 0;

    data.forEach(record => {
      if (record.accumulatedLoss < 0) {
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
