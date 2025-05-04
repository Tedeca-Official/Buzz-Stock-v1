
import { initializeApp } from "firebase/app";
import { 
  getFirestore, 
  collection, 
  doc, 
  getDocs, 
  getDoc,
  setDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where 
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDCN6WEPpyZeVSPzRyhxPx70dU7y9GMV6o",
  authDomain: "stock-savvy-d79d5.firebaseapp.com",
  projectId: "stock-savvy-d79d5",
  storageBucket: "stock-savvy-d79d5.firebasestorage.app",
  messagingSenderId: "1056555891918",
  appId: "1:1056555891918:web:cb8a49decd94e61fd3e49f",
  measurementId: "G-C5NJY3TEPJ"
};

// Initialize Firebase only once
let app;
try {
  app = initializeApp(firebaseConfig);
} catch (error) {
  // Handle the duplicate app error - likely already initialized
  if (error.code === 'app/duplicate-app') {
    app = initializeApp(firebaseConfig, 'secondary');
  } else {
    throw error;
  }
}

// Initialize services
const db = getFirestore(app);
const auth = getAuth(app);
const analytics = getAnalytics(app);

// Collection references
export const productsCollection = collection(db, "products");
export const productHistoryCollection = collection(db, "productHistory");
export const usersCollection = collection(db, "users");

export { 
  app,
  auth,
  db, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  collection,
  analytics
};
