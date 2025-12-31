import { createContext, useContext, useState, useEffect } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { auth, db } from '../../services/firebase'
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
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    console.log('?? AuthProvider montado - Admin App')
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log('?? onAuthStateChanged disparado:', firebaseUser?.email)
      
      if (firebaseUser) {
        // Verificar se é admin
        try {
          const adminDoc = await getDoc(doc(db, 'artifacts/trade-journal-public/adminUsers', firebaseUser.uid))
          if (adminDoc.exists()) {
            console.log('? Admin autenticado:', firebaseUser.email)
            setUser(firebaseUser)
          } else {
            console.log('? Não é admin')
            setUser(null)
          }
        } catch (error) {
          console.error('Erro ao verificar admin:', error)
          setUser(null)
        }
      } else {
        console.log('? Nenhum usuário logado')
        setUser(null)
      }
      
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const isAuthenticated = !!user

  const value = {
    user,
    loading,
    isAuthenticated
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
