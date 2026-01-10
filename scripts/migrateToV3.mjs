// scripts/migrateToV3.mjs
// Script de Migração de Trades v2.0 para v3.0

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, updateDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const migrateUserTrades = async (userId) => {
  try {
    console.log(`\nMigrando trades do usuário: ${userId}`);
    
    const tradesRef = collection(db, 'artifacts/trade-journal-public/users', userId, 'trades');
    const snapshot = await getDocs(tradesRef);
    
    let migratedCount = 0;
    
    for (const tradeDoc of snapshot.docs) {
      const trade = tradeDoc.data();
      
      // Verificar se já foi migrado
      if (trade.market) {
        console.log(`Trade ${tradeDoc.id} já migrado. Pulando...`);
        continue;
      }
      
      // Adicionar novos campos com valores padrão
      const updates = {
        market: 'forex', // Default para trades antigos
        currency: 'USD',
        quantity: 0,
        entryPrice: 0,
        exitPrice: 0,
        entryTime: '',
        exitTime: '',
        taxes: {
          rate: 0.15,
          amount: 0,
          category: 'forex',
          dueDate: null,
          isPaid: false,
          exempt: trade.pnl <= 0,
          currency: 'USD'
        }
      };
      
      await updateDoc(doc(db, 'artifacts/trade-journal-public/users', userId, 'trades', tradeDoc.id), updates);
      migratedCount++;
      console.log(`✅ Trade ${tradeDoc.id} migrado`);
    }
    
    console.log(`\nTotal migrado: ${migratedCount} trades`);
    return migratedCount;
    
  } catch (error) {
    console.error('Erro na migração:', error);
    throw error;
  }
};

// Função principal
const migrate = async () => {
  console.log('=== MIGRAÇÃO TRADERPRO v2.0 → v3.0 ===\n');
  console.log('⚠️  ATENÇÃO: Este script vai atualizar todos os trades existentes');
  console.log('⚠️  Certifique-se de ter backup antes de continuar\n');
  
  // Aqui você deve colocar os IDs dos usuários para migrar
  // Ou buscar todos os usuários da coleção adminUsers
  const userIds = [
    // 'ID_DO_USUARIO_1',
    // 'ID_DO_USUARIO_2',
  ];
  
  if (userIds.length === 0) {
    console.log('❌ Nenhum usuário configurado para migração');
    console.log('💡 Edite o arquivo e adicione os IDs dos usuários');
    return;
  }
  
  for (const userId of userIds) {
    await migrateUserTrades(userId);
  }
  
  console.log('\n✅ MIGRAÇÃO CONCLUÍDA!');
};

migrate().catch(console.error);
