import {
  GoogleAuthProvider,
  signInWithPopup,
  type Unsubscribe,
} from "firebase/auth";
import { AUTH } from ".";
import {
  doc,
  getDoc,
  onSnapshot,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { derived, writable } from "svelte/store";
import { type FirebaseUser } from "../models/user";
import { firebaseAuthUser } from "../models/stores";
import { userCollection } from "./user";

export const currentUser = writable<FirebaseUser | null>(null);
let off: null | Unsubscribe = null;
// if the current user changes, remove the snapshot listener listening for changes to the profile, 
// and then if the user is signed in add a new one
firebaseAuthUser.subscribe((firebaseAuthUser) => {
  if (off !== null) off();
  if (firebaseAuthUser === null) {
    off = null;
    return;
  }
  // otherwise add the listener
  off = onSnapshot(doc(userCollection, firebaseAuthUser.uid), (snapshot) => {
    currentUser.set(snapshot.data() ?? null);
  });
});

export async function signInGoogle() {
  const userCred = await signInWithPopup(AUTH, new GoogleAuthProvider());
  let ref = doc(userCollection, userCred.user.uid);

  let document = await getDoc(ref);
  let data = document.data();
  if (data === undefined) {
    console.log("MAKING DUMMY USER");
    await setDoc(ref, {
      displayName: userCred.user.displayName ?? "TEST",
      joinDate: serverTimestamp(),
      losses: 0,
      wins: 0,
      uid: userCred.user.uid,
      photoURL: undefined,
    });
  }
}
