import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBqPEvN7CwKsPcjbNgqsMIf64yrEvuTrKg",
  authDomain: "votaxmi-68325.firebaseapp.com",
  projectId: "votaxmi-68325",
  storageBucket: "votaxmi-68325.firebasestorage.app",
  messagingSenderId: "603294554345",
  appId: "1:603294554345:web:db6164c1d813cc45a0b878",
  measurementId: "G-M6TNQMT73E"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);

export const initializeFirebase = () => {
  console.log("Firebase initialized successfully");
  return { app, auth, db };
};
