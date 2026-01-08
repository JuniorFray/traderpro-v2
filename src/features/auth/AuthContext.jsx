import { createContext, useContext, useState, useEffect } from 'react'
import { 
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  GoogleAuthProvider
} from 'firebase/auth'
import { auth, db } from '../../services/firebase'
import { doc, getDoc, setDoc } from 'firebase/firestore'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [isPro, setIsPro] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      const hostname = window.location.hostname
      // Verifica se estamos na rota ou subdomínio de admin
      const isAdminContext = hostname.includes('admin.') || window.location.pathname.startsWith('/admin')

      if (firebaseUser) {
        // --- CENÁRIO: Usuário Logado ---
        
        // Se estivermos no contexto ADMIN
        if (isAdminContext) {
          if (firebaseUser.email === 'juniorfray944@gmail.com') {
            // É o admin certo, libera acesso
            setUser(firebaseUser)
            setIsPro(true)
          } else {
            // É um usuário comum visitando a URL de admin.
            // Apenas bloqueia visualmente, sem deslogar do Firebase.
            setUser(null) 
          }
        } 
        // Se estivermos no contexto NORMAL (Usuário)
        else {
          setUser(firebaseUser)

          try {
            const userRef = doc(db, 'artifacts/trade-journal-public/users', firebaseUser.uid)
            const userDoc = await getDoc(userRef)

            if (!userDoc.exists()) {
              // ✅ ATUALIZADO: Usuário novo - criar documento COM lastAccessAt
              const newUserData = {
                email: firebaseUser.email || null,
                isPro: false,
                createdAt: new Date().toISOString(),
                lastAccessAt: new Date().toISOString(), // ← NOVO: primeiro acesso
                displayName: firebaseUser.displayName || null,
                photoURL: firebaseUser.photoURL || null
              }

              await setDoc(userRef, newUserData, { merge: true })
              setIsPro(false)
            } else {
              // ✅ ATUALIZADO: Usuário existente - atualizar último acesso
              const data = userDoc.data()
              setIsPro(data.isPro || false)
              
              // Atualizar timestamp de último acesso
              await setDoc(userRef, {
                lastAccessAt: new Date().toISOString()
              }, { merge: true })
            }
          } catch (error) {
            console.error("Erro ao buscar/criar perfil:", error)
            setIsPro(false)
          }
        }

      } else {
        // Ninguém logado
        setUser(null)
        setIsPro(false)
      }
      
      setLoading(false)
    })

    return unsubscribe
  }, [])

  // ✅ CORREÇÃO: Aceita parâmetro para forçar seleção de conta
  const signInWithGoogle = async (options = {}) => {
    const provider = new GoogleAuthProvider()
    
    // Se forceSelectAccount for true, força mostrar seleção de contas
    if (options.forceSelectAccount) {
      provider.setCustomParameters({
        prompt: 'select_account'
      })
    }
    
    return signInWithPopup(auth, provider)
  }

  const signInWithEmail = (email, password) => signInWithEmailAndPassword(auth, email, password)
  
  const signUpWithEmail = async (email, password) => {
    const credential = await createUserWithEmailAndPassword(auth, email, password)
    // ✅ ATUALIZADO: Criar doc inicial COM lastAccessAt
    await setDoc(doc(db, 'artifacts/trade-journal-public/users', credential.user.uid), {
      email, 
      isPro: false, 
      createdAt: new Date().toISOString(),
      lastAccessAt: new Date().toISOString() // ← NOVO
    })
    return credential
  }
  
  const signOut = async () => {
    await firebaseSignOut(auth)
    setUser(null)
  }

  const value = {
    user,
    isPro,
    isAuthenticated: !!user,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    signOut,
    loading
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
