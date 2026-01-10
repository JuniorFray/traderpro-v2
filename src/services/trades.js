// src/services/trades.js
// Serviço de Trades - TraderPro v3.0

import { collection, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';
import { calculateTax } from '../utils/taxes/taxCalculator';
import { DEFAULT_MARKET, DEFAULT_CURRENCY } from '../constants/markets';

export const createTrade = async (userId, tradeData) => {
  try {
    const tradesRef = collection(db, 'artifacts/trade-journal-public/users', userId, 'trades');
    
    // Adicionar campos v3.0
    const market = tradeData.market || DEFAULT_MARKET;
    const currency = tradeData.currency || DEFAULT_CURRENCY;
    
    // Calcular imposto automaticamente
    const taxInfo = calculateTax({
      market,
      pnl: parseFloat(tradeData.pnl || 0),
      currency,
      date: tradeData.date
    });
    
    const trade = {
      // Campos existentes v2.0
      asset: tradeData.asset,
      date: tradeData.date,
      pnl: parseFloat(tradeData.pnl || 0),
      commission: parseFloat(tradeData.commission || 0),
      swap: parseFloat(tradeData.swap || 0),
      strategy: tradeData.strategy || '',
      notes: tradeData.notes || '',
      
      // NOVOS CAMPOS v3.0
      market,
      currency,
      quantity: parseFloat(tradeData.quantity || 0),
      entryPrice: parseFloat(tradeData.entryPrice || 0),
      exitPrice: parseFloat(tradeData.exitPrice || 0),
      entryTime: tradeData.entryTime || '',
      exitTime: tradeData.exitTime || '',
      
      // Impostos calculados automaticamente
      taxes: taxInfo,
      
      // Metadata
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    const docRef = await addDoc(tradesRef, trade);
    return { id: docRef.id, ...trade };
  } catch (error) {
    console.error('Erro ao criar trade:', error);
    throw error;
  }
};

export const updateTrade = async (userId, tradeId, tradeData) => {
  try {
    const tradeRef = doc(db, 'artifacts/trade-journal-public/users', userId, 'trades', tradeId);
    
    // Recalcular imposto se PnL ou mercado mudaram
    const market = tradeData.market || DEFAULT_MARKET;
    const currency = tradeData.currency || DEFAULT_CURRENCY;
    
    const taxInfo = calculateTax({
      market,
      pnl: parseFloat(tradeData.pnl || 0),
      currency,
      date: tradeData.date
    });
    
    const updates = {
      asset: tradeData.asset,
      date: tradeData.date,
      pnl: parseFloat(tradeData.pnl || 0),
      commission: parseFloat(tradeData.commission || 0),
      swap: parseFloat(tradeData.swap || 0),
      strategy: tradeData.strategy || '',
      notes: tradeData.notes || '',
      market,
      currency,
      quantity: parseFloat(tradeData.quantity || 0),
      entryPrice: parseFloat(tradeData.entryPrice || 0),
      exitPrice: parseFloat(tradeData.exitPrice || 0),
      entryTime: tradeData.entryTime || '',
      exitTime: tradeData.exitTime || '',
      taxes: taxInfo,
      updatedAt: serverTimestamp()
    };
    
    await updateDoc(tradeRef, updates);
    return { id: tradeId, ...updates };
  } catch (error) {
    console.error('Erro ao atualizar trade:', error);
    throw error;
  }
};

export const deleteTrade = async (userId, tradeId) => {
  try {
    const tradeRef = doc(db, 'artifacts/trade-journal-public/users', userId, 'trades', tradeId);
    await deleteDoc(tradeRef);
  } catch (error) {
    console.error('Erro ao deletar trade:', error);
    throw error;
  }
};
