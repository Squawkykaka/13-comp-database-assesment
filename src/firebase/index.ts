import { initializeApp } from "firebase/app";
import {
  collection,
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
import type { CollectionReference, DocumentData, QueryDocumentSnapshot, SnapshotOptions } from "firebase/firestore";
import type { User } from "firebase/auth";
import { connectDatabaseEmulator, getDatabase } from "firebase/database";

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
const RDB = getDatabase(app);
const AUTH = getAuth(app);

if (import.meta.env.DEV) {
  connectFirestoreEmulator(DB, "localhost", 8081);
  connectAuthEmulator(AUTH, "http://localhost:9099");
  connectDatabaseEmulator(RDB, "localhost", 9000);
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
// User collection converter
// #####################
export const userConverter = {
  fromFirestore(
    snapshot: QueryDocumentSnapshot,
    options: SnapshotOptions,
  ): GameUser {
    const data = snapshot.data(options)!;

    return {
      displayName: data.displayName,
      joinDate: data.joinDate,
      quote: data.quote,
      photoURL: data.photoUrl === null ? undefined : data.photoURL,
      uid: snapshot.id,
      dbRef: doc(userCollection, snapshot.id),
    };
  },
  toFirestore(user: GameUser) {
    return {
      displayName: user.displayName,
      joinDate: user.joinDate,
      photoURL: user.photoURL ?? null,
      quote: user.quote,
    };
  },
};
export const userCollection = collection(DB, "users").withConverter(
  userConverter,
);

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

export { AUTH, DB, RDB };
