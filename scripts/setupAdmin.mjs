import admin from 'firebase-admin'
import { readFileSync } from 'fs'

// Inicializar Firebase Admin
const serviceAccount = JSON.parse(readFileSync('./serviceAccountKey.json'))
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
})

const db = admin.firestore()

async function setupAdmin() {
  const adminEmail = 'juniorfray944@gmail.com'
  
  // Buscar usuário no Auth
  const userRecord = await admin.auth().getUserByEmail(adminEmail)
  console.log('Usuário encontrado:', userRecord.uid)
  
  // Adicionar na coleção adminUsers
  await db.doc('artifacts/trade-journal-public/adminUsers/' + userRecord.uid).set({
    email: adminEmail,
    displayName: userRecord.displayName || 'Admin',
    isPro: true,
    isAdmin: true,
    createdAt: new Date().toISOString()
  }, { merge: true })
  
  console.log('Admin configurado com sucesso!')
}

setupAdmin().catch(console.error)
