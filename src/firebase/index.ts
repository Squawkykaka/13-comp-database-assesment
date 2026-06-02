import { initializeApp } from "firebase/app";
import {
  connectFirestoreEmulator,
  doc,
  getFirestore,
  onSnapshot,
  query,
  updateDoc,
} from "firebase/firestore";
import {
  browserLocalPersistence,
  connectAuthEmulator,
  getAuth,
  onAuthStateChanged,
  setPersistence,
} from "firebase/auth";
import { derived, readable, writable } from "svelte/store";
import type { GameUser } from "../models/user";
import { userCollection } from "./user";
import type { CollectionReference, DocumentData } from "firebase/firestore";
import type { User } from "firebase/auth";

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
// const RDB = getDatabase(app);
const AUTH = getAuth(app);

if (import.meta.env.DEV) {
  connectFirestoreEmulator(DB, "localhost", 8081);
  connectAuthEmulator(AUTH, "http://localhost:9099");
  // connectDatabaseEmulator(RDB, "localhost", 9000);
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

// #####################
// Firebase Svelte Stores
// These keep local variables in sync with firestore
// #####################

let currentFirebaseUser = writable<User | undefined>();
onAuthStateChanged(AUTH, (user) => {
  if (user === null) {
    currentFirebaseUser.set(undefined);
  } else {
    currentFirebaseUser.set(user);
  }
});

let currentUserWritable = writable<GameUser | undefined>();
currentFirebaseUser.subscribe((user) => {
  if (user) {
    return onSnapshot(doc(userCollection, user.uid), (next) => {
      currentUserWritable.set(next.data());
    });
  }
});
export const currentUser = derived(
  [currentFirebaseUser, currentUserWritable],
  ([currentFirebaseUser, currentUserWritable]) => {
    return {
      auth: currentFirebaseUser,
      info: currentUserWritable,
      async updateDisplay(displayName: string) {
        updateDoc(doc(userCollection, currentUserWritable?.uid), {
          displayName,
        });
      },
    };
  },
);

export { AUTH, DB };
