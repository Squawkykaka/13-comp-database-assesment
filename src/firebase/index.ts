import { initializeApp } from "firebase/app";
import { connectFirestoreEmulator, getFirestore } from "firebase/firestore";
import {
  browserLocalPersistence,
  connectAuthEmulator,
  getAuth,
  setPersistence,
} from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBjjSwm8ARN8jb-Z23XXMEymlCgLzv7qOI",
  authDomain: "comp-database-assesment.firebaseapp.com",
  projectId: "comp-database-assesment",
  storageBucket: "comp-database-assesment.firebasestorage.app",
  messagingSenderId: "744210310754",
  appId: "1:744210310754:web:b149d717995dc26375533b",
};

const app = initializeApp(firebaseConfig);
const DB = getFirestore(app);
const AUTH = getAuth(app);

if (import.meta.env.DEV) {
  connectFirestoreEmulator(DB, "localhost", 8081);
  connectAuthEmulator(AUTH, "http://localhost:9099");
}

await setPersistence(AUTH, browserLocalPersistence);

export { AUTH, DB };
