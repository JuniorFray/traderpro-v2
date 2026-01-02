import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot
} from "firebase/firestore"
import { db } from "./firebase"

// Coleções
export const COLLECTIONS = {
  USERS: "users",
  TRADES: "trades",
  SETTINGS: "settings"
}

// Buscar documento único
export const getDocument = async (collectionName, docId) => {
  try {
    const docRef = doc(db, collectionName, docId)
    const docSnap = await getDoc(docRef)
    
    if (docSnap.exists()) {
      return { success: true, data: { id: docSnap.id, ...docSnap.data() } }
    } else {
      return { success: false, error: "Documento não encontrado" }
    }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

// Buscar múltiplos documentos
export const getDocuments = async (collectionName, conditions = []) => {
  try {
    const collectionRef = collection(db, collectionName)
    let q = collectionRef
    
    if (conditions.length > 0) {
      q = query(collectionRef, ...conditions)
    }
    
    const querySnapshot = await getDocs(q)
    const documents = []
    
    querySnapshot.forEach((doc) => {
      documents.push({ id: doc.id, ...doc.data() })
    })
    
    return { success: true, data: documents }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

// Adicionar documento
export const addDocument = async (collectionName, data) => {
  try {
    const docRef = await addDoc(collection(db, collectionName), data)
    return { success: true, id: docRef.id }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

// Atualizar documento
export const updateDocument = async (collectionName, docId, data) => {
  try {
    const docRef = doc(db, collectionName, docId)
    await updateDoc(docRef, data)
    return { success: true }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

// Deletar documento
export const deleteDocument = async (collectionName, docId) => {
  try {
    await deleteDoc(doc(db, collectionName, docId))
    return { success: true }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

// Escutar mudanças em tempo real
export const subscribeToCollection = (collectionName, conditions = [], callback) => {
  const collectionRef = collection(db, collectionName)
  let q = collectionRef
  
  if (conditions.length > 0) {
    q = query(collectionRef, ...conditions)
  }
  
  return onSnapshot(q, (snapshot) => {
    const documents = []
    snapshot.forEach((doc) => {
      documents.push({ id: doc.id, ...doc.data() })
    })
    callback(documents)
  })
}

// Exportar helpers de query
export { where, orderBy }

