import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore'
import admin from 'firebase-admin'
import { readFileSync } from 'fs'

// Configuração do Firebase (mesmo do seu projeto)
const firebaseConfig = {
  apiKey: "AIzaSyDGw7RrL_Lu9pM0xOEkaHbgZJ1ai7ho8nQ",
  authDomain: "meudiariotrade-29864.firebaseapp.com",
  projectId: "meudiariotrade-29864",
  storageBucket: "meudiariotrade-29864.firebasestorage.app",
  messagingSenderId: "129569094359",
  appId: "1:129569094359:web:d02c5ec9c20a22a81c5d4b"
}

// Inicializar Admin SDK
const serviceAccount = JSON.parse(
  readFileSync('./serviceAccountKey.json', 'utf-8')
)

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
})

const adminAuth = admin.auth()
const db = getFirestore(initializeApp(firebaseConfig))

async function syncUsers() {
  console.log('🔄 Iniciando sincronização...\n')
  
  let syncedCount = 0
  let skippedCount = 0
  let errorCount = 0
  
  try {
    // Buscar TODOS os usuários do Authentication
    const listUsersResult = await adminAuth.listUsers(1000) // Max 1000 por vez
    
    console.log(`📊 Total de usuários no Authentication: ${listUsersResult.users.length}\n`)
    
    for (const user of listUsersResult.users) {
      try {
        const userId = user.uid
        const email = user.email || 'sem-email@unknown.com'
        
        // Verificar se já existe no Firestore
        const userDocRef = doc(db, 'artifacts/trade-journal-public/users', userId)
        const userDoc = await getDoc(userDocRef)
        
        if (userDoc.exists()) {
          console.log(`⏭️  Pulando ${email} (já existe)`)
          skippedCount++
          continue
        }
        
        // Criar documento no Firestore
        await setDoc(userDocRef, {
          email: email,
          displayName: user.displayName || null,
          isPro: false,
          eaEnabled: true,
          createdAt: user.metadata.creationTime,
          lastLogin: user.metadata.lastSignInTime,
          syncedAt: new Date().toISOString()
        })
        
        // Também criar em adminUsers para controle
        const adminDocRef = doc(db, 'artifacts/trade-journal-public/adminUsers', userId)
        await setDoc(adminDocRef, {
          email: email,
          displayName: user.displayName || null,
          isPro: false,
          isAdmin: false,
          importedAt: new Date().toISOString()
        })
        
        console.log(`✅ Sincronizado: ${email}`)
        syncedCount++
        
      } catch (error) {
        console.error(`❌ Erro ao sincronizar ${user.email}:`, error.message)
        errorCount++
      }
    }
    
    console.log('\n📊 RESUMO:')
    console.log(`✅ Sincronizados: ${syncedCount}`)
    console.log(`⏭️  Pulados (já existiam): ${skippedCount}`)
    console.log(`❌ Erros: ${errorCount}`)
    console.log(`📈 Total processado: ${listUsersResult.users.length}`)
    
  } catch (error) {
    console.error('❌ Erro fatal:', error)
  }
}

syncUsers()
