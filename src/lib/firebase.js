import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyD90Zfyd3qH09wBuB7gDuS9w1uL_Ffq4BU',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'sijurnal-cinta-guru.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'sijurnal-cinta-guru',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'sijurnal-cinta-guru.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '929343340497',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:929343340497:web:0a4337a1076414677aaaf0',
};

export const firebaseApp = initializeApp(firebaseConfig);
export const auth = getAuth(firebaseApp);
export const db = getFirestore(firebaseApp);
