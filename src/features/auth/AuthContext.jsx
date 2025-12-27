import { createContext, useContext, useState, useEffect } from "react"
import { auth } from "../../services/firebase"
import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup
} from "firebase/auth"
import { useNavigate } from "react-router-dom"

const AuthContext = createContext({})

export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user)
      setLoading(false)
    })

    return unsubscribe
  }, [])

  const login = async (email, password) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password)
      setUser(result.user)
      navigate("/")
      return { success: true }
    } catch (error) {
      console.error("Erro no login:", error)
      return { success: false, error: error.message }
    }
  }

  const loginWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider()
      const result = await signInWithPopup(auth, provider)
      setUser(result.user)
      navigate("/")
      return { success: true }
    } catch (error) {
      console.error("Erro no login com Google:", error)
      return { success: false, error: error.message }
    }
  }

  const register = async (email, password) => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password)
      setUser(result.user)
      navigate("/")
      return { success: true }
    } catch (error) {
      console.error("Erro no registro:", error)
      return { success: false, error: error.message }
    }
  }

  const logout = async () => {
    try {
      await signOut(auth)
      setUser(null)
      navigate("/login")
      return { success: true }
    } catch (error) {
      console.error("Erro ao sair:", error)
      return { success: false, error: error.message }
    }
  }

  const value = {
    user,
    login,
    loginWithGoogle,
    register,
    logout,
    isAuthenticated: !!user
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-white text-xl">Carregando...</div>
      </div>
    )
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
