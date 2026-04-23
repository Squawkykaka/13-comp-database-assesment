import { initializeApp } from "firebase/app";
import {
  AuthErrorCodes,
  browserSessionPersistence,
  createUserWithEmailAndPassword,
  getAuth,
  type User,
} from "firebase/auth";
import {
  doc,
  getFirestore,
  setDoc,
  Timestamp,
} from "firebase/firestore";

export type UserSignup = {
  username: string;
  password: string;
  email: string;
};

const firebaseConfig = {
  apiKey: "AIzaSyBjjSwm8ARN8jb-Z23XXMEymlCgLzv7qOI",
  authDomain: "comp-database-assesment.firebaseapp.com",
  projectId: "comp-database-assesment",
  storageBucket: "comp-database-assesment.firebasestorage.app",
  messagingSenderId: "744210310754",
  appId: "1:744210310754:web:b149d717995dc26375533b",
};

const APP = initializeApp(firebaseConfig);
const DB = getFirestore(APP);
const AUTH = getAuth(APP);
AUTH.setPersistence(browserSessionPersistence);

let currentUser: User | null = null;
AUTH.onAuthStateChanged((user) => {
  currentUser = user;
  console.log(user);
});

export function getUser() {
  return currentUser;
}

export async function createUser(info: UserSignup) {
  try {
    const user = await createUserWithEmailAndPassword(AUTH, info.email, info.password);

    // FIXME: possible bug, where if this fails the account is then in a broken state
    await setDoc(doc(DB, "users", user.user.uid), {
      username: info.username,
      signupDate: Timestamp.now(),
    });

    return user.user;
  } catch (error: any) {
    console.error("AUTH ERROR\n", error.code)
    let errorText;

    switch (error.code) {
      case AuthErrorCodes.CREDENTIAL_ALREADY_IN_USE:
        errorText = "Credential already in use.";
        break;
      default:
        errorText = "Internal error.";
        break;
    }

    throw new Error(errorText);
  }
}
