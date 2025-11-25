// Configuration Firebase centralisée
// ⚠️ Ces clés sont PUBLIQUES (exposées côté client de toute façon)
// La sécurité vient des règles Firebase Realtime Database
import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'
import { getDatabase } from 'firebase/database'

const firebaseConfig = {
  apiKey: "AIzaSyBr6MXqUHOXUJx9NpgWE9K09mk_NOnPyqs",
  authDomain: "cookie1-b3592.firebaseapp.com",
  databaseURL: "https://cookie1-b3592-default-rtdb.firebaseio.com",
  projectId: "cookie1-b3592",
  storageBucket: "cookie1-b3592.firebasestorage.app",
  messagingSenderId: "989136449677",
  appId: "1:989136449677:web:f84c762f9c89a60a2732c4",
}

// Initialisation de l'application Firebase
const app = initializeApp(firebaseConfig)

// Services Firebase exportés pour utilisation dans toute l'app
export const auth = getAuth(app)
export const db = getDatabase(app) // Realtime Database (plus simple que Firestore)
export const googleProvider = new GoogleAuthProvider()
