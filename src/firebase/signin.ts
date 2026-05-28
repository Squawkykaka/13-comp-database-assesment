import { GoogleAuthProvider, onAuthStateChanged, signInWithPopup } from "firebase/auth";
import { AUTH } from ".";
import { userProfile } from "./user";
import {
  getDoc,
  onSnapshot,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { writable } from "svelte/store";
import { type FirebaseUser } from "../models/user";

export const currentUser = writable<FirebaseUser | null>(null);

export async function signInGoogle() {
  const userCred = await signInWithPopup(AUTH, new GoogleAuthProvider());
  let off = onSnapshot(userProfile(userCred.user.uid), (snapshot) => {
    currentUser.set(snapshot.data() ?? null);
  });
  onAuthStateChanged(AUTH, user => {
    if (user === null) {
        off()
    }
  })

  let doc = await getDoc(userProfile(userCred.user.uid));
  let data = doc.data();
  if (data !== undefined) {
    currentUser.set(data);
  } else {
    console.log("MAKING DUMMY USER");
    await setDoc(userProfile(userCred.user.uid), {
      displayName: userCred.user.displayName ?? "TEST",
      joinDate: serverTimestamp(),
      losses: 0,
      wins: 0,
      userUID: userCred.user.uid,
      photoURL: undefined,
    });
  }
}

export async function saveUser(user: FirebaseUser) {
  await updateDoc(userProfile(user.userUID), {
    displayName: user.displayName,
    losses: user.losses,
    wins: user.wins,
    photoURL: user.photoURL ?? null,
  });
}
