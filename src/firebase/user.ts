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
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import type { GameUser } from "../models/user";

export const userConverter = {
  fromFirestore(
    snapshot: QueryDocumentSnapshot,
    options: SnapshotOptions,
  ): GameUser {
    const data = snapshot.data(options)!;

    return {
      displayName: data.displayName,
      joinDate: data.joinDate,
      quote: "",
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
    };
  },
};
export const userCollection = collection(DB, "users").withConverter(
  userConverter,
);

export async function signInGoogle() {
  const userCred = await signInWithPopup(AUTH, new GoogleAuthProvider());
  let ref = doc(userCollection, userCred.user.uid);

  let document = await getDoc(ref);
  let data = document.data();
  if (data === undefined) {
    console.log("MAKING DUMMY USER");
    await setDoc(ref.withConverter(null), {
      displayName: userCred.user.displayName ?? "TEST",
      joinDate: serverTimestamp(),
      quote: "",
      photoURL: userCred.user.photoURL
    });
  }
}
