import { initializeApp } from "firebase/app";
import { connectFirestoreEmulator, getFirestore } from "firebase/firestore";
import {
  browserLocalPersistence,
  connectAuthEmulator,
  getAuth,
  GoogleAuthProvider,
  setPersistence,
  signInWithPopup,
  type User,
} from "firebase/auth";
import { EVENT_BUS } from "../models/eventBus";

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
setPersistence(AUTH, browserLocalPersistence);

if (import.meta.env.DEV) {
  connectFirestoreEmulator(DB, "127.0.0.1", 9099);
  connectAuthEmulator(AUTH, "http://localhost:9099");
}

declare global {
  interface EventMap {
    "auth.signin": { user: User };
  }
}

let currentUser: User | null = null;
async function signInGoogle() {
  const userCred = await signInWithPopup(AUTH, new GoogleAuthProvider());
  currentUser = userCred.user;
  EVENT_BUS.publish("auth.signin", { user: currentUser });
}
export { AUTH, DB, signInGoogle };
