import { createContext, useContext, useState, useEffect } from 'react'
import { 
  signInWithPopup, 
  signOut as firebaseSignOut,
  onAuthStateChanged 
} from 'firebase/auth'
import { auth, googleProvider, db } from '../../services/firebase'
import { doc, getDoc } from 'firebase/firestore'

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
      if (firebaseUser) {
        setUser(firebaseUser)
        
        // Buscar status PRO
        try {
          const userDoc = await getDoc(doc(db, 'artifacts/trade-journal-public/users', firebaseUser.uid))
          if (userDoc.exists()) {
            setIsPro(userDoc.data().isPro || false)
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
      await signInWithPopup(auth, googleProvider)
    } catch (error) {
      console.error('Erro no login:', error)
      throw error
    }
  }

  const signOut = async () => {
    try {
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
    signOut,
    loading
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
