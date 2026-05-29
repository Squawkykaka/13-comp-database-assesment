import {
  collection,
  doc,
  getDoc,
  QueryDocumentSnapshot,
  serverTimestamp,
  setDoc,
  type SnapshotOptions,
} from "firebase/firestore";
import { AUTH, DB } from ".";
import type { FirebaseUser } from "../models/user";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";

export const userConverter = {
  fromFirestore(snapshot: QueryDocumentSnapshot, options: SnapshotOptions): FirebaseUser {
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
    return {
      ...user,
      photoURL: user.photoURL ?? null,
    };
  },
};
export const userCollection = collection(DB, "users").withConverter(userConverter);

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
