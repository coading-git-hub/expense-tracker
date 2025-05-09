import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from 'firebase/firestore';
import { getStorage } from "firebase/storage";



const firebaseConfig = {
  apiKey: "AIzaSyBZhgfalyxEWIv6pCKegGmp3isghitiPAk",
  authDomain: "expense-tracker-725f8.firebaseapp.com",
  projectId: "expense-tracker-725f8",
  storageBucket: "expense-tracker-725f8.appspot.com",
  messagingSenderId: "421382916713",
  appId: "1:421382916713:web:ae0dd1ca51c8228b65f0f8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
export const db = getFirestore(app);
export const storage = getStorage(app);
// Configure Google Auth Provider
provider.setCustomParameters({
  prompt: 'select_account'
});