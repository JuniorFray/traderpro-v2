import admin from 'firebase-admin'
import { readFileSync } from 'fs'

const oldServiceAccount = JSON.parse(readFileSync('./firebase-old-key.json', 'utf8'))
const newServiceAccount = JSON.parse(readFileSync('./firebase-new-key.json', 'utf8'))

const oldApp = admin.initializeApp({
  credential: admin.credential.cert(oldServiceAccount)
}, 'old')

const newApp = admin.initializeApp({
  credential: admin.credential.cert(newServiceAccount)
}, 'new')

const oldDb = oldApp.firestore()
const newDb = newApp.firestore()

async function migrateCollection(collectionName) {
  console.log(`📦 Migrando: ${collectionName}`)
  
  const snapshot = await oldDb.collection(collectionName).get()
  const total = snapshot.size
  
  console.log(`📊 Total: ${total} documentos`)
  
  if (total === 0) {
    console.log(`⚠️ Collection vazia`)
    return
  }

  let migrated = 0
  const batch = newDb.batch()
  
  for (const doc of snapshot.docs) {
    const docRef = newDb.collection(collectionName).doc(doc.id)
    batch.set(docRef, doc.data())
    migrated++
    
    if (migrated % 500 === 0) {
      await batch.commit()
      console.log(`✓ ${migrated}/${total}`)
    }
  }
  
  await batch.commit()
  console.log(`✅ ${collectionName}: ${migrated} migrados`)
}

async function migrate() {
  console.log("🚀 Iniciando migração...")
  
  try {
    await migrateCollection("trades")
    await migrateCollection("users")
    
    console.log("🎉 MIGRAÇÃO CONCLUÍDA!")
    process.exit(0)
    
  } catch (error) {
    console.error("❌ ERRO:", error)
    process.exit(1)
  }
}

migrate()
