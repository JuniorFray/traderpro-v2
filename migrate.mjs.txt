import { initializeApp } from "firebase/app"
import { getFirestore, collection, getDocs, setDoc, doc } from "firebase/firestore"

const oldFirebaseConfig = {
  apiKey: "AIzaSyDGZ-M79s9u67kEefEGipKjZxyQF5hhHlM",
  authDomain: "traderpro-7c2e4.firebaseapp.com",
  projectId: "traderpro-7c2e4",
  storageBucket: "traderpro-7c2e4.firebasestorage.app",
  messagingSenderId: "516007095183",
  appId: "1:516007095183:web:b36e5fde355fa0869cb5c0"
}

const newFirebaseConfig = {
  apiKey: "AIzaSyAPp7EZnCUjYV4hG-X0EbW5z2YnLtB8bko",
  authDomain: "traderpro-v2-31e1d.firebaseapp.com",
  projectId: "traderpro-v2-31e1d",
  storageBucket: "traderpro-v2-31e1d.firebasestorage.app",
  messagingSenderId: "74662748005",
  appId: "1:74662748005:web:b39f4c35f1c12a5ce57a6c"
}

console.log("🚀 Iniciando migração...")

const oldApp = initializeApp(oldFirebaseConfig, "old")
const newApp = initializeApp(newFirebaseConfig, "new")

const oldDb = getFirestore(oldApp)
const newDb = getFirestore(newApp)

async function migrateCollection(collectionName) {
  console.log(`📦 Migrando: ${collectionName}`)
  
  const snapshot = await getDocs(collection(oldDb, collectionName))
  const total = snapshot.size
  
  console.log(`📊 Total: ${total} documentos`)
  
  let migrated = 0
  
  for (const docSnap of snapshot.docs) {
    await setDoc(doc(newDb, collectionName, docSnap.id), docSnap.data())
    migrated++
    if (migrated % 10 === 0 || migrated === total) {
      console.log(`✓ ${migrated}/${total}`)
    }
  }
  
  console.log(`✅ ${collectionName}: ${migrated} migrados`)
}

async function migrate() {
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
