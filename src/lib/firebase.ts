import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyC1_yYEM3A8FjMRfTQdsseOzcsvH0uMANw",
  authDomain: "ghania-12207.firebaseapp.com",
  projectId: "ghania-12207",
  storageBucket: "ghania-12207.firebasestorage.app",
  messagingSenderId: "968403392381",
  appId: "1:968403392381:web:932fc06706138ddc115e14",
  measurementId: "G-MECZEF3S4V"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
