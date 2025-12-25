import { 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut,
  onAuthStateChanged 
} from "firebase/auth"
import { auth } from "./firebase"

export const signIn = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password)
    return { success: true, user: userCredential.user }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

export const signOut = async () => {
  try {
    await firebaseSignOut(auth)
    return { success: true }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

export const onAuthChange = (callback) => {
  return onAuthStateChanged(auth, callback)
}
