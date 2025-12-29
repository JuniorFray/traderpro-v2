import admin from 'firebase-admin';
import { readFileSync } from 'fs';

// Inicializar Firebase Admin
const serviceAccount = JSON.parse(readFileSync('./serviceAccountKey.json'));
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const auth = admin.auth();
const db = admin.firestore();

async function importUsers() {
  console.log('🔍 Buscando todos os usuarios do Authentication...');
  
  let allUsers = [];
  let nextPageToken;
  
  do {
    const listUsersResult = await auth.listUsers(1000, nextPageToken);
    allUsers = allUsers.concat(listUsersResult.users);
    nextPageToken = listUsersResult.pageToken;
  } while (nextPageToken);
  
  console.log(`✅ Total de ${allUsers.length} usuarios encontrados`);
  
  // Adicionar no adminUsers
  for (const user of allUsers) {
    try {
      await db.doc(`artifacts/trade-journal-public/adminUsers/${user.uid}`).set({
        email: user.email,
        displayName: user.displayName || '',
        isPro: false,
        createdAt: user.metadata.creationTime,
        lastLogin: user.metadata.lastSignInTime,
        importedAt: new Date().toISOString()
      }, { merge: true });
      
      console.log(`✅ ${user.email} importado`);
    } catch (error) {
      console.error(`❌ Erro ao importar ${user.email}:`, error.message);
    }
  }
  
  console.log('🎉 Importacao concluida!');
}

importUsers().catch(console.error);
