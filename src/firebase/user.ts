import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  QueryDocumentSnapshot,
  serverTimestamp,
  setDoc,
  updateDoc,
  type SnapshotOptions,
  type Unsubscribe,
} from "firebase/firestore";
import { AUTH, DB } from ".";
import type { FirebaseUser } from "../models/user";
import { readonly, writable } from "svelte/store";
import { firebaseAuthUser } from "../models/stores";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";

export const userConverter = {
  fromFirestore(
    snapshot: QueryDocumentSnapshot,
    options: SnapshotOptions,
  ): FirebaseUser {
    const data = snapshot.data(options)!;    

    return {
      displayName: data.displayName,
      joinDate: data.joinDate,
      losses: data.losses,
      wins: data.wins,
      photoURL: data.photUrl === null ? undefined : data.photoURL,
      uid: snapshot.id,
    };
  },
  toFirestore(user: FirebaseUser) {
    const { uid, ...rest } = user;

    return {
      ...rest,
      photoURL: user.photoURL ?? null,
    };
  },
};
export const userCollection = collection(DB, "users").withConverter(userConverter);
export const currentUserRef = doc(userCollection, getAuth().currentUser?.uid)
const currentUserWritable = writable<FirebaseUser | null>(null);
export const currentUser = readonly(currentUserWritable);

let off: null | Unsubscribe = null;
// Updates the state of `currentUser` to whatever is in firebase, making sure to get rid of the listener if the auth state
// changes
firebaseAuthUser.subscribe((firebaseAuthUser) => {
  if (off !== null) off();
  if (firebaseAuthUser === null) {
    off = null;
    return;
  }
  // otherwise add the listener
  off = onSnapshot(doc(userCollection, firebaseAuthUser.uid), (snapshot) => {
    currentUserWritable.set(snapshot.data() ?? null);
    // updateDoc
  });
});;

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
