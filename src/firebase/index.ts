import { initializeApp } from "firebase/app";
import {
  browserLocalPersistence,
  connectAuthEmulator,
  getAuth,
  GoogleAuthProvider,
  onAuthStateChanged,
  setPersistence,
  signInWithPopup,
  type User,
} from "firebase/auth";
import { derived, writable } from "svelte/store";
import {
  child,
  connectDatabaseEmulator,
  get,
  getDatabase,
  onValue,
  ref,
  set,
} from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyBjjSwm8ARN8jb-Z23XXMEymlCgLzv7qOI",
  authDomain: "comp-database-assesment.firebaseapp.com",
  databaseURL:
    "https://comp-database-assesment-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "comp-database-assesment",
  storageBucket: "comp-database-assesment.firebasestorage.app",
  messagingSenderId: "744210310754",
  appId: "1:744210310754:web:b149d717995dc26375533b",
};

const app = initializeApp(firebaseConfig);
const RDB = getDatabase(app);
const AUTH = getAuth(app);

if (import.meta.env.DEV) {
  connectAuthEmulator(AUTH, "http://localhost:9099");
  connectDatabaseEmulator(RDB, "localhost", 9000);
}

await setPersistence(AUTH, browserLocalPersistence);

export async function signInGoogle() {
  const userCred = await signInWithPopup(AUTH, new GoogleAuthProvider());
  let q = ref(RDB, `users/${userCred.user.uid}`);

  let snapshot = await get(q);
  if (!snapshot.exists()) {
    console.log("MAKING USER");
    await set(q, {
      displayName: userCred.user.displayName,
      joinDate: Date.now(),
      quote: "",
      photoURL: userCred.user.photoURL,
    });
  }
}

// #####################
// Firebase Svelte Stores
// These keep local variables in sync with firestore
// #####################

export let currentFirebaseUser = writable<User | undefined>();
onAuthStateChanged(AUTH, (user) => {
  if (user === null) {
    currentFirebaseUser.set(undefined);
  } else {
    currentFirebaseUser.set(user);
  }
});

export { AUTH, RDB };
