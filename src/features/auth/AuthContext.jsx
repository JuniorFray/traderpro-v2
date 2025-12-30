import { createContext, useContext, useState, useEffect } from 'react'
import { 
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged 
} from 'firebase/auth'
import { auth, googleProvider, db } from '../../services/firebase'
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
      // Se está no contexto admin, não atualiza o contexto do sistema
      if (localStorage.getItem('adminContext') === 'true') {
        setLoading(false)
        return
      }

      if (firebaseUser) {
        setUser(firebaseUser)
        
        // Buscar status PRO
        try {
          const userDoc = await getDoc(doc(db, 'artifacts/trade-journal-public/users', firebaseUser.uid))
          if (userDoc.exists()) {
            setIsPro(userDoc.data().isPro || false)
          } else {
            // Criar documento do usuário se não existir
            await setDoc(doc(db, 'artifacts/trade-journal-public/users', firebaseUser.uid), {
              email: firebaseUser.email,
              isPro: false,
              createdAt: new Date().toISOString()
            })
            setIsPro(false)
          }
        } catch (error) {
          console.error('Erro ao buscar status PRO:', error)
          setIsPro(false)
        }
      } else {
        setUser(null)
        setIsPro(false)
      }
      setLoading(false)
    })

    return unsubscribe
  }, [])

  const signInWithGoogle = async () => {
    try {
      // Remover contexto admin se existir
      localStorage.removeItem('adminContext')
      await signInWithPopup(auth, googleProvider)
    } catch (error) {
      console.error('Erro no login:', error)
      throw error
    }
  }

  const signInWithEmail = async (email, password) => {
    try {
      // Remover contexto admin se existir
      localStorage.removeItem('adminContext')
      await signInWithEmailAndPassword(auth, email, password)
    } catch (error) {
      console.error('Erro no login com email:', error)
      throw error
    }
  }

  const signUpWithEmail = async (email, password) => {
    try {
      // Remover contexto admin se existir
      localStorage.removeItem('adminContext')
      
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      
      // Criar documento do usuário
      await setDoc(doc(db, 'artifacts/trade-journal-public/users', userCredential.user.uid), {
        email: email,
        isPro: false,
        createdAt: new Date().toISOString()
      })
      
      return userCredential
    } catch (error) {
      console.error('Erro no cadastro:', error)
      throw error
    }
  }

  const signOut = async () => {
    try {
      // Remover contexto admin se existir
      localStorage.removeItem('adminContext')
      
      await firebaseSignOut(auth)
      setUser(null)
      setIsPro(false)
    } catch (error) {
      console.error('Erro no logout:', error)
      throw error
    }
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
