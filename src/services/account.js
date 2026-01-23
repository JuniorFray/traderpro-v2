// src/services/account.js
import { db } from './firebase'
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  addDoc,
  query,
  orderBy,
  getDocs,
  deleteDoc,
  serverTimestamp
} from 'firebase/firestore'

/**
 * Obter dados da conta do usuário
 */
export const getUserAccount = async (userId) => {
  try {
    const accountRef = doc(db, 'artifacts/trade-journal-public/users', userId, 'account', 'settings')
    const accountSnap = await getDoc(accountRef)
    
    if (accountSnap.exists()) {
      return {
        success: true,
        data: accountSnap.data()
      }
    }
    
    return {
      success: true,
      data: null // Conta ainda não configurada
    }
  } catch (error) {
    console.error('Erro ao buscar conta:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

/**
 * Criar ou atualizar conta inicial
 */
export const setupAccount = async (userId, accountData) => {
  try {
    const accountRef = doc(db, 'artifacts/trade-journal-public/users', userId, 'account', 'settings')
    
    const data = {
      initialBalance: parseFloat(accountData.initialBalance) || 0,
      currency: accountData.currency || 'USD',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      hasImportedHistory: accountData.hasImportedHistory || false
    }
    
    await setDoc(accountRef, data)
    
    return {
      success: true,
      data
    }
  } catch (error) {
    console.error('Erro ao configurar conta:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

/**
 * Obter todas as transações do usuário
 */
export const getUserTransactions = async (userId) => {
  try {
    const transactionsRef = collection(db, 'artifacts/trade-journal-public/users', userId, 'transactions')
    const q = query(transactionsRef, orderBy('date', 'desc'))
    const snapshot = await getDocs(q)
    
    const transactions = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
    
    return {
      success: true,
      data: transactions
    }
  } catch (error) {
    console.error('Erro ao buscar transações:', error)
    return {
      success: false,
      error: error.message,
      data: []
    }
  }
}

/**
 * Adicionar nova transação (depósito ou saque)
 */
export const addTransaction = async (userId, transactionData) => {
  try {
    const transactionsRef = collection(db, 'artifacts/trade-journal-public/users', userId, 'transactions')
    
    const data = {
      type: transactionData.type, // 'deposit' ou 'withdrawal'
      amount: parseFloat(transactionData.amount) || 0,
      currency: transactionData.currency || 'USD',
      date: transactionData.date,
      description: transactionData.description || '',
      createdAt: serverTimestamp()
    }
    
    const docRef = await addDoc(transactionsRef, data)
    
    return {
      success: true,
      id: docRef.id,
      data
    }
  } catch (error) {
    console.error('Erro ao adicionar transação:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

/**
 * Deletar transação
 */
export const deleteTransaction = async (userId, transactionId) => {
  try {
    const transactionRef = doc(db, 'artifacts/trade-journal-public/users', userId, 'transactions', transactionId)
    await deleteDoc(transactionRef)
    
    return {
      success: true
    }
  } catch (error) {
    console.error('Erro ao deletar transação:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

/**
 * Calcular saldo atual
 * Fórmula: Saldo Inicial + Depósitos - Saques + P&L Total
 */
export const calculateCurrentBalance = (accountData, transactions, totalPnL) => {
  const initialBalance = parseFloat(accountData?.initialBalance) || 0
  
  const deposits = transactions
    .filter(t => t.type === 'deposit')
    .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0)
  
  const withdrawals = transactions
    .filter(t => t.type === 'withdrawal')
    .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0)
  
  const currentBalance = initialBalance + deposits - withdrawals + totalPnL
  
  return {
    initialBalance,
    deposits,
    withdrawals,
    totalPnL,
    currentBalance
  }
}
