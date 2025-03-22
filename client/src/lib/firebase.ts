import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyBqPEvN7CwKsPcjbNgqsMIf64yrEvuTrKg",
  authDomain: "votaxmi-68325.firebaseapp.com",
  databaseURL: "https://votaxmi-68325-default-rtdb.firebaseio.com",
  projectId: "votaxmi-68325",
  storageBucket: "votaxmi-68325.appspot.com",
  messagingSenderId: "603294554345",
  appId: "1:603294554345:web:db6164c1d813cc45a0b878",
  measurementId: "G-M6TNQMT73E"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getDatabase(app);

export const initializeFirebase = () => {
  console.log("Firebase initialized successfully with Realtime Database");
  return { app, auth, db };
};
