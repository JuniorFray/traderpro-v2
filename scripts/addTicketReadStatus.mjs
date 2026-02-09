import { initializeApp } from 'firebase/app'
import { getFirestore, collection, getDocs, doc, updateDoc } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyCxGOM7s7IX517BCumwbark7EprKHJaSqk",
  authDomain: "meudiariotrade-29864.firebaseapp.com",
  projectId: "meudiariotrade-29864",
  storageBucket: "meudiariotrade-29864.firebasestorage.app",
  messagingSenderId: "410930012289",
  appId: "1:410930012289:web:8d9c5da4022b22cd4e7d48"
}

const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

async function addReadStatusToTickets() {
  try {
    console.log('🔄 Atualizando tickets existentes...')
    
    const ticketsRef = collection(db, 'tickets')
    const snapshot = await getDocs(ticketsRef)
    
    let count = 0
    for (const ticketDoc of snapshot.docs) {
      const ticketData = ticketDoc.data()
      
      // Adiciona campos de leitura se não existirem
      await updateDoc(doc(db, 'tickets', ticketDoc.id), {
        unreadByUser: false, // User leu por último
        unreadByAdmin: ticketData.messages?.length > 0 ? true : false, // Admin precisa ler se tem mensagens
        lastMessageBy: ticketData.messages?.[ticketData.messages.length - 1]?.isAdmin ? 'admin' : 'user'
      })
      
      count++
      console.log(`✅ Ticket ${ticketDoc.id} atualizado`)
    }
    
    console.log(`\n✅ ${count} tickets atualizados com sucesso!`)
  } catch (error) {
    console.error('❌ Erro:', error)
  }
}

addReadStatusToTickets()
