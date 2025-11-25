// Configuration Firebase centralisée
// ⚠️ Ces clés sont PUBLIQUES (exposées côté client de toute façon)
// La sécurité vient des règles Firebase Realtime Database
import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'
import { getDatabase } from 'firebase/database'

const firebaseConfig = {
  apiKey: "AIzaSyAoXkM4EAk7AcbXONYQiTDNVz-ekvQRmag",
  authDomain: "cookie1-b3592.firebaseapp.com",
  databaseURL: "https://cookie1-b3592-default-rtdb.firebaseio.com",
  projectId: "cookie1-b3592",
  storageBucket: "cookie1-b3592.firebasestorage.app",
  messagingSenderId: "574703740832",
  appId: "1:574703740832:web:6203ea9a1807a2c251e6c5",
  measurementId: "G-YBDCE9BGC8"
}

// Initialisation de l'application Firebase
const app = initializeApp(firebaseConfig)

// Services Firebase exportés pour utilisation dans toute l'app
export const auth = getAuth(app)
export const db = getDatabase(app) // Realtime Database (plus simple que Firestore)
export const googleProvider = new GoogleAuthProvider()
