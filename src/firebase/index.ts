import { initializeApp } from "firebase/app";
import {
  CollectionReference,
  connectFirestoreEmulator,
  getFirestore,
  onSnapshot,
  query,
  type DocumentData,
} from "firebase/firestore";
import {
  browserLocalPersistence,
  connectAuthEmulator,
  getAuth,
  setPersistence,
} from "firebase/auth";
import { readable, writable } from "svelte/store";

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

export function createFirestoreCollectionStore<T, U extends DocumentData>(
  reference: CollectionReference<T, U>,
) {
  return readable<T[]>([], (set) => {
    const q = query(reference);

    const unsubscribe = onSnapshot(q, (snapshot) => {
      set(snapshot.docs.map((doc) => doc.data()));
    });

    return unsubscribe;
  });
}

export { AUTH, DB };
