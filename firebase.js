import { initializeApp } from "firebase/app";
import {
  getAuth,
  setPersistence,
  browserLocalPersistence,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBjtb5GRTzKxSanzqo5voZhohdlA7-VzIg",
  authDomain: "diet-planner-5fa4b.firebaseapp.com",
  projectId: "diet-planner-5fa4b",
  storageBucket: "diet-planner-5fa4b.firebasestorage.app",
  messagingSenderId: "1087384637924",
  appId: "1:1087384637924:web:12f2a3847fa81d673937f1",
  measurementId: "G-QSHWGS2DNZ"
};


const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

setPersistence(auth, browserLocalPersistence).catch((error) => {
  console.error("Authentication persistence error:", error);
});

export const db = getFirestore(app);

export default app;