// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAjd-WTe5ZSm6b_eWRFWu0cxN03c5uLjsQ",
  authDomain: "okr-igs.firebaseapp.com",
  projectId: "okr-igs",
  storageBucket: "okr-igs.firebasestorage.app",
  messagingSenderId: "30326467698",
  appId: "1:30326467698:web:31e3e21121f7a7ee4166eb",
  measurementId: "G-3G4VS1FMYY"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
const db = getFirestore(app);

export { db };
