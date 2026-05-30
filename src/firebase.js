import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCy5ZRHULdbC2POBfCkBWhaC7xMj72iMdE",
  authDomain: "el-kiosco-costeno.firebaseapp.com",
  projectId: "el-kiosco-costeno",
  storageBucket: "el-kiosco-costeno.firebasestorage.app",
  messagingSenderId: "64061159255",
  appId: "1:64061159255:web:873f2ca455fab917c17012",
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
