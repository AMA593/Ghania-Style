import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBGoyFq9ce9oUiJoRIqN29hulJsDpsvuzs",
  authDomain: "ghania-cbb3f.firebaseapp.com",
  projectId: "ghania-cbb3f",
  storageBucket: "ghania-cbb3f.firebasestorage.app",
  messagingSenderId: "404081356862",
  appId: "1:404081356862:web:28d67ab168dd09dbc8e16f",
  measurementId: "G-HS8MJ3S7FG"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
